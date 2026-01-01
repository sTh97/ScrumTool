const fs = require('fs/promises');
const SchemaSnapshot = require('../models/SchemaSnapshot');
const SchemaComparison = require('../models/SchemaComparison');
const { toNormalizedSchema } = require('../utils/schemaParser');
const { diffSchemas } = require('../utils/schemaDiff');

// ---------- helpers ----------
function parseFromText(text, formatHint = 'auto') {
  const pseudo =
    formatHint === 'json' ? 'pasted.json' :
    formatHint === 'sql' ? 'pasted.sql' : 'pasted.txt';
  const buf = Buffer.isBuffer(text) ? text : Buffer.from(String(text || ''), 'utf8');
  return toNormalizedSchema(buf, pseudo);
}

async function resolveSchemaSpec(spec = {}) {
  // spec: { snapshotId? | text?, formatHint? }
  if (spec.snapshotId) {
    const snap = await SchemaSnapshot.findById(spec.snapshotId);
    if (!snap) throw new Error('Snapshot not found');
    if (!snap.schemaJson || !snap.schemaJson.tables) throw new Error('Snapshot has no parsed schema');
    return { source: 'snapshot', format: snap.format, data: snap.schemaJson, snapshot: snap };
  }
  if (spec.text) {
    const parsed = parseFromText(spec.text, spec.formatHint);
    if (!parsed?.data?.tables) throw new Error('Parsed schema has no tables');
    return { source: 'text', format: parsed.format, data: parsed.data, snapshot: null };
  }
  throw new Error('Either snapshotId or text is required');
}

