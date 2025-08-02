// import React, { useEffect, useState } from "react";
// import axios from "../api/axiosInstance";

// const TaskList = () => {
//   const [tasks, setTasks] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [updatingTaskId, setUpdatingTaskId] = useState(null);

//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         const res = await axios.get("/auth/me");
//         setCurrentUser(res.data);
//       } catch (err) {
//         console.error("Failed to fetch user", err);
//       }
//     };
//     fetchCurrentUser();
//   }, []);

//   useEffect(() => {
//     const fetchTasks = async () => {
//       try {
//         const res = await axios.get("/tasks");
//         const roles = currentUser?.roles || [];
//         const roleNames = Array.isArray(roles) ? roles.map(r => typeof r === "string" ? r : r.name) : [];

//         const isAdminOrManager = roleNames.includes("Admin") || roleNames.includes("Management");

//         const filteredTasks = isAdminOrManager
//         ? res.data
//         : res.data.filter(task => {
//             const assigned = task.assignedTo;
//             return assigned === currentUser?._id || assigned?._id === currentUser?._id;
//             });

//         setTasks(filteredTasks);
//       } catch (err) {
//         console.error("Failed to fetch tasks", err);
//       }
//     };

//     if (currentUser) {
//       fetchTasks();
//     }
//   }, [currentUser]);

//   const handleStatusUpdate = async (taskId, newStatus) => {
//     setUpdatingTaskId(taskId);
//     try {
//       await axios.put(`/tasks/${taskId}`, { status: newStatus });
//       setTasks(prev =>
//         prev.map(task =>
//           task._id === taskId ? { ...task, status: newStatus } : task
//         )
//       );
//     } catch (err) {
//       alert("Failed to update status");
//     } finally {
//       setUpdatingTaskId(null);
//     }
//   };

//   const getStatusOptions = (current) => {
//     const map = {
//       "To Do": ["To Do", "In Progress"],
//       "In Progress": ["In Progress", "Paused", "Done"],
//       "Paused": ["Paused", "In Progress"],
//       "Done": ["Done"]
//     };
//     return map[current] || ["To Do"];
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <h2 className="text-2xl font-bold mb-4 text-blue-700">Tasks List</h2>
//       {tasks.length === 0 ? (
//         <p>No tasks to display</p>
//       ) : (
//         <div className="bg-white p-4 rounded shadow">
//           <div className="grid grid-cols-7 font-semibold border-b pb-2 mb-2 text-sm">
//             <div>Title</div>
//             <div>Description</div>
//             <div>Assigned To</div>
//             <div>Est. Hours</div>
//             <div>Act. Hours</div>
//             <div>Status</div>
//             <div>Last Updated</div>
//           </div>
//           {tasks.map(task => (
//             <div
//               key={task._id}
//               className={`grid grid-cols-7 text-sm py-2 border-b items-center
//                 ${task.status === "Paused" ? "bg-red-50" :
//                   task.status === "Done" ? "bg-green-50" :
//                   task.status === "In Progress" ? "bg-yellow-50" : ""}
//               `}
//             >
//               <div>{task.title}</div>
//               <div>{task.description}</div>
//               <div>{task.assignedTo?.name || "-"}</div>
//               <div>{task.estimatedHours}</div>
//               <div>{task.actualHours}</div>
//               <div>
//                 {task.assignedTo?._id === currentUser?._id || task.assignedTo === currentUser?._id ? (
//                   <select
//                     className="border p-1 text-sm rounded"
//                     value={task.status}
//                     onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
//                     disabled={updatingTaskId === task._id}
//                   >
//                     {getStatusOptions(task.status).map(status => (
//                       <option key={status} value={status}>{status}</option>
//                     ))}
//                   </select>
//                 ) : (
//                   <span>{task.status}</span>
//                 )}
//               </div>
//               <div>{new Date(task.updatedAt).toLocaleString()}</div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TaskList;

