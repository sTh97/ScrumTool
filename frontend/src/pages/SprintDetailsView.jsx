import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Sprint Details</h2>
      {sprints.map((sprint) => (
        <div key={sprint._id} className="border rounded p-4 mb-6 shadow-sm bg-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{sprint.name}</h3>
            <div className="space-x-2">
              <button
                onClick={() => setEditSprint(sprint)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(sprint._id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => navigate(`/sprint/${sprint._id}/details`)}
                className="bg-gray-600 text-white px-3 py-1 rounded"
              >
                View Details
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Project:</strong> {sprint.project?.name || "N/A"}<br />
            <strong>Epic:</strong> {sprint.epic?.name || "N/A"}
          </p>

          <div className="mt-4">
            <strong>Team Members:</strong>
            <ul className="list-disc list-inside ml-4">
              {(sprint.teamMembers || []).map((u) => (
                <li key={u._id}>{u.name}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <strong>User Stories:</strong>
            <ul className="list-disc list-inside ml-4">
              {(sprint.userStories || []).map((us) => (
                <li key={us.storyId?._id}>
                  <div>
                    <strong>{us.storyId?.title}</strong> — {us.storyId?.description}
                  </div>
                  <div className="text-sm text-gray-500 ml-2">
                    Size: {us.tshirtSize} | Est. Hours: {us.estimatedHours}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

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
                    {['XS','S','M','L','XL'].map(size => <option key={size} value={size}>{size}</option>)}
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



