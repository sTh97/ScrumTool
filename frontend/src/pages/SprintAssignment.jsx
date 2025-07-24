// // File: src/pages/SprintAssignment.jsx

// import React, { useState, useEffect } from "react";
// import axios from "../api/axiosInstance";

// const SprintAssignment = () => {
//   const [sprints, setSprints] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [stories, setStories] = useState([]);
//   const [selectedSprint, setSelectedSprint] = useState("");
//   const [step, setStep] = useState(1);
//   const [selectedTeam, setSelectedTeam] = useState([]);
//   const [assignedStories, setAssignedStories] = useState([]);
//   const [tshirtSizes, setTshirtSizes] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const [sprintRes, userRes, storyRes, sizeRes] = await Promise.all([
//         axios.get("/sprints"),
//         axios.get("/users"),
//         axios.get("/userstories"),
//         axios.get("/estimations")
//       ]);
//       setSprints(sprintRes.data);
//       setUsers(userRes.data);
//       setStories(storyRes.data);
//       setTshirtSizes(sizeRes.data);
//     };
//     fetchData();
//   }, []);

//   const handleTeamSubmit = async () => {
//     await axios.put(`/sprints/${selectedSprint}/team`, { teamMembers: selectedTeam });
//     setStep(2);
//   };

//   const handleStoryToggle = (storyId) => {
//     if (assignedStories.some(s => s.storyId === storyId)) {
//       setAssignedStories(prev => prev.filter(s => s.storyId !== storyId));
//     } else {
//       setAssignedStories(prev => [...prev, { storyId, tshirtSize: "", estimatedHours: 0 }]);
//     }
//   };

//   const handleStoryChange = (storyId, field, value) => {
//     setAssignedStories(prev =>
//       prev.map(s =>
//         s.storyId === storyId ? { ...s, [field]: field === "estimatedHours" ? parseInt(value) : value } : s
//       )
//     );
//   };

//   const handleStorySubmit = async () => {
//     await axios.put(`/sprints/${selectedSprint}/stories`, { stories: assignedStories });
//     alert("Sprint assignment complete!");
//     setSelectedSprint("");
//     setSelectedTeam([]);
//     setAssignedStories([]);
//     setStep(1);
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Sprint Assignment</h2>

//       {/* Sprint Selector */}
//       <select
//         value={selectedSprint}
//         onChange={(e) => setSelectedSprint(e.target.value)}
//         className="border p-2 rounded mb-4"
//       >
//         <option value="">Select Sprint</option>
//         {sprints.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
//       </select>

//       {/* Stepper UI */}
//       {step === 1 && (
//         <div>
//           <h3 className="text-xl font-semibold mb-2">Step 1: Assign Team Members</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
//             {users.map(user => (
//               <label key={user._id} className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   checked={selectedTeam.includes(user._id)}
//                   onChange={() => setSelectedTeam(prev =>
//                     prev.includes(user._id)
//                       ? prev.filter(id => id !== user._id)
//                       : [...prev, user._id]
//                   )}
//                 />
//                 <span>{user.name}</span>
//               </label>
//             ))}
//           </div>
//           <button onClick={handleTeamSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
//             Next: Assign Stories
//           </button>
//         </div>
//       )}

//       {step === 2 && (
//         <div>
//           <h3 className="text-xl font-semibold mb-2">Step 2: Assign User Stories</h3>
//           {stories.map(story => (
//             <div key={story._id} className="border p-3 rounded mb-3">
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   checked={assignedStories.some(s => s.storyId === story._id)}
//                   onChange={() => handleStoryToggle(story._id)}
//                 />
//                 <span className="font-medium">{story.title}</span>
//               </label>
//               {assignedStories.some(s => s.storyId === story._id) && (
//                 <div className="mt-2 grid grid-cols-2 gap-2">
//                   <select
//                     value={assignedStories.find(s => s.storyId === story._id)?.tshirtSize || ""}
//                     onChange={(e) => handleStoryChange(story._id, "tshirtSize", e.target.value)}
//                     className="border p-2 rounded"
//                   >
//                     <option value="">Select T-Shirt Size</option>
//                     {tshirtSizes.map(size => (
//                       <option key={size._id} value={size.label}>{size.label}</option>
//                     ))}
//                   </select>
//                   <input
//                     type="number"
//                     min="1"
//                     value={assignedStories.find(s => s.storyId === story._id)?.estimatedHours || 0}
//                     onChange={(e) => handleStoryChange(story._id, "estimatedHours", e.target.value)}
//                     placeholder="Estimated Hours"
//                     className="border p-2 rounded"
//                   />
//                 </div>
//               )}
//             </div>
//           ))}
//           <button onClick={handleStorySubmit} className="bg-green-600 text-white px-4 py-2 rounded">
//             Complete Assignment
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SprintAssignment;


