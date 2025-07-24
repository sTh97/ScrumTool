// File: src/components/Layout.jsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const timestamp = new Date().toLocaleString();

  const hasPermission = (perm) => {
    console.log(perm, user)
    return user?.roles?.some((role) => role.permissions.includes("*") || role.permissions.includes(perm));
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">SCRUM TOOL</h2>
        <nav className="space-y-2">
          <Link to="/dashboard" className={linkClass(location.pathname === "/dashboard")}>Dashboard</Link>
          {hasPermission("manage_roles") && (
            <Link to="/roles" className={linkClass(location.pathname === "/roles")}>Role Management</Link>
          )}
          {hasPermission("manage_users") && (
            <Link to="/users" className={linkClass(location.pathname === "/users")}>User Management</Link>
          )}
          {hasPermission("manage_projects") && (
            <Link to="/projects" className={linkClass(location.pathname === "/projects")}>Project Management</Link>
          )}
          {hasPermission("manage_epics") && (
            <Link to="/epics" className={linkClass(location.pathname === "/epics")}>
              Epic Management
            </Link>
          )}
          {hasPermission("manage_sprints") && (
            <Link to="/sprints" className={linkClass(location.pathname === "/sprints")}>Sprint Management</Link>
          )}
          {hasPermission("manage_estimations") && (
            <Link to="/estimations" className={linkClass(location.pathname === "/estimations")}>T-Shirt Sizing</Link>
          )}
          {hasPermission("manage_userStories") && (
            <Link to="/userstories" className={linkClass(location.pathname === "/userstories")}>User Stories</Link>
          )}
           {hasPermission("manage_sprintassignment") && (
            <Link to="/sprintassignment" className={linkClass(location.pathname === "/sprintassignment")}>Sprint Assignment</Link>
          )}
          {hasPermission("manage_sprintdetailview") && (
            <Link to="/sprintdetailview" className={linkClass(location.pathname === "/sprintdetailview")}>Sprint Detail View</Link>
          )}
           {hasPermission("manage_tasks") && (
            <Link to="/tasklist" className={linkClass(location.pathname === "/tasklist")}>Tasks List View</Link>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <span className="text-xl font-semibold">Welcome, {user?.name}</span>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-1 rounded">Logout</button>
        </header>

        <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>

        <footer className="bg-white p-4 text-center border-t text-sm text-gray-500">
          Last updated: {timestamp}
        </footer>
      </div>
    </div>
  );
};

const linkClass = (active) =>
  `block px-3 py-2 rounded hover:bg-gray-700 ${active ? "bg-gray-700 font-semibold" : ""}`;

export default Layout;