import axios from "axios";

export const baseURL = window.location.hostname.includes('localhost')
  ? 'http://localhost:5000'
  : 'http://api.al.3em.tech';

const instance = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
