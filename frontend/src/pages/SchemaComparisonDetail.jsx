import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import SchemaDiffViewer from '../components/SchemaDiffViewer';

export default function SchemaComparisonDetail(){
  const { id } = useParams();
  const [data, setData] = useState(null);

  // Update form state
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [leftType, setLeftType] = useState('auto');
  const [rightType, setRightType] = useState('auto');
  const [leftLabel, setLeftLabel] = useState('');
  const [rightLabel, setRightLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [previewDiff, setPreviewDiff] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(()=>{
    axios.get(`/schemas/comparisons/${id}`).then(r=>{
      setData(r.data);
      setLeftLabel(r.data.leftLabel || 'Left');
      setRightLabel(r.data.rightLabel || 'Right');
      setNotes(r.data.notes || '');
    });
  }, [id]);

  const preview = async () => {
    try {
      setPreviewDiff(null);
      const body = {
        left: leftText.trim() ? { text: leftText, formatHint: leftType } : { snapshotId: data.leftSnapshot?._id },
        right: rightText.trim() ? { text: rightText, formatHint: rightType } : { snapshotId: data.rightSnapshot?._id },
      };
      const { data: resp } = await axios.post('/schemas/compare/preview', body);
      setPreviewDiff(resp.diff);
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const applyUpdate = async () => {
    try {
      setUpdating(true);
      const body = {
        leftLabel, rightLabel, notes,
        left: leftText.trim() ? { text: leftText, formatHint: leftType, name: leftLabel } : undefined,
        right: rightText.trim() ? { text: rightText, formatHint: rightType, name: rightLabel } : undefined,
      };
      const { data: resp } = await axios.patch(`/schemas/comparisons/${id}`, body);
      setData(resp);
      setPreviewDiff(null);
      alert('Comparison updated.');
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!data) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="text-lg font-semibold">{data.leftLabel} ↔ {data.rightLabel}</div>
        <div className="text-xs text-gray-500">{new Date(data.createdAt).toLocaleString()}</div>
        {data.notes && <div className="mt-2 text-sm">{data.notes}</div>}
      </div>

      <SchemaDiffViewer diff={data.diff} leftLabel={data.leftLabel} rightLabel={data.rightLabel} />

      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <div className="text-sm font-semibold">Re-run / Update</div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Left Label</label>
              <select className="border rounded px-2 py-1 text-xs" value={leftType} onChange={e=>setLeftType(e.target.value)}>
                <option value="auto">Auto</option><option value="sql">SQL</option><option value="json">JSON</option>
              </select>
            </div>
            <input className="w-full border rounded p-2 text-sm mt-1" value={leftLabel} onChange={e=>setLeftLabel(e.target.value)} />
            <textarea rows={8} className="w-full border rounded p-2 text-sm font-mono mt-2" placeholder="Paste new left schema (or leave blank to reuse existing snapshot)"
              value={leftText} onChange={e=>setLeftText(e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Right Label</label>
              <select className="border rounded px-2 py-1 text-xs" value={rightType} onChange={e=>setRightType(e.target.value)}>
                <option value="auto">Auto</option><option value="sql">SQL</option><option value="json">JSON</option>
              </select>
            </div>
            <input className="w-full border rounded p-2 text-sm mt-1" value={rightLabel} onChange={e=>setRightLabel(e.target.value)} />
            <textarea rows={8} className="w-full border rounded p-2 text-sm font-mono mt-2" placeholder="Paste new right schema (or leave blank to reuse existing snapshot)"
              value={rightText} onChange={e=>setRightText(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium">Notes</label>
          <textarea className="w-full border rounded p-2 text-sm mt-1" rows={3}
            value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <button onClick={preview} className="px-3 py-2 border rounded">Preview new diff</button>
          <button onClick={applyUpdate} disabled={updating} className="px-4 py-2 rounded-2xl bg-black text-white disabled:opacity-50">
            {updating ? 'Updating…' : 'Save Update'}
          </button>
        </div>

        {previewDiff && (
          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Preview Differences</div>
            <SchemaDiffViewer diff={previewDiff} leftLabel={leftLabel} rightLabel={rightLabel} />
          </div>
        )}
      </div>
    </div>
  );
}
