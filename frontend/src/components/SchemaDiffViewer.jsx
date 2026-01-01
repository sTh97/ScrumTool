import React, { useState } from 'react';

export default function SchemaDiffViewer({ diff, leftLabel = 'Left', rightLabel = 'Right' }) {
  // ✅ Hooks must be called unconditionally and before any early returns
  const [showAdded, setShowAdded] = useState(true);
  const [showRemoved, setShowRemoved] = useState(true);
  const [showChanged, setShowChanged] = useState(true);

  // Safe early return AFTER hooks
  if (!diff) return null;

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-2xl shadow p-4 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="text-xs text-gray-500">
          {title.includes('Added') && (
            <span className="px-2 py-0.5 rounded-full bg-green-50 border text-green-700">
              Present only in {rightLabel}
            </span>
          )}
          {title.includes('Removed') && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 border text-amber-700">
              Present only in {leftLabel}
            </span>
          )}
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-xs">
        <button onClick={() => setShowAdded(v => !v)} className="border rounded px-2 py-1">
          {showAdded ? 'Hide' : 'Show'} Added ({rightLabel})
        </button>
        <button onClick={() => setShowRemoved(v => !v)} className="border rounded px-2 py-1">
          {showRemoved ? 'Hide' : 'Show'} Removed ({leftLabel})
        </button>
        <button onClick={() => setShowChanged(v => !v)} className="border rounded px-2 py-1">
          {showChanged ? 'Hide' : 'Show'} Changed
        </button>
      </div>

      {showAdded && (
        <Section title="Tables Added (in Right only)">
          {diff.tablesAdded?.length ? (
            <ul className="list-disc ml-6">
              {diff.tablesAdded.map(t => (
                <li key={t}>
                  <code>{t}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">None</p>
          )}
        </Section>
      )}

      {showRemoved && (
        <Section title="Tables Removed (present in Left only)">
          {diff.tablesRemoved?.length ? (
            <ul className="list-disc ml-6">
              {diff.tablesRemoved.map(t => (
                <li key={t}>
                  <code>{t}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">None</p>
          )}
        </Section>
      )}

      {showChanged && (
        <Section title="Tables Changed">
          {diff.tablesChanged?.length ? (
            diff.tablesChanged.map(tc => (
              <div key={tc.table} className="mb-4">
                <div className="font-medium text-gray-800 mb-1">
                  <code>{tc.table}</code>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs font-semibold">Columns Added (only in {rightLabel})</div>
                    {tc.columnsAdded?.length ? (
                      <ul className="list-disc ml-6 text-sm">
                        {tc.columnsAdded.map(c => (
                          <li key={c.name}>
                            <code>{c.name}</code>{' '}
                            <span className="text-gray-500">{c.new?.type}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-500">None</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Columns Removed (only in {leftLabel})</div>
                    {tc.columnsRemoved?.length ? (
                      <ul className="list-disc ml-6 text-sm">
                        {tc.columnsRemoved.map(c => (
                          <li key={c.name}>
                            <code>{c.name}</code>{' '}
                            <span className="text-gray-500">{c.old?.type}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-500">None</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Columns Changed</div>
                    {tc.columnsChanged?.length ? (
                      <ul className="list-disc ml-6 text-sm">
                        {tc.columnsChanged.map(c => (
                          <li key={c.name}>
                            <code>{c.name}</code>
                            <div className="text-xs text-gray-600">
                              {c.changes?.type && (
                                <div>
                                  Type: <span className="line-through">{c.changes.type.from || '∅'}</span> →{' '}
                                  <span className="font-medium">{c.changes.type.to || '∅'}</span>
                                </div>
                              )}
                              {c.changes?.nullable && (
                                <div>
                                  Nullable: {String(c.changes.nullable.from)} →{' '}
                                  <span className="font-medium">{String(c.changes.nullable.to)}</span>
                                </div>
                              )}
                              {c.changes?.default && (
                                <div>
                                  Default:{' '}
                                  <span className="line-through">{String(c.changes.default.from)}</span> →{' '}
                                  <span className="font-medium">{String(c.changes.default.to)}</span>
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-500">None</div>
                    )}
                  </div>
                </div>
                {tc.indexes?.from || tc.indexes?.to ? (
                  <div className="mt-2 text-xs">
                    <div className="font-semibold">Indexes</div>
                    <pre className="bg-gray-50 p-2 rounded overflow-auto text-[11px]">
                      {JSON.stringify(tc.indexes, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">None</p>
          )}
        </Section>
      )}
    </div>
  );
}
