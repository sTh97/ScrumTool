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
  console.log("[axiosInstance] Sending request to:", config.url, "Has token:", !!token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// OPTIONAL: auto-logout on 401
// instance.interceptors.response.use(
//   (res) => res,
//   (error) => {
//     if (error?.response?.status === 401) {
//       // Avoid loops: only clear if we have a token
//       if (localStorage.getItem("token")) {
//         localStorage.removeItem("token");
//         // Hard refresh or dispatch your logout()
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default instance;