import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

const SprintAssignment = () => {
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [tshirtSizes, setTshirtSizes] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState("");
  const [step, setStep] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [assignedStories, setAssignedStories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [sprintRes, userRes, storyRes, sizeRes] = await Promise.all([
        axios.get("/sprints"),
        axios.get("/users"),
        axios.get("/userstories"),
        axios.get("/estimations")
      ]);
      setSprints(sprintRes.data);
      setUsers(userRes.data);
      setStories(storyRes.data);
      setTshirtSizes(sizeRes.data);
    };
    fetchData();
  }, []);

  const estimationMap = tshirtSizes.reduce((acc, item) => {
    acc[item.label] = item.hours;
    return acc;
  }, {});

  const handleTeamSubmit = async () => {
    await axios.put(`/sprints/${selectedSprint}/team`, { teamMembers: selectedTeam });
    setStep(2);
  };

  const handleStoryToggle = (storyId) => {
    if (assignedStories.some(s => s.storyId === storyId)) {
      setAssignedStories(prev => prev.filter(s => s.storyId !== storyId));
    } else {
      setAssignedStories(prev => [...prev, { storyId, tshirtSize: "", estimatedHours: 0 }]);
    }
  };

  const handleStoryChange = (storyId, field, value) => {
    setAssignedStories(prev =>
      prev.map(s => {
        if (s.storyId === storyId) {
          const updated = { ...s, [field]: value };
          if (field === "tshirtSize" && estimationMap[value]) {
            updated.estimatedHours = estimationMap[value];
          }
          return updated;
        }
        return s;
      })
    );
  };

  const handleStorySubmit = async () => {
    await axios.put(`/sprints/${selectedSprint}/stories`, { stories: assignedStories });
    alert("Sprint assignment complete!");
    setSelectedSprint("");
    setSelectedTeam([]);
    setAssignedStories([]);
    setStep(1);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sprint Assignment</h2>

      <select
        value={selectedSprint}
        onChange={(e) => setSelectedSprint(e.target.value)}
        className="border p-2 rounded mb-4"
      >
        <option value="">Select Sprint</option>
        {sprints.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
      </select>

      {step === 1 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Step 1: Assign Team Members</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {users.map(user => (
              <label key={user._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedTeam.includes(user._id)}
                  onChange={() =>
                    setSelectedTeam(prev =>
                      prev.includes(user._id)
                        ? prev.filter(id => id !== user._id)
                        : [...prev, user._id]
                    )
                  }
                />
                <span>{user.name}</span>
              </label>
            ))}
          </div>
          <button onClick={handleTeamSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
            Next: Assign Stories
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Step 2: Assign User Stories</h3>
          {stories.map(story => (
            <div key={story._id} className="border p-3 rounded mb-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assignedStories.some(s => s.storyId === story._id)}
                  onChange={() => handleStoryToggle(story._id)}
                />
                <span className="font-medium">{story.title}</span>
              </label>

              {assignedStories.some(s => s.storyId === story._id) && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select
                    value={assignedStories.find(s => s.storyId === story._id)?.tshirtSize || ""}
                    onChange={(e) => handleStoryChange(story._id, "tshirtSize", e.target.value)}
                    className="border p-2 rounded"
                  >
                    <option value="">Select T-Shirt Size</option>
                    {tshirtSizes.map(size => (
                      <option key={size._id} value={size.label}>{size.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={assignedStories.find(s => s.storyId === story._id)?.estimatedHours || 0}
                    onChange={(e) => handleStoryChange(story._id, "estimatedHours", parseInt(e.target.value))}
                    placeholder="Estimated Hours"
                    className="border p-2 rounded"
                  />
                </div>
              )}
            </div>
          ))}
          <button onClick={handleStorySubmit} className="bg-green-600 text-white px-4 py-2 rounded">
            Complete Assignment
          </button>
        </div>
      )}
    </div>
  );
};

export default SprintAssignment;
