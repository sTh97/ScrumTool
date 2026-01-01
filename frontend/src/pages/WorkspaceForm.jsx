// // src/pages/WorkspaceForm.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "../api/axiosInstance";

// export default function WorkspaceForm() {
//   const { id } = useParams();        // if present → edit mode
//   const navigate = useNavigate();
//   const editing = Boolean(id);

//   const [form, setForm] = useState({
//     name: "",
//     code: "",
//     description: "",
//     startDate: "",
//     endDate: "",
//   });
//   const [loading, setLoading] = useState(editing);
//   const [msg, setMsg] = useState({ type: "", text: "" });

//   const toast = (text, type = "ok") => {
//     setMsg({ type, text });
//     setTimeout(() => setMsg({ type: "", text: "" }), 2500);
//   };

//   useEffect(() => {
//     if (!editing) return;
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(`/projects/${id}`);
//         const p = res.data?.project || res.data || {};
//         setForm({
//           name: p.name || "",
//           code: p.code || "",
//           description: p.description || "",
//           startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0,10) : "",
//           endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0,10) : "",
//         });
//       } catch (e) {
//         toast(e?.response?.data?.message || e.message || "Failed to load workspace", "err");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [editing, id]);

//   const submit = async (e) => {
//     e.preventDefault();
//     try {
//       if (!form.name.trim()) return toast("Name is required", "err");

//       const payload = {
//         name: form.name.trim(),
//         code: form.code.trim() || undefined,
//         description: form.description.trim(),
//         startDate: form.startDate || undefined,
//         endDate: form.endDate || undefined,
//       };

//       if (editing) {
//         await axios.put(`/projects/${id}`, payload);
//         toast("Workspace updated");
//         navigate(`/projects/${id}`);
//       } else {
//         const res = await axios.post(`/projects`, payload);
//         const created = res.data?.project || res.data;
//         toast("Workspace created");
//         if (created?._id) {
//           navigate(`/projects/${created._id}`);
//         } else {
//           navigate("/workspaces");
//         }
//       }
//     } catch (e) {
//       toast(e?.response?.data?.message || e.message || "Save failed", "err");
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold">{editing ? "Edit Workspace" : "Create Workspace"}</h2>
//         <button onClick={() => navigate(-1)} className="px-3 py-1.5 rounded-md bg-gray-800 text-gray-100 hover:bg-gray-700">
//           Back
//         </button>
//       </div>

//       {msg.text && (
//         <div className={`mt-3 rounded-md px-3 py-2 ${msg.type === "err" ? "bg-rose-950/40 border border-rose-800 text-rose-200" : "bg-green-950/40 border border-green-800 text-green-200"}`}>
//           {msg.text}
//         </div>
//       )}

//       <form onSubmit={submit} className="mt-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
//         {loading ? (
//           <div className="text-gray-400">Loading…</div>
//         ) : (
//           <>
//             <div className="grid md:grid-cols-2 gap-4">
//               <div>
//                 <div className="text-sm text-gray-300 mb-1">Name<span className="text-rose-400">*</span></div>
//                 <input
//                   value={form.name}
//                   onChange={(e)=>setForm(f=>({...f, name:e.target.value}))}
//                   className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100"
//                   placeholder="Project / Workspace name"
//                 />
//               </div>
//               <div>
//                 <div className="text-sm text-gray-300 mb-1">Code</div>
//                 <input
//                   value={form.code}
//                   onChange={(e)=>setForm(f=>({...f, code:e.target.value}))}
//                   className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100"
//                   placeholder="Optional short code (e.g., ALPHA-01)"
//                 />
//               </div>
//               <div>
//                 <div className="text-sm text-gray-300 mb-1">Start Date</div>
//                 <input
//                   type="date"
//                   value={form.startDate}
//                   onChange={(e)=>setForm(f=>({...f, startDate:e.target.value}))}
//                   className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100"
//                 />
//               </div>
//               <div>
//                 <div className="text-sm text-gray-300 mb-1">End Date</div>
//                 <input
//                   type="date"
//                   value={form.endDate}
//                   onChange={(e)=>setForm(f=>({...f, endDate:e.target.value}))}
//                   className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100"
//                 />
//               </div>
//             </div>

//             <div className="mt-4">
//               <div className="text-sm text-gray-300 mb-1">Description</div>
//               <textarea
//                 rows={5}
//                 value={form.description}
//                 onChange={(e)=>setForm(f=>({...f, description:e.target.value}))}
//                 className="w-full rounded-lg border border-gray-800 bg-gray-950 p-3 text-gray-100"
//                 placeholder="Short description of this workspace"
//               />
//             </div>

//             <div className="mt-4 flex gap-2">
//               <button type="submit" className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-500">
//                 {editing ? "Update" : "Create"}
//               </button>
//               {editing && (
//                 <button type="button" onClick={() => navigate(`/projects/${id}`)}
//                         className="px-3 py-1.5 rounded-md bg-gray-800 text-gray-100 hover:bg-gray-700">
//                   Open Workspace
//                 </button>
//               )}
//             </div>
//           </>
//         )}
//       </form>
//     </div>
//   );
// }


