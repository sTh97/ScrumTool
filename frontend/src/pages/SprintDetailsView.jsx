// import React, { useEffect, useState } from "react";
// import axios from "../api/axiosInstance";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const SprintDetailsView = () => {
//   const [sprints, setSprints] = useState([]);
//   const [editSprint, setEditSprint] = useState(null);
//   const [allUsers, setAllUsers] = useState([]);
//   const [allStories, setAllStories] = useState([]);
//   const [estimations, setEstimations] = useState([]);
  

//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const roles = user?.roles?.map((r) => r.name) || [];
//   const privilegedViewRoles = ["Admin", "System Administrator", "Project Manager"];
//   const editAllowedRoles = ["Admin", "System Administrator", "Senior Project Supervisor", "Project Manager"];
//   const deleteAllowedRoles = ["Admin", "System Administrator"];

//   const canViewAll = roles.some((role) => privilegedViewRoles.includes(role));
//   const canEdit = roles.some((role) => editAllowedRoles.includes(role));
//   const canDelete = roles.some((role) => deleteAllowedRoles.includes(role));

//   const fetchSprints = async () => {
//     try {
//       const res = await axios.get("/sprints/details");
//       const all = res.data;
//       // if (canViewAll) {
//       //   setSprints(all);
//       // } else {
//       //   const myId = user._id;
//       //   const filtered = all.filter((s) => s.teamMembers.some((m) => m._id === myId));
//       //   setSprints(filtered);
//       // }
//       if (canViewAll) {
//         const assignedOnly = all.filter(
//           (s) => (s.teamMembers && s.teamMembers.length > 0) || (s.userStories && s.userStories.length > 0)
//         );
//         setSprints(assignedOnly);
//       } else {
//         const myId = user._id;
//         const filtered = all.filter(
//           (s) =>
//             ((s.teamMembers && s.teamMembers.length > 0) || (s.userStories && s.userStories.length > 0)) &&
//             s.teamMembers.some((m) => m._id === myId)
//         );
//         setSprints(filtered);
//       }
//     } catch (err) {
//       console.error("Failed to fetch sprint details:", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!canDelete) return alert("You do not have permission to delete.");
//     if (window.confirm("Are you sure you want to delete this sprint?")) {
//       try {
//         await axios.delete(`/sprints/${id}`);
//         fetchSprints();
//       } catch {
//         alert("Error deleting sprint");
//       }
//     }
//   };

//   useEffect(() => {
//     fetchSprints();
//     axios.get("/users").then((res) => setAllUsers(res.data));
//     axios.get("/userstories").then((res) => setAllStories(res.data));
//     axios.get("/estimations").then((res) => setEstimations(res.data));
//   }, []);

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">All Sprint Details</h2>
//       {sprints.map((sprint) => (
//         <div key={sprint._id} className="border rounded p-4 mb-6 shadow-sm bg-white">
//           <div className="flex justify-between items-center">
//             <h3 className="text-xl font-semibold">{sprint.name}</h3>
//             <div className="space-x-2">
//               {canEdit && (
//                 <button
//                   onClick={() => setEditSprint(sprint)}
//                   className="bg-yellow-500 text-white px-3 py-1 rounded"
//                 >
//                   Edit
//                 </button>
//               )}
//               {canDelete && (
//                 <button
//                   onClick={() => handleDelete(sprint._id)}
//                   className="bg-red-600 text-white px-3 py-1 rounded"
//                 >
//                   Delete
//                 </button>
//               )}
//               <button
//                 onClick={() => navigate(`/sprint/${sprint._id}/details`)}
//                 className="bg-gray-600 text-white px-3 py-1 rounded"
//               >
//                 View Details
//               </button>
//             </div>
//           </div>
//           <p className="text-sm text-gray-600 mt-1">
//             {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
//           </p>
//           <p className="text-sm text-gray-700 mt-2">
//             <strong>Project:</strong> {sprint.project?.name || "N/A"}<br />
//             <strong>Epic:</strong> {sprint.epic?.name || "N/A"}
//           </p>

//           <div className="mt-4">
//             <strong>Team Members:</strong>
//             <ul className="list-disc list-inside ml-4">
//               {(sprint.teamMembers || []).map((u) => (
//                 <li key={u._id}>{u.name}</li>
//               ))}
//             </ul>
//           </div>

