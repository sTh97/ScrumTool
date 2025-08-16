import axios from "../api/axiosInstance";

export const fetchUsers = (q = "") => axios.get(`/chat/users`, { params: { q } });
export const listConversations = () => axios.get(`/chat/conversations`);
export const createConversation = (payload) => axios.post(`/chat/conversations`, payload);
export const getMessages = (id) => axios.get(`/chat/conversations/${id}/messages`);
export const sendMessage = (id, body) => axios.post(`/chat/conversations/${id}/messages`, { body });

export const addMembers         = (id, memberIds) => axios.patch(`chat/conversations/${id}/members`, { add: memberIds });
export const deleteConversation = (id)            => axios.delete(`chat/conversations/${id}`);