// src/pages/WorkspaceForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

export default function WorkspaceForm() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [projectId, setProjectId] = useState("");
  const [memberIds, setMemberIds] = useState([]);
  const [approverIds, setApproverIds] = useState([]);

  // Optional charter fields (you can omit if you want purely approver-only)
  const [purpose, setPurpose] = useState("");
  const [scope, setScope] = useState("");
  const [objectives, setObjectives] = useState("");
  const [risks, setRisks] = useState("");
  const [assumptions, setAssumptions] = useState("");

  const [msg, setMsg] = useState({ type: "", text: "" });

  const toast = (text, type = "ok") => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        // projects to choose from
        const p = await axios.get("/projects").then(r => r.data).catch(() => []);
        if (abort) return;
        setProjects(Array.isArray(p) ? p : p.projects || []);

        // users to choose as members/approvers
        const u = await axios.get("/users").then(r => Array.isArray(r.data) ? r.data : (r.data.users || []));
        if (abort) return;
        setUsers(u);
      } catch (e) {
        if (!abort) toast(e?.response?.data?.message || e.message, "err");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, []);

  const selectedProject = useMemo(
    () => projects.find(p => String(p._id) === String(projectId)),
    [projects, projectId]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) return toast("Please select a project", "err");

    try {
      // 1) Add members (if any were selected)
      if (memberIds.length) {
        await axios.post(`/workspace/projects/${projectId}/members`, { userIds: memberIds });
      }

      // 2) Save Charter (with approvers)
      const payload = {
        approvers: approverIds,
        // Optional charter body:
        purpose: purpose || undefined,
        scope: scope || undefined,
        objectives: objectives
          ? objectives.split("\n").map(s => s.trim()).filter(Boolean)
          : [],
        risks: risks
          ? risks.split("\n").map(s => s.trim()).filter(Boolean)
          : [],
        assumptions: assumptions
          ? assumptions.split("\n").map(s => s.trim()).filter(Boolean)
          : [],
      };
      await axios.post(`/workspace/projects/${projectId}/charter`, payload);

      toast("Workspace created. Redirecting…");
      navigate(`/projects/${projectId}`); // open the workspace view
    } catch (e) {
      toast(e?.response?.data?.message || e.message, "err");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-6 text-gray-300">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Create Project Workspace</h2>
        <button onClick={() => navigate(-1)} className="px-3 py-1.5 rounded-md bg-gray-800 text-gray-100 hover:bg-gray-700">
          Back
        </button>
      </div>

      {msg.text && (
        <div className={`rounded-md px-3 py-2 ${msg.type === "err" ? "bg-rose-950/40 border border-rose-800 text-rose-200" : "bg-green-950/40 border border-green-800 text-green-200"}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={onSubmit} className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-6">
        {/* Project selection */}
        <section>
          <div className="text-sm font-semibold text-white mb-2">Select Project</div>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100"
          >
            <option value="">— Choose a project —</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} {p.code ? `(${p.code})` : ""}
              </option>
            ))}
          </select>
          {selectedProject && (
            <div className="mt-2 text-xs text-gray-400">
              Start: {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : "-"} ·
              End: {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : "-"}
            </div>
          )}
        </section>

        {/* Team members */}
        <section>
          <div className="text-sm font-semibold text-white mb-2">Team Members</div>
          <select
            multiple
            value={memberIds}
            onChange={(e) => setMemberIds(Array.from(e.target.selectedOptions).map(o => o.value))}
            className="w-full min-h-[160px] rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100"
          >
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name || u.email}</option>
            ))}
          </select>
          <div className="mt-1 text-xxs text-gray-500">Hold Ctrl/Cmd to select multiple.</div>
        </section>

        {/* Approvers */}
        <section>
          <div className="text-sm font-semibold text-white mb-2">Charter Approvers</div>
          <select
            multiple
            value={approverIds}
            onChange={(e) => setApproverIds(Array.from(e.target.selectedOptions).map(o => o.value))}
            className="w-full min-h-[120px] rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100"
          >
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name || u.email}</option>
            ))}
          </select>
          <div className="mt-1 text-xxs text-gray-500">Hold Ctrl/Cmd to select multiple.</div>
        </section>

        {/* Optional Charter text fields */}
        <section className="grid md:grid-cols-2 gap-3">
          <textarea rows={3} value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="Purpose"
            className="rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100" />
          <textarea rows={3} value={scope} onChange={e=>setScope(e.target.value)} placeholder="Scope"
            className="rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100" />
          <textarea rows={4} value={objectives} onChange={e=>setObjectives(e.target.value)} placeholder="Objectives (one per line)"
            className="rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100" />
          <textarea rows={4} value={risks} onChange={e=>setRisks(e.target.value)} placeholder="Risks (one per line)"
            className="rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100" />
          <textarea rows={4} value={assumptions} onChange={e=>setAssumptions(e.target.value)} placeholder="Assumptions (one per line)"
            className="rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100" />
        </section>

        <div>
          <button type="submit" className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-500">
            Create Workspace
          </button>
        </div>
      </form>
    </div>
  );
}
