// utils/schemaParser.js

// ---------- Shared helpers ----------
const normalizeType = (t) => (t || '').toLowerCase().replace(/\s+/g, ' ').trim();

function stripBracketsQuotes(id = '') {
  // remove [x], "x", `x`
  return id.replace(/^[\[\"`]|[\]\"`]$/g, '');
}

// Split top-level comma segments inside (...) ignoring inner commas
function splitTopLevelCommas(s) {
  const parts = [];
  let depth = 0, cur = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

// Robust buffer → text (handles UTF-16 LE SQL Server exports)
function bufferToText(buf) {
  if (!Buffer.isBuffer(buf)) return String(buf || '');
  const b0 = buf[0], b1 = buf[1];
  // BOM: FF FE (LE) or FE FF (BE)
  if ((b0 === 0xFF && b1 === 0xFE) || (b0 === 0xFE && b1 === 0xFF)) {
    return buf.toString('utf16le');
  }
  // Heuristic: many null bytes → utf16le
  let zeros = 0; const n = Math.min(buf.length, 4096);
  for (let i = 0; i < n; i++) if (buf[i] === 0) zeros++;
  if (zeros > n * 0.2) return buf.toString('utf16le');
  return buf.toString('utf8');
}

// ---------- SQL Parsing (SQL Server / MySQL / Postgres) ----------
function parseSQL(sql) {
  const tables = {};

  // Strip comments + batch separators
  let cleaned = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\bGO\b/gi, '\n');

  // CREATE TABLE with optional schema + any quoting:
  //  - [dbo].[T], "schema"."T", `schema`.`T`, dbo.T, [T], "T", `T`, T
  // Captures table name in group (2|4|6|7) and body in group 8
  const createTableRegex =
    /create\s+table\s+(?:(?:\[\s*\w+\s*\]|\`\s*\w+\s*\`|\"\s*[\w$#]+\s*\"\s*|\w+)\s*\.\s*)?(?:\[\s*([\w$#]+)\s*\]|\"\s*([\w$#]+)\s*\"|\`\s*([\w$#]+)\s*\`|([\w$#]+))\s*\(\s*([\s\S]*?)\s*\)\s*(?:on\s+\[[^\]]+\])?(?:\s*textimage_on\s+\[[^\]]+\])?/gi;

  let m;
  while ((m = createTableRegex.exec(cleaned)) !== null) {
    const rawName = m[1] || m[2] || m[3] || m[4];
    const tableName = stripBracketsQuotes(rawName);
    const body = m[5];

    const columns = {};
    const indexes = { primary: [], uniques: [], indexes: [] };

    const lines = splitTopLevelCommas(body);

    for (const lineRaw of lines) {
      const line = lineRaw.trim();
      if (!line) continue;

      // PRIMARY KEY (with/without CONSTRAINT, clustered/nonclustered)
      const pk = line.match(/primary\s+key\s*\(([^)]+)\)/i);
      if (pk) {
        pk[1].split(',').map(s => s.replace(/[\[\]\s`"]/g, '')).forEach(c => indexes.primary.push(c));
        continue;
      }

      // UNIQUE (UNIQUE, UNIQUE KEY/INDEX)
      const uq = line.match(/unique(?:\s+(?:key|index))?\s*(?:\[\w+\]|\`\w+\`|\"\w+\")?\s*\(([^)]+)\)/i);
      if (uq) {
        indexes.uniques.push(uq[1].split(',').map(s => s.replace(/[\[\]\s`"]/g, '')));
        continue;
      }

      // Secondary indexes (KEY/INDEX ... (cols)), skip primary already handled
      if (!/^constraint\s+/i.test(line)) {
        const idx = line.match(/\b(?:key|index)\b\s*(?:\[\w+\]|\`\w+\`|\"\w+\")?\s*\(([^)]+)\)/i);
        if (idx) {
          indexes.indexes.push(idx[1].split(',').map(s => s.replace(/[\[\]\s`"]/g, '')));
          continue;
        }
      }

      // Column definition: [Name] type ..., "Name" type ..., `Name` type ..., Name type ...
      // NOTE: handle computed columns (AS (...)) by skipping them
      if (/\bas\s*\(/i.test(line)) {
        // computed column: ignore as it's derived; can be added later if needed
        continue;
      }

      const colMatch = line.match(
        /^\s*(?:\[\s*([\w$#]+)\s*\]|\"\s*([\w$#]+)\s*\"|\`\s*([\w$#]+)\s*\`|([A-Za-z_][\w$#]*))\s+(.+)$/
      );
      if (colMatch) {
        const colName = stripBracketsQuotes(colMatch[1] || colMatch[2] || colMatch[3] || colMatch[4]);
        const rest = colMatch[5];

        // First token = data type (with optional (…))
        const typeMatch = rest.match(/^[\w]+(?:\s*\([^)]+\))?/);
        const type = normalizeType(typeMatch ? typeMatch[0] : rest.split(/\s+/)[0]);

        const nullable = !/\bnot\s+null\b/i.test(rest);
        // DEFAULT can be expression; capture token up to comma or end (rough but works well)
        const defM = rest.match(/\bdefault\s+((?:\([^\)]*\))|(?:'[^']*')|(?:\S+))/i);
        const defVal = defM ? defM[1].replace(/^'(.*)'$/, '$1') : undefined;

        columns[colName] = { type, nullable, default: defVal };
        continue;
      }
    }

    tables[tableName] = { columns, indexes };
  }

  return { tables };
}

// ---------- JSON Schema Parsing (normalized + Mongo) ----------
function parseJSONSchema(obj, fileName = '') {
  // Already normalized
  if (obj && obj.tables) return obj;

  // MongoDB-style: { collectionName: [docs], ... }
  // or a single array [docs] → infer a collection name from file
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const keys = Object.keys(obj);
    if (keys.length && Array.isArray(obj[keys[0]])) {
      const tables = {};
      for (const coll of keys) {
        tables[coll] = inferFromDocuments(obj[coll]);
      }
      return { tables };
    }
  }
  if (Array.isArray(obj)) {
    const base = (fileName || 'collection').replace(/\.[^.]+$/, '') || 'collection';
    const coll = base || 'collection';
    const tables = {};
    tables[coll] = inferFromDocuments(obj);
    return { tables };
  }

  throw new Error('Unsupported JSON schema shape');
}

function inferFromDocuments(docs = []) {
  // Build column map with inferred types & nullability
  const columns = {};
  const indexes = { primary: [], uniques: [], indexes: [] };

  // Gather all keys across docs; infer type union and nullability
  for (const doc of docs) {
    if (!doc || typeof doc !== 'object') continue;
    for (const [k, v] of Object.entries(flattenObject(doc))) {
      const col = columns[k] || { type: null, nullable: false, default: undefined };
      const t = inferType(v);
      col.type = mergeTypes(col.type, t); // union types simplified
      if (v === null || v === undefined) col.nullable = true;
      columns[k] = col;
    }
  }

  // If no docs, return empty
  return { columns, indexes };
}

function flattenObject(o, prefix = '') {
  // Dot-flatten nested fields so they show as "address.city"
  const out = {};
  if (!o || typeof o !== 'object') return out;
  for (const [k, v] of Object.entries(o)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      Object.assign(out, flattenObject(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

function inferType(v) {
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) return 'array';
  if (v instanceof Date) return 'date';
  switch (typeof v) {
    case 'string':   return guessStringSubtype(v);
    case 'number':   return Number.isInteger(v) ? 'int' : 'float';
    case 'bigint':   return 'bigint';
    case 'boolean':  return 'bool';
    case 'object':   return 'object';
    default:         return 'unknown';
  }
}

function guessStringSubtype(s) {
  // rudimentary: ISO date or ObjectId-like
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return 'date';
  if (/^[0-9a-fA-F]{24}$/.test(s)) return 'objectid';
  return 'string';
}

function mergeTypes(a, b) {
  if (!a) return b;
  if (a === b) return a;
  // collapse number unions
  if ((a === 'int' && b === 'float') || (a === 'float' && b === 'int')) return 'float';
  // generic union → `${a}|${b}` but keep it tidy
  const parts = new Set(String(a).split('|').concat(String(b).split('|')));
  return Array.from(parts).sort().join('|');
}

// ---------- Entry point ----------
function toNormalizedSchema(inputBuf, fileName = '') {
  const txt = bufferToText(inputBuf);

  // If file extension is clear, route by it. Otherwise try JSON first then SQL.
  if (/\.json$/i.test(fileName)) {
    const json = JSON.parse(txt);
    return { format: 'json', data: parseJSONSchema(json, fileName) };
  }
  if (/\.sql$/i.test(fileName)) {
    return { format: 'sql', data: parseSQL(txt) };
  }

  // Auto-detect
  try {
    const json = JSON.parse(txt);
    return { format: 'json', data: parseJSONSchema(json, fileName) };
  } catch (_) {
    return { format: 'sql', data: parseSQL(txt) };
  }
}

module.exports = { toNormalizedSchema };