import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("/auth/me");
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("/tasks");
        const roles = currentUser?.roles || [];
        const roleNames = Array.isArray(roles) ? roles.map(r => typeof r === "string" ? r : r.name) : [];

        const isAdminOrManager = roleNames.includes("Admin") || roleNames.includes("Management") || roleNames.includes("Senior Project Supervisor");

        const filteredTasks = isAdminOrManager
          ? res.data
          : res.data.filter(task => {
              const assigned = task.assignedTo;
              return assigned === currentUser?._id || assigned?._id === currentUser?._id;
            });

        setTasks(filteredTasks);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };

    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser]);

  const handleStatusUpdate = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    try {
      await axios.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev =>
        prev.map(task =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getStatusOptions = (current) => {
    const map = {
      "To Do": ["To Do", "In Progress"],
      "In Progress": ["In Progress", "Paused", "Done"],
      "Paused": ["Paused", "In Progress"],
      "Done": ["Done"]
    };
    return map[current] || ["To Do"];
  };

  return (
    // <div className="p-6 bg-gray-50 min-h-screen">
    //   <h2 className="text-2xl font-bold mb-4 text-blue-700">Tasks List</h2>
    //   {tasks.length === 0 ? (
    //     <p>No tasks to display</p>
    //   ) : (
    //     <div className="bg-white p-4 rounded shadow">
    //       <div className="grid grid-cols-7 font-semibold border-b pb-2 mb-2 text-sm">
    //         <div>Title</div>
    //         <div>Description</div>
    //         <div>Assigned To</div>
    //         <div>Est. Hours</div>
    //         <div>Act. Hours</div>
    //         <div>Status</div>
    //         <div>Last Updated</div>
    //       </div>

    //       {tasks.map(task => (
    //         <div
    //           key={task._id}
    //           className={`grid grid-cols-7 text-sm py-2 border-b items-center
    //             ${task.status === "Paused" ? "bg-red-50" :
    //               task.status === "Done" ? "bg-green-50" :
    //               task.status === "In Progress" ? "bg-yellow-50" : ""}`}
    //         >
    //           <div>
    //             <p className="text-[11px] text-gray-500 font-semibold">
    //               📁 <span className="text-blue-600">{task?.sprintId?.epic?.project?.name || "Unknown Project"}</span> →
    //               🌀 <span className="text-purple-600">{task?.sprintId?.name || "Unknown Sprint"}</span>
    //             </p>
    //             <p className="font-bold text-sm text-gray-800">{task.title}</p>
    //           </div>

    //           <div className="text-sm text-gray-700">{task.description}</div>

    //           <div className="text-sm text-gray-700">{task.assignedTo?.name || "-"}</div>

    //           <div className="text-sm text-gray-700">{task.estimatedHours ?? "-"}</div>

    //           <div className="text-sm text-gray-700">{task.actualHours ?? "-"}</div>

    //           <div>
    //             {task.assignedTo?._id === currentUser?._id || task.assignedTo === currentUser?._id ? (
    //               <select
    //                 className="border p-1 text-sm rounded"
    //                 value={task.status}
    //                 onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
    //                 disabled={updatingTaskId === task._id}
    //               >
    //                 {getStatusOptions(task.status).map((status) => (
    //                   <option key={status} value={status}>{status}</option>
    //                 ))}
    //               </select>
    //             ) : (
    //               <span className="text-sm">{task.status}</span>
    //             )}
    //           </div>

    //           <div className="text-[11px] text-gray-500">{new Date(task.updatedAt).toLocaleString()}</div>
    //         </div>
    //       ))}
    //     </div>
    //   )}
    // </div>
    <div className="bg-white p-4 rounded shadow">
    <div className="grid grid-cols-9 font-semibold border-b pb-2 mb-2 text-sm">
      <div>Project</div>
      <div>Sprint</div>
      <div>Title</div>
      <div>Description</div>
      <div>Assigned To</div>
      <div>Est. Hours</div>
      <div>Act. Hours</div>
      <div>Status</div>
      <div>Last Updated</div>
    </div>

    {tasks.map(task => (
      <div
        key={task._id}
        className={`grid grid-cols-9 text-sm py-2 border-b items-center
          ${task.status === "Paused" ? "bg-red-50" :
            task.status === "Done" ? "bg-green-50" :
            task.status === "In Progress" ? "bg-yellow-50" : ""}`}
      >
        <div className="text-xs text-blue-700 font-semibold">
          {task?.sprintId?.epic?.project?.name || "Unknown"}
        </div>

        <div className="text-xs text-purple-700 font-semibold">
          {task?.sprintId?.name || "Unknown"}
        </div>

        <div className="font-bold text-sm text-gray-800">{task.title}</div>

        <div className="text-sm text-gray-700">{task.description}</div>

        <div className="text-sm text-gray-700">{task.assignedTo?.name || "-"}</div>

        <div className="text-sm text-gray-700">{task.estimatedHours ?? "-"}</div>

        <div className="text-sm text-gray-700">{task.actualHours ?? "-"}</div>

        <div>
          {task.assignedTo?._id === currentUser?._id || task.assignedTo === currentUser?._id ? (
            <select
              className="border p-1 text-sm rounded"
              value={task.status}
              onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
              disabled={updatingTaskId === task._id}
            >
              {getStatusOptions(task.status).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          ) : (
            <span className="text-sm">{task.status}</span>
          )}
        </div>

        <div className="text-[11px] text-gray-500">{new Date(task.updatedAt).toLocaleString()}</div>
      </div>
    ))}
  </div>

  );
};

export default TaskList;
