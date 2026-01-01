import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axiosInstance';
import SchemaDiffViewer from '../components/SchemaDiffViewer';

function SideInput({ title, side, projects, project, setProject, label, setLabel, text, setText, file, setFile, snap, setSnap, snapData, snapQuery, setSnapQuery, snapPage, setSnapPage, schemaType, setSchemaType }) {
  // Read file and push its text into textarea as well
  const onFile = (f) => {
    setFile(f || null);
    if (!f) return;
    const reader = new FileReader();
    // Try as text; browsers detect BOM for UTF-16 automatically
    reader.onload = () => setText(String(reader.result || ''));
    reader.readAsText(f);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">{title}</div>
        <div className="flex items-center gap-2">
          <select className="border rounded px-2 py-1 text-xs" title="Schema type hint"
            value={schemaType} onChange={e=>setSchemaType(e.target.value)}>
            <option value="auto">Auto</option>
            <option value="sql">SQL</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>

      <label className="text-xs font-medium">Label (optional)</label>
      <input className="mt-1 w-full border rounded p-2 text-sm" value={label} onChange={e=>setLabel(e.target.value)} placeholder={`e.g., ${side==='left'?'Prod':'UAT'}`} />

      <div className="mt-3 grid gap-3">
        <div>
          <div className="text-xs font-medium mb-1">Paste schema</div>
          <textarea rows={10} className="w-full border rounded p-2 text-sm font-mono"
            placeholder={schemaType==='json' ? '{ "collection": [ { "name": "Alice" } ] }' : 'CREATE TABLE ...'}
            value={text}
            onChange={e=>setText(e.target.value)}
          />
        </div>
        <div>
          <div className="text-xs font-medium mb-1">Or upload a file (we’ll also show it in the box above)</div>
          <input type="file" accept=".sql,.json,.txt" onChange={e=>onFile(e.target.files?.[0]||null)} />
        </div>

        <div className="text-xs text-gray-500">Or pick an existing snapshot</div>
        <div className="mt-2 border-t pt-2">
          <div className="flex items-center gap-2 mb-2">
            <input className="border rounded px-2 py-1 text-sm" placeholder="Search name/file" value={snapQuery} onChange={e=>{setSnapPage(1); setSnapQuery(e.target.value);}} />
            <button className="text-sm border rounded px-2 py-1" onClick={()=>setSnapPage(1)}>Search</button>
          </div>
          <div className="max-h-64 overflow-auto divide-y">
            {snapData.items.map(s => (
              <label key={s._id} className={`flex items-center justify-between py-2 cursor-pointer ${snap?._id===s._id ? (side==='left'?'bg-blue-50':'bg-green-50') : ''}`}>
                <div className="text-sm">
                  <div className="font-medium">{s.name || s.fileName}</div>
                  <div className="text-xs text-gray-500">{s.format.toUpperCase()} · {new Date(s.createdAt).toLocaleString()}</div>
                </div>
                <input type="radio" name={`${side}Snap`} checked={snap?._id===s._id} onChange={()=>setSnap(s)} />
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <button disabled={snapPage<=1} onClick={()=>setSnapPage(p=>p-1)} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
            <div>Page {snapData.page} of {snapData.pages}</div>
            <button disabled={snapPage>=snapData.pages} onClick={()=>setSnapPage(p=>p+1)} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SchemaCompare() {
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState('');

  // Left side
  const [leftLabel, setLeftLabel] = useState('');
  const [leftText, setLeftText] = useState('');
  const [leftFile, setLeftFile] = useState(null);
  const [leftSnap, setLeftSnap] = useState(null);
  const [leftType, setLeftType] = useState('auto');

  // Right side
  const [rightLabel, setRightLabel] = useState('');
  const [rightText, setRightText] = useState('');
  const [rightFile, setRightFile] = useState(null);
  const [rightSnap, setRightSnap] = useState(null);
  const [rightType, setRightType] = useState('auto');

  // Snapshots listing
  const [snapQuery, setSnapQuery] = useState('');
  const [snapPage, setSnapPage] = useState(1);
  const [snapData, setSnapData] = useState({ items: [], total: 0, pages: 0, page: 1 });

  // Notes + diff
  const [notes, setNotes] = useState('');
  const [diff, setDiff] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    axios.get('/projects').then(r => setProjects(r.data || [])).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!project) return;
    axios.get('/schemas/snapshots', { params: { page: snapPage, limit: 10, q: snapQuery, project } })
      .then(r => setSnapData(r.data))
      .catch(()=>{});
  }, [project, snapPage, snapQuery]);

  const canPreview = useMemo(() => {
    const leftReady = !!(leftSnap || leftText.trim());
    const rightReady = !!(rightSnap || rightText.trim());
    return project && leftReady && rightReady;
  }, [project, leftSnap, leftText, rightSnap, rightText]);

  const onPreview = async () => {
    try {
      if (!canPreview) return alert('Select a project and provide both sides (paste or snapshot).');

      setPreviewing(true);
      setSavedId(null);

      const body = {
        left: leftSnap ? { snapshotId: leftSnap._id } : { text: leftText, formatHint: leftType },
        right: rightSnap ? { snapshotId: rightSnap._id } : { text: rightText, formatHint: rightType }
      };
      const { data } = await axios.post('/schemas/compare/preview', body);
      setDiff(data.diff);
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setPreviewing(false);
    }
  };

  const onSave = async () => {
    try {
      if (!diff) return alert('Run Compare first.');
      const body = {
        project,
        leftLabel,
        rightLabel,
        notes,
        left: leftSnap ? { snapshotId: leftSnap._id } : { text: leftText, formatHint: leftType, name: leftLabel || 'Left' },
        right: rightSnap ? { snapshotId: rightSnap._id } : { text: rightText, formatHint: rightType, name: rightLabel || 'Right' },
      };
      const { data } = await axios.post('/schemas/compare', body);
      setSavedId(data._id);
      alert('Comparison saved.');
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const swapSides = () => {
    setLeftLabel(rightLabel); setRightLabel(leftLabel);
    setLeftText(rightText); setRightText(leftText);
    setLeftFile(rightFile); setRightFile(leftFile);
    setLeftSnap(rightSnap); setRightSnap(leftSnap);
    setLeftType(rightType); setRightType(leftType);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="grid md:grid-cols-3 gap-4 items-start">
        <div className="bg-white rounded-2xl shadow p-4 md:col-span-1">
          <label className="text-sm font-medium">Project</label>
          <select className="mt-1 w-full border rounded p-2" value={project} onChange={e=>setProject(e.target.value)}>
            <option value="">Select project…</option>
            {projects.map(p => <option key={p._id||p.id} value={p._id||p.id}>{p.name}</option>)}
          </select>

          <div className="mt-4">
            <label className="text-sm font-medium">Notes (optional)</label>
            <textarea className="mt-1 w-full border rounded p-2 text-sm" rows={4}
              value={notes} onChange={e=>setNotes(e.target.value)}
              placeholder="Context about this comparison" />
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={onPreview} disabled={!canPreview || previewing}
              className="px-4 py-2 rounded-2xl bg-black text-white disabled:opacity-50">
              {previewing ? 'Comparing…' : 'Compare'}
            </button>
            <button onClick={swapSides}
              className="px-3 py-2 rounded-2xl border">
              Swap ↔
            </button>
          </div>

          {diff && (
            <div className="mt-3">
              <button onClick={onSave} className="px-4 py-2 rounded-2xl bg-emerald-600 text-white">Save Comparison</button>
              {savedId && (
                <a className="ml-2 text-sm underline" href={`/schema/comparisons/${savedId}`}>View saved</a>
              )}
            </div>
          )}
        </div>

        <SideInput
          title="Left Schema"
          side="left"
          projects={projects}
          project={project}
          setProject={setProject}
          label={leftLabel}
          setLabel={setLeftLabel}
          text={leftText}
          setText={setLeftText}
          file={leftFile}
          setFile={setLeftFile}
          snap={leftSnap}
          setSnap={setLeftSnap}
          snapData={snapData}
          snapQuery={snapQuery}
          setSnapQuery={setSnapQuery}
          snapPage={snapPage}
          setSnapPage={setSnapPage}
          schemaType={leftType}
          setSchemaType={setLeftType}
        />

        <SideInput
          title="Right Schema"
          side="right"
          projects={projects}
          project={project}
          setProject={setProject}
          label={rightLabel}
          setLabel={setRightLabel}
          text={rightText}
          setText={setRightText}
          file={rightFile}
          setFile={setRightFile}
          snap={rightSnap}
          setSnap={setRightSnap}
          snapData={snapData}
          snapQuery={snapQuery}
          setSnapQuery={setSnapQuery}
          snapPage={snapPage}
          setSnapPage={setSnapPage}
          schemaType={rightType}
          setSchemaType={setRightType}
        />
      </div>

      {diff && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Differences</h2>
          <SchemaDiffViewer diff={diff} leftLabel={leftLabel || 'Left'} rightLabel={rightLabel || 'Right'} />
        </div>
      )}
    </div>
  );
}