// ---------- snapshots ----------
exports.uploadSnapshot = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { project, name = '', side = '' } = req.body;
    if (!project) return res.status(400).json({ message: 'project is required' });

    const buf =
      typeof req.file.buffer !== 'undefined'
        ? req.file.buffer
        : (req.file.path ? await fs.readFile(req.file.path) : null);

    if (!buf) {
      return res.status(400).json({
        message: 'Unable to read uploaded file. If using disk storage, ensure req.file.path is available.',
      });
    }

    let parsed;
    try {
      parsed = toNormalizedSchema(buf, req.file.originalname);
    } catch (e) {
      return res.status(400).json({ message: `Failed to parse "${req.file.originalname}": ${e.message}` });
    }

    const tables = parsed?.data?.tables || {};
    const tableCount = Object.keys(tables).length;
    if (tableCount === 0) {
      return res.status(400).json({
        message:
          `No structures detected in "${req.file.originalname}". ` +
          `Upload SQL DDL (CREATE TABLE …) or a JSON schema/export.`,
      });
    }

    const doc = await SchemaSnapshot.create({
      project,
      name,
      side: ['left','right'].includes(side) ? side : '',
      fileName: req.file.originalname,
      format: parsed.format,
      schemaJson: parsed.data,
      createdBy: req.user.id,
    });
    return res.json({ ...doc.toObject(), _meta: { parsedTables: tableCount } });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.listSnapshots = async (req, res) => {
  try {
    const { page = 1, limit = 10, q = '', project } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (q) filter.$text = { $search: q };
    const skip = (parseInt(page,10)-1) * parseInt(limit,10);
    const [items, total] = await Promise.all([
      SchemaSnapshot.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit,10)),
      SchemaSnapshot.countDocuments(filter)
    ]);
    res.json({ items, total, page: parseInt(page,10), pages: Math.ceil(total/parseInt(limit,10)) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// 🔹 optional helper: snapshot from pasted text
exports.createSnapshotFromText = async (req, res) => {
  try {
    const { project, text = '', name = '', side = '', formatHint = 'auto' } = req.body;
    if (!project) return res.status(400).json({ message: 'project is required' });
    if (!text.trim()) return res.status(400).json({ message: 'text is required' });

    const parsed = parseFromText(text, formatHint);
    const tables = parsed?.data?.tables || {};
    if (!Object.keys(tables).length) return res.status(400).json({ message: 'No structures detected from pasted text.' });

    const doc = await SchemaSnapshot.create({
      project,
      name,
      side: ['left','right'].includes(side) ? side : '',
      fileName: name ? `${name}.${parsed.format}` : `pasted-${Date.now()}.${parsed.format}`,
      format: parsed.format,
      schemaJson: parsed.data,
      createdBy: req.user.id,
    });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// ---------- compare (preview & save) ----------
exports.previewCompare = async (req, res) => {
  try {
    const { left = {}, right = {} } = req.body;
    const L = await resolveSchemaSpec(left);
    const R = await resolveSchemaSpec(right);
    const diff = diffSchemas(L.data, R.data);
    res.json({ diff, left: { source: L.source, format: L.format }, right: { source: R.source, format: R.format } });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Backward compatible: also supports { left:{snapshotId|text}, right:{...} }
exports.compare = async (req, res) => {
  try {
    // back-compat body
    if (req.body.leftSnapshotId && req.body.rightSnapshotId) {
      const { leftSnapshotId, rightSnapshotId, leftLabel = '', rightLabel = '', project, notes = '' } = req.body;
      const [left, right] = await Promise.all([
        SchemaSnapshot.findById(leftSnapshotId),
        SchemaSnapshot.findById(rightSnapshotId)
      ]);
      if (!left || !right) return res.status(404).json({ message: 'Snapshot not found' });
      if (!left?.schemaJson?.tables || !right?.schemaJson?.tables) {
        return res.status(400).json({ message: 'Parsed schema has no tables. Ensure your data is valid.' });
      }
      const diff = diffSchemas(left.schemaJson, right.schemaJson);
      const saved = await SchemaComparison.create({
        project: project || left.project,
        leftSnapshot: left._id,
        rightSnapshot: right._id,
        leftLabel: leftLabel || left.name || 'Left',
        rightLabel: rightLabel || right.name || 'Right',
        diff,
        notes,
        createdBy: req.user.id
      });
      return res.json(saved);
    }

    // new flexible body
    const { project, left = {}, right = {}, leftLabel = '', rightLabel = '', notes = '' } = req.body;
    if (!project) return res.status(400).json({ message: 'project is required' });

    // resolve/create snapshots
    let leftSnap, rightSnap, L, R;

    if (left.snapshotId) {
      L = await resolveSchemaSpec({ snapshotId: left.snapshotId });
      leftSnap = L.snapshot;
    } else if (left.text) {
      L = await resolveSchemaSpec({ text: left.text, formatHint: left.formatHint });
      leftSnap = await SchemaSnapshot.create({
        project, name: left.name || leftLabel || 'Left', side: 'left',
        fileName: (left.name || 'pasted-left') + '.' + L.format,
        format: L.format, schemaJson: L.data, createdBy: req.user.id,
      });
    } else {
      return res.status(400).json({ message: 'left.snapshotId or left.text is required' });
    }

    if (right.snapshotId) {
      R = await resolveSchemaSpec({ snapshotId: right.snapshotId });
      rightSnap = R.snapshot;
    } else if (right.text) {
      R = await resolveSchemaSpec({ text: right.text, formatHint: right.formatHint });
      rightSnap = await SchemaSnapshot.create({
        project, name: right.name || rightLabel || 'Right', side: 'right',
        fileName: (right.name || 'pasted-right') + '.' + R.format,
        format: R.format, schemaJson: R.data, createdBy: req.user.id,
      });
    } else {
      return res.status(400).json({ message: 'right.snapshotId or right.text is required' });
    }

    const diff = diffSchemas(leftSnap.schemaJson, rightSnap.schemaJson);
    const saved = await SchemaComparison.create({
      project,
      leftSnapshot: leftSnap._id,
      rightSnapshot: rightSnap._id,
      leftLabel: leftLabel || leftSnap.name || 'Left',
      rightLabel: rightLabel || rightSnap.name || 'Right',
      diff,
      notes,
      createdBy: req.user.id
    });
    res.json(saved);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.listComparisons = async (req, res) => {
  try {
    const { page = 1, limit = 10, q = '', project } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (q) filter.$text = { $search: q };
    const skip = (parseInt(page,10)-1) * parseInt(limit,10);
    const [items, total] = await Promise.all([
      SchemaComparison.find(filter)
        .populate('leftSnapshot', 'name fileName')
        .populate('rightSnapshot', 'name fileName')
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit,10)),
      SchemaComparison.countDocuments(filter)
    ]);
    res.json({ items, total, page: parseInt(page,10), pages: Math.ceil(total/parseInt(limit,10)) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.getComparison = async (req, res) => {
  try {
    const c = await SchemaComparison.findById(req.params.id)
      .populate('leftSnapshot')
      .populate('rightSnapshot');
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.deleteComparison = async (req, res) => {
  try {
    await SchemaComparison.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

// 🔹 update existing comparison (optionally replace sides with new text/snapshots)
exports.updateComparison = async (req, res) => {
  try {
    const { left = {}, right = {}, leftLabel, rightLabel, notes, project } = req.body;
    const c = await SchemaComparison.findById(req.params.id)
      .populate('leftSnapshot')
      .populate('rightSnapshot');
    if (!c) return res.status(404).json({ message: 'Not found' });

    let leftSnap = c.leftSnapshot, rightSnap = c.rightSnapshot;

    if (left.snapshotId || left.text) {
      if (left.snapshotId) {
        const L = await resolveSchemaSpec({ snapshotId: left.snapshotId });
        leftSnap = L.snapshot;
      } else {
        const L = await resolveSchemaSpec({ text: left.text, formatHint: left.formatHint });
        leftSnap = await SchemaSnapshot.create({
          project: project || c.project,
          name: left.name || leftLabel || 'Left',
          side: 'left',
          fileName: (left.name || 'pasted-left') + '.' + L.format,
          format: L.format,
          schemaJson: L.data,
          createdBy: req.user.id,
        });
      }
    }

    if (right.snapshotId || right.text) {
      if (right.snapshotId) {
        const R = await resolveSchemaSpec({ snapshotId: right.snapshotId });
        rightSnap = R.snapshot;
      } else {
        const R = await resolveSchemaSpec({ text: right.text, formatHint: right.formatHint });
        rightSnap = await SchemaSnapshot.create({
          project: project || c.project,
          name: right.name || rightLabel || 'Right',
          side: 'right',
          fileName: (right.name || 'pasted-right') + '.' + R.format,
          format: R.format,
          schemaJson: R.data,
          createdBy: req.user.id,
        });
      }
    }

    const diff = diffSchemas(leftSnap.schemaJson, rightSnap.schemaJson);

    c.leftSnapshot = leftSnap._id;
    c.rightSnapshot = rightSnap._id;
    if (leftLabel !== undefined) c.leftLabel = leftLabel;
    if (rightLabel !== undefined) c.rightLabel = rightLabel;
    if (notes !== undefined) c.notes = notes;
    if (project) c.project = project;
    c.diff = diff;
    await c.save();

    const updated = await SchemaComparison.findById(c._id)
      .populate('leftSnapshot')
      .populate('rightSnapshot');
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
