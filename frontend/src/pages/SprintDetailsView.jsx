import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar, 
  Users, 
  Flag, 
  Clock,
  Plus,
  X,
  Save
} from 'lucide-react';

const SprintDetailsView = () => {
  const [sprints, setSprints] = useState([]);
  const [editSprint, setEditSprint] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allStories, setAllStories] = useState([]);
  const [estimations, setEstimations] = useState([]);

  const navigate = useNavigate();

  const fetchSprints = async () => {
    try {
      const res = await axios.get("/sprints/details");
      setSprints(res.data);
    } catch (err) {
      console.error("Failed to fetch sprint details:", err);
    }
  };

  const handleDelete = async (id) => {
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

  const getSizeColor = (size) => {
    switch(size) {
      case 'XS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'S': return 'bg-green-100 text-green-700 border-green-200';
      case 'M': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'L': return 'bg-red-100 text-red-700 border-red-200';
      case 'XL': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTotalHours = (userStories) => {
    return (userStories || []).reduce((sum, story) => sum + (story.estimatedHours || 0), 0);
  };

  const getProgress = () => Math.floor(Math.random() * 80) + 20; // Mock progress

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  };

  const handleSaveEdit = async () => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  p-2">
      <div className="">
        {/* Page Header */}
        <div className="mb-5">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            All Sprint Details
          </h1>
          <p className="text-gray-600 mt-2">Manage and view all your sprint information</p>
        </div>

        {/* Sprint Cards */}
        <div className="space-y-6">
          {sprints.map((sprint) => (
            <div key={sprint._id} className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-2xl p-6">
              {/* Header Section */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {sprint.name}
                  </h2>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-2">
                      <Calendar size={16} />
                      {formatDateRange(sprint.startDate, sprint.endDate)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users size={16} />
                      {(sprint.teamMembers || []).length} members
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setEditSprint(sprint)}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(sprint._id)}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <button 
                    onClick={() => navigate(`/sprint/${sprint._id}/details`)}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <p className="text-gray-600">Project</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Flag size={16} className="text-blue-500" />
                    <span className="font-semibold text-blue-700">
                      {sprint.project?.name || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <p className="text-gray-600">Epic</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Flag size={16} className="text-purple-500" />
                    <span className="font-semibold text-purple-700">
                      {sprint.epic?.name || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                  <p className="text-gray-600">Total Hours</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={16} className="text-green-500" />
                    <span className="font-semibold text-green-700">
                      {getTotalHours(sprint.userStories)}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                <div className="flex gap-4 flex-wrap">
                  {(sprint.teamMembers || []).map((member) => (
                    <div key={member._id} className="group relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-110 transition-transform">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {member.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Stories */}
              <div>
                <h3 className="text-lg font-semibold mb-4">User Stories</h3>
                <div className="space-y-4">
                  {(sprint.userStories || []).map((userStory, index) => (
                    <div key={userStory.storyId?._id || index} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold mb-2">
                            {userStory.storyId?.title || "Untitled Story"}
                          </h4>
                          <p className="text-gray-600">
                            {userStory.storyId?.description || "No description"}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <span className={`px-3 py-1 rounded-full text-sm border ${getSizeColor(userStory.tshirtSize)}`}>
                            Size: {userStory.tshirtSize}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 border border-blue-200">
                            {userStory.estimatedHours}h
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${userStory.estimatedHours}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editSprint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Edit Sprint
                  </h3>
                  <button 
                    onClick={() => setEditSprint(null)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Sprint Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sprint Name</label>
                  <input
                    type="text"
                    value={editSprint.name}
                    onChange={(e) => setEditSprint({ ...editSprint, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter sprint name"
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={editSprint.startDate?.substring(0, 10)}
                      onChange={(e) => setEditSprint({ ...editSprint, startDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={editSprint.endDate?.substring(0, 10)}
                      onChange={(e) => setEditSprint({ ...editSprint, endDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Team Members */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32"
                  >
                    {allUsers.map((user) => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple members</p>
                </div>

                {/* User Stories */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">User Stories</label>
                    <button
                      onClick={() => setEditSprint({
                        ...editSprint,
                        userStories: [...(editSprint.userStories || []), {
                          storyId: null, tshirtSize: '', estimatedHours: 0
                        }]
                      })}
                      className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus size={16} />
                      Add Story
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(editSprint.userStories || []).map((us, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Story</label>
                            <select
                              value={us.storyId?._id || ""}
                              onChange={(e) => {
                                const updated = [...editSprint.userStories];
                                updated[idx].storyId = allStories.find(st => st._id === e.target.value);
                                setEditSprint({ ...editSprint, userStories: updated });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select Story</option>
                              {allStories.map(story => (
                                <option key={story._id} value={story._id}>{story.title}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Size</option>
                              {['XS','S','M','L','XL'].map(size => <option key={size} value={size}>{size}</option>)}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Hours</label>
                            <input
                              type="number"
                              value={us.estimatedHours}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                          </div>
                          
                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                const updated = [...editSprint.userStories];
                                updated.splice(idx, 1);
                                setEditSprint({ ...editSprint, userStories: updated });
                              }}
                              className="w-full bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <X size={16} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setEditSprint(null)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintDetailsView;