import axios from '../api/axiosInstance';

// export const WorkspaceAPI = {
//   // Project header from projects service
//   getProject: (pid) => axios.get(`/projects/${pid}`).then(r => r.data),

//   // Members
//   getMembers: (pid) => axios.get(`/workspace/projects/${pid}/members`).then(r=>r.data),
//   addMembers: (pid, payload) => axios.post(`/workspace/projects/${pid}/members`, payload).then(r=>r.data),
//   removeMember: (pid, userId) => axios.delete(`/workspace/projects/${pid}/members/${userId}`).then(r=>r.data),

//   // Users (for pickers)
//   listUsers: async () => {
//     const r = await axios.get(`/users`);
//     return Array.isArray(r.data) ? r.data : (r.data.users || []);
//   },

//   // Notes (private per backend)
//   listNotes: (pid) => axios.get(`/workspace/projects/${pid}/notes`).then(r=>r.data),
//   createNote: (pid, formData) =>
//     axios.post(`/workspace/projects/${pid}/notes`, formData, {
//       headers:{ 'Content-Type':'multipart/form-data' }
//     }).then(r=>r.data),

//   // Files
//   listFiles: (pid) => axios.get(`/workspace/projects/${pid}/files`).then(r=>r.data),
//   uploadFiles: (pid, formData) =>
//     axios.post(`/workspace/projects/${pid}/files`, formData, {
//       headers:{ 'Content-Type':'multipart/form-data' }
//     }).then(r=>r.data),
//   deleteFile: (pid, fileId) => axios.delete(`/workspace/projects/${pid}/files/${fileId}`).then(r=>r.data),

//   // Chat
//   listChat: (pid, since) =>
//     axios.get(`/workspace/projects/${pid}/chat${since?`?since=${encodeURIComponent(since)}`:''}`).then(r=>r.data),
//   sendChat: (pid, formData) =>
//     axios.post(`/workspace/projects/${pid}/chat`, formData, {
//       headers:{ 'Content-Type':'multipart/form-data' }
//     }).then(r=>r.data),
//   markRead: (messageId) => axios.post(`/workspace/chat/${messageId}/read`).then(r=>r.data),
//   unreadCounts: (pid) => axios.get(`/workspace/projects/${pid}/chat/unread-counts`).then(r=>r.data),

//   // Plan
//   listPlan: (pid) => axios.get(`/workspace/projects/${pid}/plan`).then(r=>r.data),
//   savePlan: (pid, payload) => axios.post(`/workspace/projects/${pid}/plan`, payload).then(r=>r.data),

//   // Charter
//   getCharter: (pid) => axios.get(`/workspace/projects/${pid}/charter`).then(r=>r.data),
//   saveCharter: (pid, payload) => axios.post(`/workspace/projects/${pid}/charter`, payload).then(r=>r.data),
//   setApprovers: (charterId, payload) => axios.post(`/workspace/charter/${charterId}/approvers`, payload).then(r=>r.data),
//   signCharter: (charterId, payload) => axios.post(`/workspace/charter/${charterId}/sign`, payload).then(r=>r.data),
// };

// export const TaskAPI = {
//   // /api/project-tasks
//   listByProject: (pid) => axios.get(`/project-tasks/project/${pid}`).then(r=>r.data),
//   create: (payload) => axios.post(`/project-tasks`, payload).then(r=>r.data), // requires payload.projectId

//   get: (id) => axios.get(`/project-tasks/${id}`).then(r=>r.data),
//   update: (id, payload) => axios.patch(`/project-tasks/${id}`, payload).then(r=>r.data),
//   history: (id) => axios.get(`/project-tasks/${id}/history`).then(r=>r.data),
//   changeStatus: (id, payload) => axios.patch(`/project-tasks/${id}/status`, payload).then(r=>r.data),

//   uploadFiles: (id, formData) =>
//     axios.post(`/project-tasks/${id}/files`, formData, {
//       headers:{ 'Content-Type':'multipart/form-data' }
//     }).then(r=>r.data),
// };

// src/pages/ProjectWorkspace/api/workspaceApi.js
export async function getWorkspaceByProjectId(projectId) {
  const res = await fetch(`/api/projects/${projectId}/workspace`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to load workspace: ${res.status}`);
  }

  return res.json();
}


