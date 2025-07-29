
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axiosInstance";
import { Divider } from 'antd';
import { Drawer } from 'antd';

const SprintDetails = () => {
  const { sprintId } = useParams();
  const [sprint, setSprint] = useState(null);
  const [tasksByStory, setTasksByStory] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState("");
  const [openDrawer, setOpenDrawer] = useState({
    changeLog: false,
    activeSessions: false,
    chatHistory: false
  });
  const [selectedTask, setSelectedTask] = useState(null);

  const handleOpenDrawer = (task, type) => {
    setSelectedTask(task);
    setOpenDrawer(prev => ({ ...prev, [type]: true }));
  };

  const handleCloseDrawer = (type) => {
    setOpenDrawer(prev => ({ ...prev, [type]: false }));
  };

  // Helper function to calculate duration
  const calculateDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };


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
  const loggedInUserId = localStorage.getItem("userId");
  const [drawerOpen, setDrawerOpen] = useState(false);



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

  const resolveUserName = (id) => {
    const user = allUsers.find(u => u._id === id);
    return user ? user.name : id;
  };

  const renderValue = (field, value) => {
    if (value === null || value === undefined) return "Empty";
    if (field === "assignedTo") return resolveUserName(value);
    return value.toString();
  };

  const formatDuration = (from, to) => {
    if (!from || !to) return "";
    const diff = new Date(to) - new Date(from); // in milliseconds
    const totalSeconds = Math.floor(diff / 1000);

    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Sprint Details</h2>

      {/* Top info retained */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded shadow">
          {/* <h3 className="text-xl font-semibold text-gray-700 mb-2">Sprint Info</h3> */}
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


              <div className="overflow-x-auto bg- ">
                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md ">
                  <thead className="bg-gray-700 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Story Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Metrics</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Acceptance Criteria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Dependencies</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Test Cases</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      {/* Story Details */}
                      <td className="px-6 py-4 whitespace-normal">
                        <p className="font-bold text-lg text-gray-800 mb-1">{story.storyId?.title}</p>
                        <p className="text-gray-600 text-sm">{story.storyId?.description}</p>
                      </td>

                      {/* Metrics */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="mb-1"><span className="font-semibold">T-Shirt Size:</span> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{story.tshirtSize}</span></p>
                        <p><span className="font-semibold">Estimated Hours:</span> <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{story.estimatedHours}</span></p>
                      </td>

                      {/* Acceptance Criteria */}
                      <td className="px-6 py-4 whitespace-normal">
                        <ul className="space-y-1 text-sm text-gray-700">
                          {story.storyId?.acceptanceCriteria?.map((ac, i) => (
                            <li key={i} className="flex items-start">
                              <span className="inline-block bg-purple-100 text-purple-800 rounded-full p-1 mr-2">✓</span>
                              {ac}
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Dependencies */}
                      <td className="px-6 py-4 whitespace-normal">
                        <ul className="space-y-1 text-sm text-gray-700">
                          {story.storyId?.dependencies?.map((d, i) => (
                            <li key={i} className="flex items-start">
                              <span className="inline-block bg-yellow-100 text-yellow-800 rounded-full p-1 mr-2">↗</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Test Cases */}
                      <td className="px-6 py-4 whitespace-normal">
                        <div className="text-sm text-gray-700 flex space-x-2">
                          <div>
                            <p className="font-medium text-red-600">Positive:</p>
                            <ul className="mt-1 space-y-1 pl-2">
                              {story.storyId?.testCases?.positive?.map((t, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="inline-block bg-green-100 text-green-800 rounded-full p-1 mr-2">+</span>
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-red-600">Negative:</p>
                            <ul className="mt-1 space-y-1 pl-2">
                              {story.storyId?.testCases?.negative?.map((t, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="inline-block bg-red-100 text-red-800 rounded-full p-1 mr-2">-</span>
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Divider />

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
                    {/* Table Header - Only shown once at the top */}
                    <div className="col-span-10">
                      <table className="w-full mt-4 text-sm px-2 py-1 border border-gray-300 rounded-lg">
                        <thead className="bg-blue-200 py-4 px-2 border border-gray-300 rounded-lg">
                          <tr className="grid grid-cols-10 gap-2">
                            <th className="font-semibold text-left px-2 py-2">Title</th>
                            <th className="font-semibold text-left px-2 py-2">Description</th>
                            <th className="font-semibold text-left px-2 py-2">Assigned</th>
                            <th className="font-semibold text-left px-2 py-2">Est. Hrs</th>
                            <th className="font-semibold text-left px-2 py-2">Act. Hrs</th>
                            <th className="font-semibold text-left px-2 py-2">Status</th>
                            <th className="font-semibold text-left px-2 py-2">Change Logs</th>
                            <th className="font-semibold text-left px-2 py-2">Active Sessions</th>
                            <th className="font-semibold text-left px-2 py-2">Chat History</th>
                            <th className="font-semibold text-left px-2 py-2">Actions</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    {tasksByStory[story.storyId._id].map((task, index) => (
                      <React.Fragment key={task._id}>
                        <div className="col-span-10 grid grid-cols-7 gap-2 mt-1 text-sm bg-stone-100 px-2 py-1 rounded">
                          <table className="col-span-10 w-full text-sm px-2 py-1 rounded">
                            <tbody>
                              <tr className="grid grid-cols-10 gap-2 py-1">
                                <td>{task.title}</td>
                                <td>{task.description}</td>
                                <td>{task.assignedTo?.name}</td>
                                <td>{task.estimatedHours}</td>
                                <td>{task.actualHours || 0}</td>
                                <td>{task.status}</td>
                                <td>
                                  {task.changeLog?.length > 0 && (
                                    <button
                                      onClick={() => handleOpenDrawer(task, 'changeLog')}
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      Changes Logs({task.changeLog.length})
                                    </button>
                                  )}
                                </td>
                                <td>
                                  {task.activeSessions?.length > 0 && (
                                    <button
                                      onClick={() => handleOpenDrawer(task, 'activeSessions')}
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      Active Sessions ({task.activeSessions.length})
                                    </button>
                                  )}
                                </td>
                                <td>
                                  {task.chatHistory?.length > 0 && (
                                    <button
                                      onClick={() => handleOpenDrawer(task, 'chatHistory')}
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      Chat History ({task.chatHistory.length})
                                    </button>
                                  )}
                                </td>
                                <td className="space-x-1">
                                  <button
                                    onClick={() => setEditTask(task)}
                                    className="text-xs text-blue-600"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task._id, story.storyId._id)}
                                    className="text-xs text-red-600"
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </React.Fragment>
                    ))}

                    {/* Drawers outside the mapping */}
                    <Drawer
                      title={`Change Logs for ${selectedTask?.title || 'Task'}`}
                      placement="right"
                      onClose={() => handleCloseDrawer('changeLog')}
                      open={openDrawer.changeLog}
                      width={600}
                    >
                      {selectedTask?.changeLog?.map((log, index) => (
                        <div className="col-span-7 mt-2 px-3 py-2 bg-yellow-50 border rounded text-xs text-gray-800">
                          <p className="font-bold text-gray-700 mb-1">Change Log</p>
                          <div className="max-h-40 overflow-y-auto pr-2">
                            <ul className="list-disc pl-5 space-y-1">
                              {[...selectedTask.changeLog].reverse().map((log, index) => (
                                <li key={index}>
                                  <span className="text-blue-600 font-semibold">{log.field}</span>{" "}
                                  changed from{" "}
                                  <span className="text-red-600 italic">
                                    {renderValue(log.field, log.oldValue)}
                                  </span>{" "}
                                  to{" "}
                                  <span className="text-green-600 italic">
                                    {renderValue(log.field, log.newValue)}
                                  </span>{" "}
                                  by{" "}
                                  <span className="text-purple-600 font-medium">
                                    {resolveUserName(log.changedBy)}
                                  </span>{" "}
                                  <span className="text-gray-500 text-[11px] ml-1">
                                    ({new Date(log.changedAt).toLocaleString()})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </Drawer>

                    <Drawer
                      title={`Active Sessions for ${selectedTask?.title || 'Task'}`}
                      placement="right"
                      onClose={() => handleCloseDrawer('activeSessions')}
                      open={openDrawer.activeSessions}
                      width={600}
                    >
                      {selectedTask?.activeSessions?.length > 0 ? (
                        <div className="mt-2 px-3 py-2 bg-indigo-50 border rounded text-xs text-gray-800">
                          <p className="font-bold text-gray-700 mb-1">Active Sessions</p>
                          <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                            <ul className="list-disc pl-5 space-y-1">
                              {selectedTask.activeSessions.map((s, i) => (
                                <li key={i}>
                                  <span className="text-blue-700 font-semibold">From</span>{" "}
                                  <span className="text-gray-800">{new Date(s.from).toLocaleString()}</span>{" "}
                                  <span className="text-blue-700 font-semibold">to</span>{" "}
                                  <span className="text-gray-800">
                                    {s.to ? new Date(s.to).toLocaleString() : "Ongoing"}
                                  </span>
                                  {s.to && (
                                    <>
                                      {" "}
                                      <span className="text-purple-700 font-semibold ml-2">Duration:</span>{" "}
                                      <span className="text-purple-800 font-mono">
                                        {formatDuration(s.from, s.to)}
                                      </span>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 px-3 py-2 bg-yellow-50 border rounded text-xs text-gray-800">
                          <p className="font-bold text-gray-700 mb-1">Active Sessions</p>
                          <p className="text-gray-600 italic">No tracked sessions</p>
                        </div>
                      )}
                    </Drawer>

                    <Drawer
                      title={`Chat History for ${selectedTask?.title || 'Task'}`}
                      placement="right"
                      onClose={() => handleCloseDrawer('chatHistory')}
                      open={openDrawer.chatHistory}
                      width={600}
                    >
                      <div className="bg-gray-50 p-2 rounded border">
                        <p className="font-bold text-sm text-gray-800 mb-1">Chat History</p>
                        {selectedTask?.chatHistory?.length > 0 ? (
                          <ul className="pl-3 text-xs text-gray-800 space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                            {[...(selectedTask.chatHistory || [])].reverse().map((msg, idx) => (
                              <li key={idx} className="bg-white rounded px-3 py-2 border shadow-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-blue-700 font-semibold">{msg.addedBy?.name || 'User'}</span>
                                  <span className="text-gray-400 text-[11px]">
                                    {new Date(msg.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-gray-700 mt-1">{msg.message}</div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-600 italic">No chat history</p>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <input
                            type="text"
                            placeholder="Type a message..."
                            value={chatInputs[selectedTask?._id] || ""}
                            onChange={(e) => handleChatInputChange(selectedTask?._id, e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                          <button
                            onClick={() => handleSendChat(selectedTask?._id, story.storyId._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </Drawer>
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
              {
                // allUsers.map((user) => (
                //   <option key={user._id} value={user._id}>{user.name}</option>
                sprint?.teamMembers?.map((member) => (
                  <option key={member._id} value={member._id}>{member.name}</option>
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
                      // assignedTo: typeof editTask.assignedTo === "object" ? editTask.assignedTo._id : editTask.assignedTo,
                      assignedTo: typeof editTask.assignedTo === "object" ? editTask.assignedTo._id : editTask.assignedTo,
                      status: editTask.status,
                      changedBy: loggedInUserId, // ✅ pass this
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




      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setDrawerOpen(false)}
          ></div>

          {/* Drawer panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-6 border-b">
                  <h3 className="text-lg font-bold">Change Log</h3>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {selectedTask?.changeLog?.length > 0 ? (
                    <ul className="space-y-3">
                      {[...selectedTask.changeLog].reverse().map((log, index) => (
                        <li key={index} className="border-b pb-3 last:border-b-0">
                          <div className="text-sm font-medium text-blue-600">
                            {log.field} changed
                          </div>
                          <div className="text-xs mt-1 flex items-center">
                            <span className="text-red-500 line-through mr-2">
                              {renderValue(log.field, log.oldValue)}
                            </span>
                            <span className="text-gray-400 mx-1">→</span>
                            <span className="text-green-600 ml-1">
                              {renderValue(log.field, log.newValue)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            <span>By </span>
                            <span className="text-purple-600">
                              {resolveUserName(log.changedBy)}
                            </span>
                            <span className="ml-2">
                              {new Date(log.changedAt).toLocaleString()}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No changes recorded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SprintDetails;
