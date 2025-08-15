import { useEffect, useState } from "react";
import { OtherTaskTypesApi, OtherTasksApi } from "../api/otherTasksApi";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function OtherTaskForm({ initial, onClose, onSaved }) {
  const { user } = useAuth();
  const [types, setTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(() => ({
    project: initial?.project?._id || "",
    description: initial?.description || "",
    typeId: initial?.typeId?._id || initial?.typeId || "",
    createdDate: initial?.createdDate ? initial.createdDate.slice(0,10) : new Date().toISOString().slice(0,10),
    dueDate: initial?.dueDate ? initial.dueDate.slice(0,10) : "",
    durationPlannedHrs: initial?.durationPlannedHrs ?? 0,
    assignee: initial?.assignee?._id || user?.id, // default self
    notes: initial?.notes || "",
  }));
  const isEdit = Boolean(initial?._id);

  const roles = (user?.roles || []).map(r => (typeof r === "string" ? r : r.name));
  const canAssign = ["Admin", "System Administrator", "Project Manager", "Senior Project Supervisor"].some(r => roles.includes(r));

  useEffect(() => {
    (async () => {
      const [t] = await Promise.all([
        OtherTaskTypesApi.list(true),
      ]);
      setTypes(t);
      // Load projects (simple minimal list)
      const projRes = await axios.get("/projects", { params: { select: "name" } }).catch(() => ({ data: [] })); // adapt to your endpoint
      setProjects(projRes.data || []);
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    const payload = {
      project: form.project || null,
      description: form.description.trim(),
      typeId: form.typeId,
      createdDate: form.createdDate,
      dueDate: form.dueDate || null,
      durationPlannedHrs: Number(form.durationPlannedHrs) || 0,
      notes: form.notes,
    };
    if (canAssign && form.assignee) payload.assignee = form.assignee;

    const out = isEdit ? await OtherTasksApi.update(initial._id, payload) : await OtherTasksApi.create(payload);
    onSaved?.(out);
  };

  return (
    <div className="p-4 w-full max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">{isEdit ? "Edit Task" : "New Task"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project (optional)</label>
          <select name="project" value={form.project} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="">— None —</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Task Type</label>
          <select name="typeId" value={form.typeId} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="">Select type...</option>
            {types.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>

        {canAssign && (
          <div>
            <label className="block text-sm font-medium mb-1">Assignee</label>
            <select name="assignee" value={form.assignee} onChange={onChange} className="w-full border rounded px-3 py-2">
              <option value={user?.id}>Me</option>
              {/* Optional: load all users to assign. Replace with your users endpoint */}
              {/* Keep minimal for now or plug your users list */}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Planned Duration (hrs)</label>
          <input type="number" step="0.25" name="durationPlannedHrs" value={form.durationPlannedHrs}
                 onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Created Date</label>
          <input type="date" name="createdDate" value={form.createdDate}
                 onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input type="date" name="dueDate" value={form.dueDate}
                 onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={3} value={form.description} onChange={onChange}
                    className="w-full border rounded px-3 py-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={onChange}
                    className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={save} className="px-4 py-2 rounded bg-black text-white">Save</button>
        <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
      </div>
    </div>
  );
}