//           <div className="mt-4">
//             <strong>User Stories:</strong>
//             <ul className="list-disc list-inside ml-4">
//               {(sprint.userStories || []).map((us) => (
//                 <li key={us.storyId?._id}>
//                   <div>
//                     <strong>{us.storyId?.title}</strong> — {us.storyId?.description}
//                   </div>
//                   <div className="text-sm text-gray-500 ml-2">
//                     Size: {us.tshirtSize} | Est. Hours: {us.estimatedHours}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       ))}
//       {/* Edit modal remains unchanged and reuses editSprint */}
//       {editSprint && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
//             <h3 className="text-xl font-bold mb-4">Edit Sprint</h3>

//             <input
//               type="text"
//               value={editSprint.name}
//               onChange={(e) => setEditSprint({ ...editSprint, name: e.target.value })}
//               className="border p-2 w-full mb-2 rounded"
//               placeholder="Sprint Name"
//             />

//             <div className="flex gap-4 mb-2">
//               <input
//                 type="date"
//                 value={editSprint.startDate?.substring(0, 10)}
//                 onChange={(e) => setEditSprint({ ...editSprint, startDate: e.target.value })}
//                 className="border p-2 w-full rounded"
//               />
//               <input
//                 type="date"
//                 value={editSprint.endDate?.substring(0, 10)}
//                 onChange={(e) => setEditSprint({ ...editSprint, endDate: e.target.value })}
//                 className="border p-2 w-full rounded"
//               />
//             </div>

//             <label className="block font-medium mb-1">Team Members</label>
//             <select
//               multiple
//               value={editSprint.teamMembers?.map(u => u._id) || []}
//               onChange={(e) =>
//                 setEditSprint({
//                   ...editSprint,
//                   teamMembers: Array.from(e.target.selectedOptions, opt => {
//                     const fullUser = allUsers.find(u => u._id === opt.value);
//                     return { _id: fullUser._id, name: fullUser.name };
//                   })
//                 })
//               }
//               className="border p-2 w-full h-32 rounded mb-4"
//             >
//               {allUsers.map((user) => (
//                 <option key={user._id} value={user._id}>{user.name}</option>
//               ))}
//             </select>

//             <div className="mb-4">
//               <label className="block font-medium mb-1">User Stories</label>
//               {(editSprint.userStories || []).map((us, idx) => (
//                 <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
//                   <select
//                     value={us.storyId?._id || ""}
//                     onChange={(e) => {
//                       const updated = [...editSprint.userStories];
//                       updated[idx].storyId = allStories.find(st => st._id === e.target.value);
//                       setEditSprint({ ...editSprint, userStories: updated });
//                     }}
//                     className="border p-2 rounded"
//                   >
//                     <option value="">Select</option>
//                     {allStories.map(story => (
//                       <option key={story._id} value={story._id}>{story.title}</option>
//                     ))}
//                   </select>
//                   <select
//                     value={us.tshirtSize}
//                     onChange={(e) => {
//                       const selectedSize = e.target.value;
//                       const hours = estimations.find(est => est.label === selectedSize)?.hours || 0;
//                       const updated = [...editSprint.userStories];
//                       updated[idx].tshirtSize = selectedSize;
//                       updated[idx].estimatedHours = hours;
//                       setEditSprint({ ...editSprint, userStories: updated });
//                     }}
//                     className="border p-2 rounded"
//                   >
//                     {/* {['XS','S','M','L','XL'].map(size => <option key={size} value={size}>{size}</option>)} */}
//                     {estimations.map(est => (
//                       <option key={est.label} value={est.label}>
//                         {est.label}
//                       </option>
//                     ))}
//                   </select>
//                   <input
//                     type="number"
//                     value={us.estimatedHours}
//                     readOnly
//                     className="border p-2 rounded bg-gray-100"
//                   />
//                   <button
//                     onClick={() => {
//                       const updated = [...editSprint.userStories];
//                       updated.splice(idx, 1);
//                       setEditSprint({ ...editSprint, userStories: updated });
//                     }}
//                     className="bg-red-600 text-white px-2 rounded"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               ))}
//               <button
//                 onClick={() => setEditSprint({
//                   ...editSprint,
//                   userStories: [...(editSprint.userStories || []), {
//                     storyId: null, tshirtSize: '', estimatedHours: 0
//                   }]
//                 })}
//                 className="bg-green-600 text-white px-3 py-1 rounded"
//               >
//                 Add Story
//               </button>
//             </div>

//             <div className="flex justify-end gap-4">
//               <button
//                 onClick={async () => {
//                   try {
//                     const sprintId = editSprint._id;
//                     await axios.put(`/sprints/${sprintId}`, {
//                       name: editSprint.name,
//                       startDate: editSprint.startDate,
//                       endDate: editSprint.endDate
//                     });

//                     const teamIds = editSprint.teamMembers.map(m => m._id);
//                     await axios.put(`/sprints/${sprintId}/team`, { teamMembers: teamIds });

