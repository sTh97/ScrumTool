// src/api/schemaApi.js
import axios from './axiosInstance';

export const SchemaApi = {
  // snapshots
  uploadSnapshot: (data) =>
    axios.post('/schemas/snapshots/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createSnapshotFromText: (payload) =>
    axios.post('/schemas/snapshots/from-text', payload),
  listSnapshots: (params) => axios.get('/schemas/snapshots', { params }),

  // compare
  previewCompare: (payload) => axios.post('/schemas/compare/preview', payload),
  compare: (payload) => axios.post('/schemas/compare', payload),

  // comparisons
  listComparisons: (params) => axios.get('/schemas/comparisons', { params }),
  getComparison: (id) => axios.get(`/schemas/comparisons/${id}`),
  deleteComparison: (id) => axios.delete(`/schemas/comparisons/${id}`),
  updateComparison: (id, payload) => axios.patch(`/schemas/comparisons/${id}`, payload),
};
