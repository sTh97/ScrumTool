import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';

export default function SchemaComparisonList() {
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 0 });
  const nav = useNavigate();

  useEffect(()=>{ axios.get('/projects').then(r=>setProjects(r.data||[])); },[]);
  useEffect(()=>{
    axios.get('/schemas/comparisons', { params: { project, q, page, limit: 10 } })
      .then(r=>setData(r.data));
  }, [project, q, page]);

  const onDelete = async (id) => {
    if (!window.confirm('Delete this comparison?')) return;
    await axios.delete(`/schemas/comparisons/${id}`);
    // refresh
    axios.get('/schemas/comparisons', { params: { project, q, page, limit: 10 } })
      .then(r=>setData(r.data));
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-3">
        <select className="border rounded p-2" value={project} onChange={e=>{setPage(1); setProject(e.target.value);}}>
          <option value="">All Projects</option>
          {projects.map(p=> <option key={p._id||p.id} value={p._id||p.id}>{p.name}</option>)}
        </select>
        <input className="border rounded p-2 flex-1" placeholder="Search by labels or notes" value={q} onChange={e=>{setPage(1); setQ(e.target.value);}}/>
        <button className="border rounded px-3" onClick={()=>nav('/schema/compare')}>+ New Comparison</button>
      </div>

      <div className="bg-white rounded-2xl shadow divide-y">
        {data.items.map(c => (
          <div key={c._id} className="p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{c.leftLabel || c.leftSnapshot?.name || 'Left'} vs {c.rightLabel || c.rightSnapshot?.name || 'Right'}</div>
              <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <Link to={`/schema/comparisons/${c._id}`} className="text-sm px-3 py-1 border rounded">View</Link>
              <button onClick={()=>onDelete(c._id)} className="text-sm px-3 py-1 border rounded text-red-600">Delete</button>
            </div>
          </div>
        ))}
        {!data.items.length && <div className="p-4 text-sm text-gray-500">No comparisons found.</div>}
      </div>

      <div className="flex items-center justify-between text-sm mt-2">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
        <div>Page {data.page} of {data.pages}</div>
        <button disabled={page>=data.pages} onClick={()=>setPage(p=>p+1)} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
