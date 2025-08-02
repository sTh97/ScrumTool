// import React, { useEffect, useState } from "react";
// import axios from "../api/axiosInstance";

// const permissionOptions = [
//   { label: "View Dashboard", value: "view_dashboard" },
//   { label: "Manage Roles", value: "manage_roles" },
//   { label: "Manage Users", value: "manage_users" },
//   { label: "Manage Projects", value: "manage_projects" },
//   { label: "Manage Stories", value: "manage_stories" },
//   { label: "Manage Sprints", value: "manage_sprints" },
// ];

// const RoleManagement = () => {
//   const [roles, setRoles] = useState([]);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [selectedPermissions, setSelectedPermissions] = useState([]);
//   const [editingRoleId, setEditingRoleId] = useState(null);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);

//   const fetchRoles = async () => {
//     try {
//       const res = await axios.get("/roles");
//       setRoles(res.data);
//     } catch (err) {
//       console.error("Error fetching roles", err);
//     }
//   };

//   useEffect(() => {
//     fetchRoles();
//   }, []);

//   const handleCheckboxChange = (value) => {
//     setSelectedPermissions((prev) =>
//       prev.includes(value)
//         ? prev.filter((perm) => perm !== value)
//         : [...prev, value]
//     );
//   };

//   const resetForm = () => {
//     setName("");
//     setDescription("");
//     setSelectedPermissions([]);
//     setEditingRoleId(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     try {
//       if (editingRoleId) {
//         await axios.put(`/roles/${editingRoleId}`, {
//           name,
//           description,
//           permissions: selectedPermissions,
//         });
//         setSuccess("Role updated successfully");
//       } else {
//         await axios.post("/roles", {
//           name,
//           description,
//           permissions: selectedPermissions,
//         });
//         setSuccess("Role created successfully");
//       }
//       resetForm();
//       fetchRoles();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to submit role");
//     }
//   };

//   const handleEdit = (role) => {
//     setName(role.name);
//     setDescription(role.description);
//     setSelectedPermissions(role.permissions);
//     setEditingRoleId(role._id);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this role?")) {
//       try {
//         await axios.delete(`/roles/${id}`);
//         setSuccess("Role deleted successfully");
//         fetchRoles();
//       } catch (err) {
//         setError(err.response?.data?.message || "Failed to delete role");
//       }
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Role Management</h2>

//       <form onSubmit={handleSubmit} className="mb-6">
//         {error && <p className="text-red-500 mb-2">{error}</p>}
//         {success && <p className="text-green-500 mb-2">{success}</p>}

//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Role Name"
//           className="border p-2 rounded w-full mb-2"
//           required
//         />
//         <input
//           type="text"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           placeholder="Description"
//           className="border p-2 rounded w-full mb-2"
//         />

//         <label className="block mb-2 font-medium">Permissions:</label>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
//           {permissionOptions.map((option) => (
//             <label key={option.value} className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 checked={selectedPermissions.includes(option.value)}
//                 onChange={() => handleCheckboxChange(option.value)}
//               />
//               <span>{option.label}</span>
//             </label>
//           ))}
//         </div>

//         <button className="bg-blue-600 text-white px-4 py-2 rounded">
//           {editingRoleId ? "Update Role" : "Create Role"}
//         </button>
//       </form>

//       <h3 className="text-xl font-semibold mb-2">Existing Roles</h3>
//       <ul className="list-disc pl-5">
//         {roles.map((role) => (
//           <li key={role._id} className="mb-3">
//             <div className="flex justify-between items-center">
//               <div>
//                 <strong>{role.name}</strong> - {role.description} <br />
//                 <span className="text-sm text-gray-600">
//                   Permissions: {role.permissions.join(", ")}
//                 </span>
//               </div>
//               <div className="space-x-2">
//                 <button
//                   className="bg-yellow-400 text-white px-2 py-1 rounded"
//                   onClick={() => handleEdit(role)}
//                 >
//                   Edit
//                 </button>
//                 <button
//                   className="bg-red-600 text-white px-2 py-1 rounded"
//                   onClick={() => handleDelete(role._id)}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default RoleManagement;

