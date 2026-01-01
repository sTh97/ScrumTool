// src/pages/ProjectWorkspace/components/WorkspaceHeader.jsx
export default function WorkspaceHeader({ project }) {
  if (!project) return null;

  return (
    <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">
          {project.code} — {project.name}
        </h1>
        <p className="text-sm text-slate-300">
          Status: {project.status} · Start: {project.startDate?.slice(0, 10)} ·
          End: {project.endDate?.slice(0, 10)}
        </p>
      </div>
      <div className="text-right text-xs text-slate-300">
        <div>Owner: {project.owner?.fullName || project.owner?.email}</div>
        <div>Last updated: {project.updatedAt?.slice(0, 10)}</div>
      </div>
    </div>
  );
}
