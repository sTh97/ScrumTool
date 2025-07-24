// File: src/pages/UserManagement.jsx

import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const fetchUsers = async () => {
    const res = await axios.get("/users");
    setUsers(res.data);
  };

  const fetchRoles = async () => {
    const res = await axios.get("/roles");
    console.log(res)
    setRoles(res.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (editingUserId) {
        await axios.put(`/users/${editingUserId}`, {
          name,
          email,
          roles: selectedRoles,
        });
        setSuccess("User updated successfully");
      } else {
        await axios.post("/users", {
          name,
          email,
          password,
          roles: selectedRoles,
        });
        setSuccess("User created successfully");
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit user");
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setSelectedRoles([]);
    setEditingUserId(null);
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleEdit = (user) => {
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setSelectedRoles(user.roles.map((r) => r._id));
    setEditingUserId(user._id);
  };

  const handleDeactivate = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        await axios.put(`/users/deactivate/${id}`);
        setSuccess("User deactivated successfully");
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to deactivate user");
      }
    }
  };

  const handleReactivate = async (id) => {
    if (window.confirm("Are you sure you want to reactivate this user?")) {
      try {
        await axios.put(`/users/reactivate/${id}`);
        setSuccess("User reactivated successfully");
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to reactivate user");
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="border p-2 rounded w-full mb-2"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border p-2 rounded w-full mb-2"
          required
        />
        {!editingUserId && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border p-2 rounded w-full mb-2"
            required
          />
        )}

        <label className="block mb-2 font-medium">Assign Roles:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {roles.map((role) => (
            <label key={role._id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role._id)}
                onChange={() => handleRoleToggle(role._id)}
              />
              <span>{role.name}</span>
            </label>
          ))}
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingUserId ? "Update User" : "Create User"}
        </button>
      </form>

      <input
        type="text"
        placeholder="Search by name or email"
        className="border p-2 rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <h3 className="text-xl font-semibold mb-2">Existing Users</h3>
      <ul className="list-disc pl-5">
        {currentUsers.map((user) => (
          <li key={user._id} className="mb-2">
            <div className="flex justify-between items-start">
              <div>
                <strong>{user.name}</strong> – {user.email} <br />
                <span className="text-sm text-gray-600">
                  Roles: {user.roles.map((r) => r.name).join(", ")} | Status: {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="space-x-2">
                <button
                  className="bg-yellow-400 text-white px-2 py-1 rounded"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
                {user.isActive ? (
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => handleDeactivate(user._id)}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    className="bg-green-600 text-white px-2 py-1 rounded"
                    onClick={() => handleReactivate(user._id)}
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`px-3 py-1 rounded border ${
                currentPage === num ? "bg-blue-500 text-white" : "bg-white"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;