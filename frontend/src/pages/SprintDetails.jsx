// SprintDetails.jsx – Updated to include task grid and create/edit support

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axiosInstance";

const SprintDetails = () => {
  const { sprintId } = useParams();
  const [sprint, setSprint] = useState(null);
  const [tasksByStory, setTasksByStory] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    estimatedHours: "",
    actualHours: "",
    status: "To Do",
    assignedTo: ""
  });
  const [editTask, setEditTask] = useState(null);
  const [taskLoading, setTaskLoading] = useState(false);

  useEffect(() => {
    const fetchSprint = async () => {
      try {
        const res = await axios.get(`/sprints/${sprintId}/details`);
        setSprint(res.data);
        for (let story of res.data.userStories) {
          fetchTasks(story.storyId._id);
        }
      } catch (err) {
        console.error("Error fetching sprint details", err);
      }
    };
    fetchSprint();
    axios.get("/users").then(res => setAllUsers(res.data));
  }, [sprintId]);

  const fetchTasks = async (storyId) => {
    try {
      const res = await axios.get(`/tasks`, {
        params: { userStoryId: storyId }
      });
      setTasksByStory(prev => ({ ...prev, [storyId]: res.data }));
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  const handleCreateTask = async () => {
    try {
      await axios.post("/tasks", {
        ...newTask,
        userStoryId: activeStoryId,
        sprintId: sprintId
      });
      setShowTaskModal(false);
      setNewTask({ title: "", description: "", estimatedHours: "", actualHours: "", status: "To Do", assignedTo: "" });
      fetchTasks(activeStoryId);
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const handleDeleteTask = async (taskId, storyId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`/tasks/${taskId}`);
      fetchTasks(storyId);
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  if (!sprint) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">📌 Sprint Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded shadow">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Sprint Info</h3>
          <p><strong>Name:</strong> {sprint.name}</p>
          <p><strong>Start Date:</strong> {sprint.startDate?.substring(0, 10)}</p>
          <p><strong>End Date:</strong> {sprint.endDate?.substring(0, 10)}</p>
          <p><strong>Created At:</strong> {new Date(sprint.createdAt).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(sprint.updatedAt).toLocaleString()}</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Project</h3>
          <p><strong>Name:</strong> {sprint.project?.name}</p>
          <p><strong>Description:</strong> {sprint.project?.description}</p>
          <p><strong>Start:</strong> {sprint.project?.startDate?.substring(0, 10)}</p>
          <p><strong>End:</strong> {sprint.project?.endDate?.substring(0, 10)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded shadow">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Epic</h3>
          <p><strong>Name:</strong> {sprint.epic?.name}</p>
          <p><strong>Description:</strong> {sprint.epic?.description}</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Team Members</h3>
          <ul className="list-disc pl-5">
            {sprint.teamMembers.map(member => (
              <li key={member._id}>{member.name} ({member.email})</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mb-10">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">📖 User Stories</h3>
        <div className="space-y-6">
          {sprint.userStories.map((story, idx) => (
            <div key={idx} className="border border-gray-200 rounded p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <p className="font-bold text-lg text-gray-800">{story.storyId?.title}</p>
                  <p className="text-gray-600">{story.storyId?.description}</p>
                </div>
                <div>
                  <p><strong>T-Shirt Size:</strong> {story.tshirtSize}</p>
                  <p><strong>Estimated Hours:</strong> {story.estimatedHours}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="font-semibold">Acceptance Criteria</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {story.storyId?.acceptanceCriteria?.map((ac, i) => (
                      <li key={i}>{ac}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-semibold">Dependencies</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {story.storyId?.dependencies?.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-semibold">Test Cases</p>
                  <div className="text-sm text-gray-700">
                    <p className="underline">Positive:</p>
                    <ul className="list-disc pl-5">
                      {story.storyId?.testCases?.positive?.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                    <p className="underline mt-2">Negative:</p>
                    <ul className="list-disc pl-5">
                      {story.storyId?.testCases?.negative?.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-800">Tasks</p>
                  <button
                    onClick={() => {
                      setActiveStoryId(story.storyId._id);
                      setShowTaskModal(true);
                    }}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                  >
                    + Add Task
                  </button>
                </div>

                {tasksByStory[story.storyId._id]?.length > 0 ? (
                  <div className="grid grid-cols-7 gap-2 text-sm mt-2">
                    <div className="font-semibold">Title</div>
                    <div className="font-semibold">Description</div>
                    <div className="font-semibold">Assigned</div>
                    <div className="font-semibold">Est. Hrs</div>
                    <div className="font-semibold">Act. Hrs</div>
                    <div className="font-semibold">Status</div>
                    <div className="font-semibold">Actions</div>
                    {tasksByStory[story.storyId._id].map(task => (
                      <React.Fragment key={task._id}>
                        <div>{task.title}</div>
                        <div>{task.description}</div>
                        <div>{task.assignedTo?.name}</div>
                        <div>{task.estimatedHours}</div>
                        <div>{task.actualHours || 0}</div>
                        <div>{task.status}</div>
                        <div className="space-x-1">
                          <button
                            onClick={() => setEditTask(task)}
                            className="text-xs text-blue-600"
                          >✏️</button>
                          <button
                            onClick={() => handleDeleteTask(task._id, story.storyId._id)}
                            className="text-xs text-red-600"
                          >🗑️</button>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                )
                :
                (
                  <p className="text-sm text-gray-500">No tasks added.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Task</h3>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Title"
              className="border p-2 w-full mb-2 rounded"
            />
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Description"
              className="border p-2 w-full mb-2 rounded"
            />
            <input
              type="number"
              value={newTask.estimatedHours}
              onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
              placeholder="Estimated Hours"
              className="border p-2 w-full mb-2 rounded"
            />
            <input
              type="number"
              value={newTask.actualHours}
              onChange={(e) => setNewTask({ ...newTask, actualHours: e.target.value })}
              placeholder="Actual Hours"
              className="border p-2 w-full mb-2 rounded"
            />
            <select
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
            >
              {['To Do', 'In Progress', 'Blocked', 'Done'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              className="border p-2 w-full mb-4 rounded"
            >
              <option value="">Assign To</option>
              {/* {allUsers.map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))} */}
              {sprint?.teamMembers?.map(member => (
                <option key={member._id} value={member._id}>{member.name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTaskModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
              <button onClick={handleCreateTask} className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Edit Task</h3>
            <input
              type="text"
              value={editTask.title}
              onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
              placeholder="Task Title"
            />
            <textarea
              value={editTask.description}
              onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
              placeholder="Description"
            />
            <input
              type="number"
              value={editTask.estimatedHours}
              onChange={(e) => setEditTask({ ...editTask, estimatedHours: e.target.value })}
              placeholder="Estimated Hours"
              className="border p-2 w-full mb-2 rounded"
            />
            {/* <input
              type="number"
              value={editTask.actualHours}
              onChange={(e) => setNewTask({ ...newTask, actualHours: e.target.value })}
              placeholder="Actual Hours"
              className="border p-2 w-full mb-2 rounded"
            /> */}
            <label className="block mb-1">Assign To</label>
            <select
              value={editTask.assignedTo?._id || editTask.assignedTo}
              onChange={(e) => setEditTask({ ...editTask, assignedTo: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
            >
              <option value="">-- Select User --</option>
              {allUsers.map((user) => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
            <label className="block mb-1">Status</label>
            <select
              value={editTask.status}
              onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
            >
              {['To Do', 'In Progress', 'Blocked', 'Done'].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditTask(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >Cancel</button>
              <button
                onClick={async () => {
                  try {
                    setTaskLoading(true);
                    await axios.put(`/tasks/${editTask._id}`, {
                      title: editTask.title,
                      description: editTask.description,
                      estimatedHours: editTask.estimatedHours,
                      assignedTo: typeof editTask.assignedTo === "object" ? editTask.assignedTo._id : editTask.assignedTo,
                      status: editTask.status
                    });
                    setEditTask(null);
                    setTaskLoading(false);
                    fetchTasks(editTask.userStoryId);
                  } catch (err) {
                    console.error(err);
                    alert("Failed to update task");
                    setTaskLoading(false);
                  }
                }}
                disabled={taskLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >{taskLoading ? "Updating..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintDetails;
