// SprintDetails.jsx – Updated with statusChangeLog and activeSessions display (structure retained exactly)

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
  const [chatInputs, setChatInputs] = useState({});
  const loggedInUserId = localStorage.getItem("userId"); // 👈 Needed to log who sent the message
  // const loggedInUserId = localStorage.getItem("userId") || "687f4274f9a2056615393fb0"; // TEMP fallback for testing


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

  const handleChatInputChange = (taskId, value) => {
  setChatInputs(prev => ({ ...prev, [taskId]: value }));
};

const handleSendChat = async (taskId, storyId) => {
  const message = chatInputs[taskId];
  if (!message?.trim()) return;

  try {
    await axios.put(`/tasks/${taskId}`, {
      newChatMessage: {
        message,
        addedBy: loggedInUserId,
      },
    });
    setChatInputs(prev => ({ ...prev, [taskId]: "" }));
    fetchTasks(storyId);
  } catch (err) {
    console.error("Failed to send chat message", err);
    alert("Failed to send message.");
  }
};


  if (!sprint) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Sprint Details</h2>

      {/* Top info retained */}

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
        <h3 className="text-xl font-semibold text-gray-700 mb-4">User Stories</h3>
        <div className="space-y-6">
          {sprint.userStories.map((story, idx) => (
            <div key={idx} className="border border-gray-200 rounded p-4">
              {/* Story details retained */}

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
                  >+ Add Task</button>
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
                    {tasksByStory[story.storyId._id].map((task, index) => (
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

                      {task.changeLog?.length > 0 && (
                        <div className="col-span-7 mt-2 px-3 py-2 bg-yellow-50 border rounded text-xs text-gray-800">
                          <p className="font-semibold text-gray-700 mb-1">📜 Change Log</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {task.changeLog.map((log, index) => (
                              <li key={index}>
                                <span className="text-blue-600 font-semibold">{log.field}</span>{" "}
                                changed from{" "}
                                <span className="text-red-600 italic">
                                  {log.oldValue === null || log.oldValue === undefined
                                    ? "Empty"
                                    : log.oldValue.toString()}
                                </span>{" "}
                                to{" "}
                                <span className="text-green-600 italic">
                                  {log.newValue === null || log.newValue === undefined
                                    ? "Empty"
                                    : log.newValue.toString()}
                                </span>{" "}
                                <span className="text-gray-500 text-[11px] ml-1">
                                  ({new Date(log.changedAt).toLocaleString()})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}


                      {/* ✅ Status & Time Logs */}
                      <div className="col-span-7 text-xs text-gray-600 pl-4 pb-3">
                        <p className="font-semibold">Status Log:</p>
                        <ul className="list-disc pl-5">
                          {task.statusChangeLog?.length > 0
                            ? task.statusChangeLog.map((log, i) => (
                                <li key={i}>{log.status} @ {new Date(log.changedAt).toLocaleString()}</li>
                              ))
                            : <li>No status changes</li>}
                        </ul>
                        <p className="font-semibold mt-1">Active Sessions:</p>
                        <ul className="list-disc pl-5">
                          {task.activeSessions?.length > 0
                            ? task.activeSessions.map((s, i) => (
                                <li key={i}>From {new Date(s.from).toLocaleString()} to {new Date(s.to).toLocaleString()}</li>
                              ))
                            : <li>No tracked sessions</li>}
                        </ul>
                      </div>

                      {/* ✅ Chat section */}
                      <div className="col-span-7 bg-gray-50 p-2 rounded border mt-2">
                        <p className="font-semibold text-sm text-gray-800 mb-1">💬 Chat History</p>
                        <ul className="pl-3 text-xs text-gray-700 space-y-1 max-h-40 overflow-y-auto">
                          {(task.chatHistory?.length > 0 ? task.chatHistory : []).map((msg, idx) => (
                            <li key={idx}>
                              <span className="font-semibold">{msg.addedBy?.name || 'User'}</span>: {msg.message}
                              <span className="text-gray-500 text-[11px] ml-2">({new Date(msg.timestamp).toLocaleString()})</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Type a message..."
                            value={chatInputs[task._id] || ""}
                            onChange={(e) => handleChatInputChange(task._id, e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-xs"
                          />
                          <button
                            onClick={() => handleSendChat(task._id, story.storyId._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                      
                    </React.Fragment>
                  ))}

                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No tasks added.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your modals for create/edit are unchanged */}
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
            {/* <input
              type="number"
              value={newTask.actualHours}
              onChange={(e) => setNewTask({ ...newTask, actualHours: e.target.value })}
              placeholder="Actual Hours"
              className="border p-2 w-full mb-2 rounded"
            /> */}
            {/* <select
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
            >
              {['To Do', 'In Progress', 'Paused', 'Done'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select> */}
            <select
              value="To Do" // 👈 force fixed value
              disabled       // 👈 make it non-editable
              className="border p-2 w-full mb-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
            >
              <option value="To Do">To Do</option>
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

      {editTask && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                  <h3 className="text-lg font-bold mb-4">Edit Task</h3>
                  <label>Title</label>
                  <input
                    type="text"
                    value={editTask.title}
                    onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                    className="border p-2 w-full mb-2 rounded"
                    placeholder="Task Title"
                  />
                  <label>Description</label>
                  <textarea
                    value={editTask.description}
                    onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                    className="border p-2 w-full mb-2 rounded"
                    placeholder="Description"
                  />
                  <label>Estimated Hours</label>
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
                    {['To Do', 'In Progress', 'Paused', 'Done'].map(status => (
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