//                     const stories = editSprint.userStories.map(story => ({
//                       storyId: story.storyId._id,
//                       tshirtSize: story.tshirtSize,
//                       estimatedHours: story.estimatedHours
//                     }));
//                     await axios.put(`/sprints/${sprintId}/stories`, { userStories: stories });

//                     setEditSprint(null);
//                     fetchSprints();
//                     alert("Sprint updated!");
//                   } catch (err) {
//                     console.error(err);
//                     alert("Error updating sprint");
//                   }
//                 }}
//                 className="bg-blue-600 text-white px-4 py-2 rounded"
//               >
//                 Save
//               </button>
//               <button
//                 onClick={() => setEditSprint(null)}
//                 className="bg-gray-400 text-white px-4 py-2 rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SprintDetailsView;


import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SprintDetailsView = () => {
  const [sprints, setSprints] = useState([]);
  const [editSprint, setEditSprint] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allStories, setAllStories] = useState([]);
  const [estimations, setEstimations] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(3);
  const [paginatedSprints, setPaginatedSprints] = useState([]);

  const { user } = useAuth();
  const navigate = useNavigate();

  const roles = user?.roles?.map((r) => r.name) || [];
  const privilegedViewRoles = ["Admin", "System Administrator", "Project Manager"];
  const editAllowedRoles = ["Admin", "System Administrator", "Senior Project Supervisor", "Project Manager"];
  const deleteAllowedRoles = ["Admin", "System Administrator"];

  const canViewAll = roles.some((role) => privilegedViewRoles.includes(role));
  const canEdit = roles.some((role) => editAllowedRoles.includes(role));
  const canDelete = roles.some((role) => deleteAllowedRoles.includes(role));

  const fetchSprints = async () => {
    try {
      const res = await axios.get("/sprints/details");
      const all = res.data;

      if (canViewAll) {
        const assignedOnly = all.filter(
          (s) => (s.teamMembers && s.teamMembers.length > 0) || (s.userStories && s.userStories.length > 0)
        );
        setSprints(assignedOnly);
      } else {
        const myId = user._id;
        const filtered = all.filter(
          (s) =>
            ((s.teamMembers && s.teamMembers.length > 0) || (s.userStories && s.userStories.length > 0)) &&
            s.teamMembers.some((m) => m._id === myId)
        );
        setSprints(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch sprint details:", err);
    }
  };

  const handlePagination = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentSprints = sprints.slice(startIndex, endIndex);
    setPaginatedSprints(currentSprints);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    if (!canDelete) return alert("You do not have permission to delete.");
    if (window.confirm("Are you sure you want to delete this sprint?")) {
      try {
        await axios.delete(`/sprints/${id}`);
        fetchSprints();
      } catch {
        alert("Error deleting sprint");
      }
    }
  };

  useEffect(() => {
    fetchSprints();
    axios.get("/users").then((res) => setAllUsers(res.data));
    axios.get("/userstories").then((res) => setAllStories(res.data));
    axios.get("/estimations").then((res) => setEstimations(res.data));
  }, []);

  useEffect(() => {
    handlePagination();
  }, [sprints, currentPage]);

  const totalPages = Math.ceil(sprints.length / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Sprint Overview</h1>
              <p className="text-lg text-gray-600">Manage and monitor your active sprints</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {sprints.length} Total Sprints
              </span>
            </div>
          </div>
        </div>

        {/* Sprint Cards Grid */}
        <div className="space-y-6">
          {paginatedSprints.map((sprint) => (
            <div key={sprint._id} className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{sprint.name}</h3>
                    <div className="flex items-center space-x-4 text-blue-100">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">
                          {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/sprint/${sprint._id}/details`)}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 backdrop-blur-sm"
                    >
                      View Details
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => setEditSprint(sprint)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(sprint._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Project & Epic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Project</h4>
                    <p className="text-lg font-medium text-gray-900">{sprint.project?.name || "Not Assigned"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Epic</h4>
                    <p className="text-lg font-medium text-gray-900">{sprint.epic?.name || "Not Assigned"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Team Members Section */}
                  <div>
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Team Members ({sprint.teamMembers?.length || 0})
                      </h4>
                    </div>
                    
                    {sprint.teamMembers?.length > 0 ? (
                      <div className="space-y-2">
                        {sprint.teamMembers.map((member) => (
                          <div key={member._id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {member.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-gray-900 font-medium">{member.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No team members assigned</p>
                    )}
                  </div>

                  {/* User Stories Section */}
                  <div>
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-900">
                        User Stories ({sprint.userStories?.length || 0})
                      </h4>
                    </div>
                    
                    {sprint.userStories?.length > 0 ? (
                      <div className="space-y-3">
                        {sprint.userStories.map((story) => (
                          <div key={story.storyId?._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <h5 className="font-semibold text-gray-900 mb-2">{story.storyId?.title}</h5>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{story.storyId?.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {story.tshirtSize}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {story.estimatedHours}h estimated
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No user stories assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, sprints.length)}</span> of{' '}
                <span className="font-medium">{sprints.length}</span> sprints
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  currentPage >= totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {sprints.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sprints found</h3>
            <p className="text-gray-500">Get started by creating your first sprint.</p>
          </div>
        )}
      </div>
      {editSprint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Sprint</h3>

            <input
              type="text"
              value={editSprint.name}
              onChange={(e) => setEditSprint({ ...editSprint, name: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
              placeholder="Sprint Name"
            />

            <div className="flex gap-4 mb-2">
              <input
                type="date"
                value={editSprint.startDate?.substring(0, 10)}
                onChange={(e) => setEditSprint({ ...editSprint, startDate: e.target.value })}
                className="border p-2 w-full rounded"
              />
              <input
                type="date"
                value={editSprint.endDate?.substring(0, 10)}
                onChange={(e) => setEditSprint({ ...editSprint, endDate: e.target.value })}
                className="border p-2 w-full rounded"
              />
            </div>

            <label className="block font-medium mb-1">Team Members</label>
            <select
              multiple
              value={editSprint.teamMembers?.map(u => u._id) || []}
              onChange={(e) =>
                setEditSprint({
                  ...editSprint,
                  teamMembers: Array.from(e.target.selectedOptions, opt => {
                    const fullUser = allUsers.find(u => u._id === opt.value);
                    return { _id: fullUser._id, name: fullUser.name };
                  })
                })
              }
              className="border p-2 w-full h-32 rounded mb-4"
            >
              {allUsers.map((user) => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>

            <div className="mb-4">
              <label className="block font-medium mb-1">User Stories</label>
              {(editSprint.userStories || []).map((us, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                  <select
                    value={us.storyId?._id || ""}
                    onChange={(e) => {
                      const updated = [...editSprint.userStories];
                      updated[idx].storyId = allStories.find(st => st._id === e.target.value);
                      setEditSprint({ ...editSprint, userStories: updated });
                    }}
                    className="border p-2 rounded"
                  >
                    <option value="">Select</option>
                    {allStories.map(story => (
                      <option key={story._id} value={story._id}>{story.title}</option>
                    ))}
                  </select>
                  <select
                    value={us.tshirtSize}
                    onChange={(e) => {
                      const selectedSize = e.target.value;
                      const hours = estimations.find(est => est.label === selectedSize)?.hours || 0;
                      const updated = [...editSprint.userStories];
                      updated[idx].tshirtSize = selectedSize;
                      updated[idx].estimatedHours = hours;
                      setEditSprint({ ...editSprint, userStories: updated });
                    }}
                    className="border p-2 rounded"
                  >
                    {/* {['XS','S','M','L','XL'].map(size => <option key={size} value={size}>{size}</option>)} */}
                    {estimations.map(est => (
                      <option key={est.label} value={est.label}>
                        {est.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={us.estimatedHours}
                    readOnly
                    className="border p-2 rounded bg-gray-100"
                  />
                  <button
                    onClick={() => {
                      const updated = [...editSprint.userStories];
                      updated.splice(idx, 1);
                      setEditSprint({ ...editSprint, userStories: updated });
                    }}
                    className="bg-red-600 text-white px-2 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditSprint({
                  ...editSprint,
                  userStories: [...(editSprint.userStories || []), {
                    storyId: null, tshirtSize: '', estimatedHours: 0
                  }]
                })}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Add Story
              </button>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={async () => {
                  try {
                    const sprintId = editSprint._id;
                    await axios.put(`/sprints/${sprintId}`, {
                      name: editSprint.name,
                      startDate: editSprint.startDate,
                      endDate: editSprint.endDate
                    });

                    const teamIds = editSprint.teamMembers.map(m => m._id);
                    await axios.put(`/sprints/${sprintId}/team`, { teamMembers: teamIds });

                    const stories = editSprint.userStories.map(story => ({
                      storyId: story.storyId._id,
                      tshirtSize: story.tshirtSize,
                      estimatedHours: story.estimatedHours
                    }));
                    await axios.put(`/sprints/${sprintId}/stories`, { userStories: stories });

                    setEditSprint(null);
                    fetchSprints();
                    alert("Sprint updated!");
                  } catch (err) {
                    console.error(err);
                    alert("Error updating sprint");
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditSprint(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintDetailsView;
