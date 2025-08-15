import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios
        .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  // const login = async (email, password) => {
  //   const res = await axios.post("/auth/login", { email, password });
  //   localStorage.setItem("token", res.data.token);
  //   setToken(res.data.token);
  //   setUser(res.data.user);
  //   return res.data.user;
  // };


  // src/context/AuthContext.jsx
  const login = async (email, password) => {
    const res = await axios.post("/auth/login", { email, password });

    // DEBUG: make sure the backend really returned a token
    console.log("[login] response:", res.data);

    const { token, user } = res.data || {};
    if (!token) {
      // If this ever happens, the server didn't send a token for this user
      throw new Error("Login succeeded but no token returned.");
    }

    // Write token BEFORE anything else so interceptors pick it up
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);

    // DEBUG: confirm it's in storage
    console.log("[login] token saved?", !!localStorage.getItem("token"));

    return user;
  };


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
    setToken(null);
    setLoading(false);
  };

  if (loading) return <p className="p-6">Loading...</p>; // <-- Prevents blank redirect

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