// File: src/pages/RoleManagement.jsx

import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

const permissionOptions = [
  { label: "View Dashboard", value: "view_dashboard" },
  { label: "Manage Roles", value: "manage_roles" },
  { label: "Manage Users", value: "manage_users" },
  { label: "Manage Projects", value: "manage_projects" },
  { label: "Manage Epics", value: "manage_epics" },
  { label: "Manage Stories", value: "manage_stories" },
  { label: "Manage Sprints", value: "manage_sprints" },
  { label: "T-Shirt Sizing", value: "manage_estimations" },
  { label: "Manage User Stories", value: "manage_userStories" },
  { label: "Manage Sprint Assignment", value: "manage_sprintassignment" },
  { label: "Manage Sprint Detail View", value: "manage_sprintdetailview" },
  { label: "Manage Tasks", value: "manage_tasks" },
  { label: "Manage Stage Phase", value: "phase_stage_master" },
  { label: "Manage Impacts/Consequences", value: "impact_master" },
  { label: "Manage Lessons Learned", value: "lessons_learned_master" },
  { label: "Manage Recommendations", value: "recommendations_master" },
  { label: "Manage Lessons Leraned Priority/Severity", value: "priority_severity_master" },
  { label: "Manage Frequency", value: "frequency_master" },
  { label: "Lesson Learn Register", value: "lesson_learned" },
  { label: "Lesson Learn List", value: "lesson_learned_List" },
  { label: "Create Document", value: "create_document" },
  { label: "Documents List", value: "document_list" },
];

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const rolesPerPage = 5;
  const indexOfLast = currentPage * rolesPerPage;
  const indexOfFirst = indexOfLast - rolesPerPage;
  const currentRoles = roles.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(roles.length / rolesPerPage);

  const fetchRoles = async () => {
    try {
      const res = await axios.get("/roles");
      setRoles(res.data);
    } catch (err) {
      console.error("Error fetching roles", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCheckboxChange = (value) => {
    setSelectedPermissions((prev) =>
      prev.includes(value)
        ? prev.filter((perm) => perm !== value)
        : [...prev, value]
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedPermissions([]);
    setEditingRoleId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingRoleId) {
        await axios.put(`/roles/${editingRoleId}`, {
          name,
          description,
          permissions: selectedPermissions,
        });
        setSuccess("Role updated successfully");
      } else {
        await axios.post("/roles", {
          name,
          description,
          permissions: selectedPermissions,
        });
        setSuccess("Role created successfully");
      }
      resetForm();
      fetchRoles();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit role");
    }
  };

  const handleEdit = (role) => {
    setName(role.name);
    setDescription(role.description);
    setSelectedPermissions(role.permissions);
    setEditingRoleId(role._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await axios.delete(`/roles/${id}`);
        setSuccess("Role deleted successfully");
        fetchRoles();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete role");
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Role Management</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Role Name"
          className="border p-2 rounded w-full mb-2"
          required
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="border p-2 rounded w-full mb-2"
        />

        <label className="block mb-2 font-medium">Permissions:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {permissionOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedPermissions.includes(option.value)}
                onChange={() => handleCheckboxChange(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingRoleId ? "Update Role" : "Create Role"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-2">Existing Roles</h3>
      <ul className="list-disc pl-5">
        {currentRoles.map((role) => (
          <li key={role._id} className="mb-3">
            <div className="flex justify-between items-center">
              <div>
                <strong>{role.name}</strong> - {role.description} <br />
                <span className="text-sm text-gray-600">
                  Permissions: {role.permissions.join(", ")}
                </span>
              </div>
              <div className="space-x-2">
                <button
                  className="bg-yellow-400 text-white px-2 py-1 rounded"
                  onClick={() => handleEdit(role)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(role._id)}
                >
                  Delete
                </button>
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

export default RoleManagement;
