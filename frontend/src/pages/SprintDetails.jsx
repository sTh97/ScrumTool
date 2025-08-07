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
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedStories, setExpandedStories] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
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

  const toggleStoryExpansion = (storyId) => {
    setExpandedStories(prev => ({
      ...prev,
      [storyId]: !prev[storyId]
    }));
  };

  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  if (!sprint) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl text-gray-600">Loading sprint details...</p>
      </div>
    </div>
  );

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
    const diff = new Date(to) - new Date(from);
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'To Do': 'bg-gray-100 text-gray-700 border-gray-300',
      'In Progress': 'bg-blue-100 text-blue-700 border-blue-300',
      'Paused': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'Done': 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[status] || colors['To Do'];
  };

  const taskStats = sprint?.userStories?.reduce((acc, story) => {
    const tasks = tasksByStory[story.storyId._id] || [];
    tasks.forEach(task => {
      acc[task.status] = (acc[task.status] || 0) + 1;
    });
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{sprint.name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {sprint.startDate?.substring(0, 10)} - {sprint.endDate?.substring(0, 10)}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {sprint.teamMembers?.length} members
                </span>
              </div>
            </div>
            
            {/* Task Statistics */}
            <div className="flex items-center space-x-2">
              {Object.entries(taskStats).map(([status, count]) => (
                <div key={status} className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                  {status}: {count}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-6 mb-6">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'stories', name: 'User Stories', icon: '📋' },
            { id: 'team', name: 'Team', icon: '👥' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Sprint Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(sprint.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium">{new Date(sprint.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                Project Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-900">{sprint.project?.name}</span>
                </div>
                <div className="text-gray-600 text-xs">
                  {sprint.project?.description}
                </div>
                <div className="text-xs text-gray-500">
                  {sprint.project?.startDate?.substring(0, 10)} - {sprint.project?.endDate?.substring(0, 10)}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Epic
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-900">{sprint.epic?.name}</span>
                </div>
                <div className="text-gray-600 text-xs">
                  {sprint.epic?.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sprint.teamMembers?.map(member => (
                <div key={member._id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {member.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <div className="space-y-4">
            {sprint.userStories?.map((story, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Story Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleStoryExpansion(story.storyId._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {story.storyId?.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {story.storyId?.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                          Size: {story.tshirtSize}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {story.estimatedHours}h estimated
                        </span>
                        <span className="text-gray-500">
                          {tasksByStory[story.storyId._id]?.length || 0} tasks
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStoryId(story.storyId._id);
                          setShowTaskModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                      >
                        + Add Task
                      </button>
                      <svg 
                        className={`w-5 h-5 text-gray-500 transition-transform ${expandedStories[story.storyId._id] ? 'rotate-180' : ''}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Story Content */}
                {expandedStories[story.storyId._id] && (
                  <div className="border-t bg-gray-50">
                    {/* Story Details Grid */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 border-b">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Acceptance Criteria</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {story.storyId?.acceptanceCriteria?.map((ac, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              {ac}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Dependencies</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {story.storyId?.dependencies?.map((d, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-orange-500 mr-2">⚠</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Test Cases</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="font-medium text-green-600 mb-1">Positive:</p>
                            <ul className="space-y-1 text-gray-700">
                              {story.storyId?.testCases?.positive?.map((t, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="text-green-500 mr-2">+</span>
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-red-600 mb-1">Negative:</p>
                            <ul className="space-y-1 text-gray-700">
                              {story.storyId?.testCases?.negative?.map((t, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="text-red-500 mr-2">-</span>
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tasks Section */}
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Tasks</h4>
                      {tasksByStory[story.storyId._id]?.length > 0 ? (
                        <div className="space-y-3">
                          {tasksByStory[story.storyId._id].map((task) => (
                            <div key={task._id} className="bg-white rounded-lg border">
                              {/* Task Header */}
                              <div 
                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleTaskExpansion(task._id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h5 className="font-medium text-gray-900">{task.title}</h5>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                        {task.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <span>👤 {task.assignedTo?.name}</span>
                                      <span>⏱ {task.estimatedHours}h est</span>
                                      <span>✅ {task.actualHours || 0}h actual</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditTask(task);
                                      }}
                                      className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task._id, story.storyId._id);
                                      }}
                                      className="text-red-600 hover:bg-red-100 p-1 rounded"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                    <svg 
                                      className={`w-4 h-4 text-gray-400 transition-transform ${expandedTasks[task._id] ? 'rotate-180' : ''}`} 
                                      fill="currentColor" 
                                      viewBox="0 0 20 20"
                                    >
                                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Task Content */}
                              {expandedTasks[task._id] && (
                                <div className="border-t bg-gray-50 p-4 space-y-4">
                                  <div>
                                    <p className="text-sm text-gray-700">{task.description}</p>
                                  </div>

                                  {/* Change Log */}
                                  {task.changeLog?.length > 0 && (
                                    <div className="bg-amber-50 rounded-lg p-3">
                                      <h6 className="font-medium text-amber-800 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Change Log
                                      </h6>
                                      <div className="max-h-32 overflow-y-auto space-y-1">
                                        {[...task.changeLog].reverse().map((log, index) => (
                                          <div key={index} className="text-xs bg-white rounded p-2">
                                            <span className="font-medium text-blue-600">{log.field}</span> changed 
                                            from <span className="text-red-600 font-mono">{renderValue(log.field, log.oldValue)}</span> to{" "}
                                            <span className="text-green-600 font-mono">{renderValue(log.field, log.newValue)}</span>
                                            <div className="text-gray-500 mt-1">
                                              by {resolveUserName(log.changedBy)} • {new Date(log.changedAt).toLocaleString()}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Active Sessions */}
                                  <div className="bg-indigo-50 rounded-lg p-3">
                                    <h6 className="font-medium text-indigo-800 mb-2 flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      </svg>
                                      Time Tracking
                                    </h6>
                                    {task.activeSessions?.length > 0 ? (
                                      <div className="max-h-32 overflow-y-auto space-y-1">
                                        {task.activeSessions.map((session, i) => (
                                          <div key={i} className="text-xs bg-white rounded p-2">
                                            <div className="flex items-center justify-between">
                                              <span>
                                                {new Date(session.from).toLocaleString()} → {" "}
                                                {session.to ? new Date(session.to).toLocaleString() : "Ongoing"}
                                              </span>
                                              {session.to && (
                                                <span className="font-mono text-indigo-600">
                                                  {formatDuration(session.from, session.to)}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-indigo-600">No tracked sessions</p>
                                    )}
                                  </div>

                                  {/* Chat Section */}
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <h6 className="font-medium text-blue-800 mb-3 flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                      </svg>
                                      Team Chat
                                    </h6>
                                    
                                    {/* Chat Messages */}
                                    <div className="max-h-40 overflow-y-auto mb-3 space-y-2">
                                      {[...(task.chatHistory || [])].reverse().map((msg, idx) => (
                                        <div key={idx} className="bg-white rounded-lg p-2 shadow-sm">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-blue-700 text-xs">
                                              {msg.addedBy?.name || 'User'}
                                            </span>
                                            <span className="text-gray-400 text-xs">
                                              {new Date(msg.timestamp).toLocaleString()}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-700">{msg.message}</p>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Chat Input */}
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={chatInputs[task._id] || ""}
                                        onChange={(e) => handleChatInputChange(task._id, e.target.value)}
                                        className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSendChat(task._id, story.storyId._id);
                                          }
                                        }}
                                      />
                                      <button
                                        onClick={() => handleSendChat(task._id, story.storyId._id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                      >
                                        Send
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p>No tasks created yet. Click "Add Task" to get started.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Task</h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Describe the task"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                  <input
                    type="number"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value="To Do"
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    <option value="To Do">To Do</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">New tasks start with "To Do" status</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select team member</option>
                    {sprint?.teamMembers?.map(member => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Task</h3>
                <button
                  onClick={() => setEditTask(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                  <input
                    type="text"
                    value={editTask.title}
                    onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editTask.description}
                    onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                  <input
                    type="number"
                    value={editTask.estimatedHours}
                    onChange={(e) => setEditTask({ ...editTask, estimatedHours: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                  <select
                    value={editTask.assignedTo?._id || editTask.assignedTo}
                    onChange={(e) => setEditTask({ ...editTask, assignedTo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select team member</option>
                    {sprint?.teamMembers?.map((member) => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editTask.status}
                    onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {['To Do', 'In Progress', 'Paused', 'Done'].map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setEditTask(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      setTaskLoading(true);
                      await axios.put(`/tasks/${editTask._id}`, {
                        title: editTask.title,
                        description: editTask.description,
                        estimatedHours: editTask.estimatedHours,
                        assignedTo: typeof editTask.assignedTo === "object" ? editTask.assignedTo._id : editTask.assignedTo,
                        status: editTask.status,
                        changedBy: loggedInUserId,
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {taskLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintDetails;
