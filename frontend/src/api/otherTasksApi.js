import axios from "../api/axiosInstance";

export const OtherTaskTypesApi = {
  list: (active = true) => axios.get(`/other-task-types`, { params: { active } }).then(r => r.data),
  create: (name) => axios.post(`/other-task-types`, { name }).then(r => r.data),
  update: (id, payload) => axios.patch(`/other-task-types/${id}`, payload).then(r => r.data),
  remove: (id) => axios.delete(`/other-task-types/${id}`).then(r => r.data),
};

export const OtherTasksApi = {
  create: (payload) => axios.post(`/other-tasks`, payload).then(r => r.data),
  list: (params) => axios.get(`/other-tasks`, { params }).then(r => r.data),
  get: (id) => axios.get(`/other-tasks/${id}`).then(r => r.data),
  update: (id, payload) => axios.patch(`/other-tasks/${id}`, payload).then(r => r.data),

  start: (id) => axios.post(`/other-tasks/${id}/start`).then(r => r.data),
  pause: (id) => axios.post(`/other-tasks/${id}/pause`).then(r => r.data),
  resume: (id) => axios.post(`/other-tasks/${id}/resume`).then(r => r.data),
  done: (id) => axios.post(`/other-tasks/${id}/done`).then(r => r.data),
};
