function diffSchemas(left, right) {
  const leftTables = left.tables || {};
  const rightTables = right.tables || {};
  const allTableNames = Array.from(new Set([...Object.keys(leftTables), ...Object.keys(rightTables)])).sort();
  const tablesAdded = [];
  const tablesRemoved = [];
  const tablesChanged = [];

  for (const t of allTableNames) {
    const lt = leftTables[t];
    const rt = rightTables[t];
    if (!lt && rt) { tablesAdded.push(t); continue; }
    if (lt && !rt) { tablesRemoved.push(t); continue; }
    // compare columns
    const lcols = lt.columns || {};
    const rcols = rt.columns || {};
    const allCols = Array.from(new Set([...Object.keys(lcols), ...Object.keys(rcols)])).sort();
    const columnsAdded = [];
    const columnsRemoved = [];
    const columnsChanged = [];
    for (const c of allCols) {
      const lc = lcols[c];
      const rc = rcols[c];
      if (!lc && rc) { columnsAdded.push({ name: c, new: rc }); continue; }
      if (lc && !rc) { columnsRemoved.push({ name: c, old: lc }); continue; }
      const changes = {};
      if ((lc.type||'') !== (rc.type||'')) changes.type = { from: lc.type, to: rc.type };
      if (!!lc.nullable !== !!rc.nullable) changes.nullable = { from: !!lc.nullable, to: !!rc.nullable };
      const d1 = lc.default === undefined ? null : lc.default;
      const d2 = rc.default === undefined ? null : rc.default;
      if (d1 !== d2) changes.default = { from: d1, to: d2 };
      if (Object.keys(changes).length) columnsChanged.push({ name: c, changes });
    }
    // indexes (simple compare by json)
    const idxDiff = {};
    if (JSON.stringify(lt.indexes||{}) !== JSON.stringify(rt.indexes||{})) {
      idxDiff.from = lt.indexes || {};
      idxDiff.to = rt.indexes || {};
    }
    if (columnsAdded.length || columnsRemoved.length || columnsChanged.length || Object.keys(idxDiff).length) {
      tablesChanged.push({ table: t, columnsAdded, columnsRemoved, columnsChanged, indexes: idxDiff });
    }
  }
  return { tablesAdded, tablesRemoved, tablesChanged };
}
module.exports = { diffSchemas };