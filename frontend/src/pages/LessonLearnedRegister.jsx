// import React, { useState, useEffect } from "react";
// import axios from "../api/axiosInstance";

// const LessonLearnedForm = () => {
//   const [sprints, setSprints] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [masters, setMasters] = useState({
//     phases: [],
//     impacts: [],
//     lessons: [],
//     recommendations: [],
//     priorities: [],
//     frequencies: [],
//   });

//   const [formData, setFormData] = useState({
//     sprintId: "",
//     epic: "",
//     project: "",
//     createdDate: "",
//     loggedDate: new Date().toISOString().substring(0, 10),
//     author: "",
//     contributors: [],
//     phaseStageId: "",
//     description: "",
//     rootCause: "",
//     impact: "",
//     actionsTaken: "",
//     lessonsLearned: "",
//     recommendations: "",
//     priority: "",
//     frequency: "",
//     files: [],
//   });

//   const [errors, setErrors] = useState({});
//   const [filePreviews, setFilePreviews] = useState([]);

//   // Load sprints, users, and master data
//   useEffect(() => {
//     const fetchAll = async () => {
//       const [sRes, uRes, pRes, iRes, lRes, rRes, prRes, fRes] = await Promise.all([
//         axios.get("/sprints"),
//         axios.get("/users"),
//         axios.get("/phase-stage"),
//         axios.get("/impact"),
//         axios.get("/lessons-learned"),
//         axios.get("/recommendations"),
//         axios.get("/priority-severity"),
//         axios.get("/frequency"),
//       ]);
//       setSprints(sRes.data);
//       setUsers(uRes.data);
//       setMasters({
//         phases: pRes.data,
//         impacts: iRes.data,
//         lessons: lRes.data,
//         recommendations: rRes.data,
//         priorities: prRes.data,
//         frequencies: fRes.data,
//       });
//     };

//     const fetchCurrentUser = async () => {
//       const res = await axios.get("/auth/me");
//       setFormData(prev => ({ ...prev, author: res.data._id }));
//     };

//     fetchAll();
//     fetchCurrentUser();
//   }, []);

//     // const handleSprintChange = (e) => {
//     //     const sprintId = e.target.value;
//     //     const sprint = sprints.find(s => s._id === sprintId);
//     //     setFormData(prev => ({
//     //         ...prev,
//     //         sprintId,
//     //         epicId: sprint?.epic?._id || "",
//     //         projectId: sprint?.project?._id || "",
//     //         epic: sprint?.epic?.name || "",
//     //         project: sprint?.epic?.project?.name || "",
//     //         createdDate: sprint?.createdAt?.substring(0, 10) || "",
//     //     }));
//     //     };

//     const handleSprintChange = (e) => {
//         const sprintId = e.target.value;
//         const sprint = sprints.find((s) => s._id === sprintId);

//         setFormData((prev) => ({
//             ...prev,
//             sprintId,
//             epicId: sprint?.epic?._id || "",
//             projectId: sprint?.project?._id || "",
//             epic: sprint?.epic?.name || "",
//             project: sprint?.project?.name || "",
//             createdDate: sprint?.createdAt?.substring(0, 10) || "",
//         }));
//         };


//   const handleFileChange = (e) => {
//     const selectedFiles = Array.from(e.target.files);
//     if (selectedFiles.length + formData.files.length > 3) {
//       alert("You can only upload up to 3 files.");
//       return;
//     }
//     const validFiles = selectedFiles.filter(file => file.size <= 10 * 1024 * 1024);
//     const invalidFiles = selectedFiles.length - validFiles.length;
//     if (invalidFiles > 0) {
//       alert(`${invalidFiles} file(s) exceed 10MB and were skipped.`);
//     }
//     setFormData(prev => ({
//       ...prev,
//       files: [...prev.files, ...validFiles],
//     }));
//     const previews = validFiles.map(file => ({
//       name: file.name,
//       size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
//     }));
//     setFilePreviews(prev => [...prev, ...previews]);
//   };

//   const handleRemoveFile = (index) => {
//     const updatedFiles = [...formData.files];
//     const updatedPreviews = [...filePreviews];
//     updatedFiles.splice(index, 1);
//     updatedPreviews.splice(index, 1);
//     setFormData(prev => ({ ...prev, files: updatedFiles }));
//     setFilePreviews(updatedPreviews);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleContributorChange = (e) => {
//     const options = e.target.options;
//     const selected = [];
//     for (let i = 0; i < options.length; i++) {
//       if (options[i].selected) selected.push(options[i].value);
//     }
//     setFormData(prev => ({ ...prev, contributors: selected }));
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.sprintId) newErrors.sprintId = "Sprint is required";
//     if (!formData.phaseStageId) newErrors.phaseStageId = "Phase is required";
//     if (!formData.description) newErrors.description = "Description is required";
//     if (!formData.impact) newErrors.impact = "Impact is required";
//     if (!formData.lessonsLearned) newErrors.lessonsLearned = "Lessons Learned is required";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     const payload = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       if (key === "files") {
//         value.forEach(file => payload.append("files", file));
//       } else if (Array.isArray(value)) {
//         value.forEach(v => payload.append(key, v));
//       } else {
//         payload.append(key, value);
//       }
//     });

//     try {
//       await axios.post("/lesson-learned", payload, {
//         headers: { "Content-Type": "multipart/form-data" }
//       });
//       alert("Lesson Learned entry saved.");
//       setFormData({ ...formData, description: "", rootCause: "", actionsTaken: "", files: [] });
//       setFilePreviews([]);
//     } catch (err) {
//       alert("Submission failed");
//     }
//   };

//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       <h2 className="text-xl font-bold text-blue-700 mb-4">📘 Lesson Learned Register</h2>

//       <div className="grid grid-cols-2 gap-4 text-sm">
//         {/* Sprint Selection */}
//         <div>
//           <label className="block font-semibold">Sprint</label>
//           <select name="sprintId" value={formData.sprintId} onChange={handleSprintChange} className="border w-full p-2 rounded">
//             <option value="">Select Sprint</option>
//             {sprints.map(s => (
//               <option key={s._id} value={s._id}>{s.name}</option>
//             ))}
//           </select>
//           {errors.sprintId && <span className="text-red-500 text-xs">{errors.sprintId}</span>}
//         </div>

//         <div>
//           <label className="block font-semibold">Epic</label>
//           <input value={formData.epic} readOnly className="border w-full p-2 rounded bg-gray-100" />
//         </div>

//         <div>
//           <label className="block font-semibold">Project</label>
//           <input value={formData.project} readOnly className="border w-full p-2 rounded bg-gray-100" />
//         </div>

//         <div>
//           <label className="block font-semibold">Created Date</label>
//           <input type="date" value={formData.createdDate} readOnly className="border w-full p-2 rounded bg-gray-100" />
//         </div>

//         <div>
//           <label className="block font-semibold">Logged Date</label>
//           <input type="date" name="loggedDate" value={formData.loggedDate} onChange={handleChange} className="border w-full p-2 rounded" />
//         </div>

//         <div>
//           <label className="block font-semibold">Contributors</label>
//           <select multiple className="border w-full p-2 rounded" onChange={handleContributorChange}>
//             {users.map(u => (
//               <option key={u._id} value={u._id}>{u.name}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block font-semibold">Phase / Stage</label>
//           <select name="phaseStageId" value={formData.phaseStageId} onChange={handleChange} className="border w-full p-2 rounded">
//             <option value="">Select</option>
//             {masters.phases.map(p => (
//               <option key={p._id} value={p._id}>{p.name}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block font-semibold">Impact / Consequences</label>
//           <select name="impact" value={formData.impact} onChange={handleChange} className="border w-full p-2 rounded">
//             <option value="">Select</option>
//             {masters.impacts.map(i => (
//               <option key={i._id} value={i._id}>{i.name}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block font-semibold">Lessons Learned</label>
//           <select name="lessonsLearned" value={formData.lessonsLearned} onChange={handleChange} className="border w-full p-2 rounded">
//             <option value="">Select</option>
//             {masters.lessons.map(l => (
//               <option key={l._id} value={l._id}>{l.name}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block font-semibold">Recommendations</label>
//           <select name="recommendations" value={formData.recommendations} onChange={handleChange} className="border w-full p-2 rounded">
//             <option value="">Select</option>
//             {masters.recommendations.map(r => (
//               <option key={r._id} value={r._id}>{r.name}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block font-semibold">Priority / Severity</label>
//           <select name="priority" value={formData.priority} onChange={handleChange} className="border w-full p-2 rounded">
//             <option value="">Select</option>
//             {masters.priorities.map(p => (
//               <option key={p._id} value={p._id}>{p.name}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block font-semibold">Frequency</label>
//           <select name="frequency" value={formData.frequency} onChange={handleChange} className="border w-full p-2 rounded">
//             <option value="">Select</option>
//             {masters.frequencies.map(f => (
//               <option key={f._id} value={f._id}>{f.name}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Textareas */}
//       <div className="mt-4 grid grid-cols-1 gap-4">
//         <div>
//           <label className="block font-semibold">Description of Situation</label>
//           <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="border w-full p-2 rounded" />
//           {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
//         </div>

//         <div>
//           <label className="block font-semibold">Root Cause / Analysis</label>
//           <textarea name="rootCause" value={formData.rootCause} onChange={handleChange} rows={3} className="border w-full p-2 rounded" />
//         </div>

//         <div>
//           <label className="block font-semibold">Actions Taken</label>
//           <textarea name="actionsTaken" value={formData.actionsTaken} onChange={handleChange} rows={3} className="border w-full p-2 rounded" />
//         </div>
//       </div>

//       {/* File Upload */}
//       <div className="mt-4">
//         <label className="block font-semibold">References / Evidence (Max 3 files, 10MB each)</label>
//         <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileChange} className="mt-2" />
//         {filePreviews.length > 0 && (
//           <ul className="text-sm mt-2 space-y-1">
//             {filePreviews.map((f, i) => (
//               <li key={i} className="flex justify-between items-center">
//                 <span>{f.name} ({f.size})</span>
//                 <button onClick={() => handleRemoveFile(i)} className="text-red-500 text-xs ml-4">Remove</button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* Submit */}
//       <button onClick={handleSubmit} className="bg-blue-700 text-white px-6 py-2 mt-6 rounded hover:bg-blue-800">
//         Submit
//       </button>
//     </div>
//   );
// };

// export default LessonLearnedForm;

import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import Select from "react-select";

const LessonLearnedForm = () => {
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [masters, setMasters] = useState({
    phases: [],
    impacts: [],
    lessons: [],
    recommendations: [],
    priorities: [],
    frequencies: [],
  });

  // const [formData, setFormData] = useState({
  //   sprintId: "",
  //   epic: "",
  //   project: "",
  //   createdDate: "",
  //   loggedDate: new Date().toISOString().substring(0, 10),
  //   author: "",
  //   contributors: [],
  //   phase: "",
  //   description: "",
  //   rootCause: "",
  //   impactId: "",
  //   actionsTaken: "",
  //   lessonsLearnedId: "",
  //   recommendationsId: "",
  //   prioritySeverityId: "",
  //   frequencyId: "",
  //   files: [],
  // });

  // Updated formData state keys
    const [formData, setFormData] = useState({
      sprintId: "",
      epic: "",
      project: "",
      createdDate: "",
      loggedDate: new Date().toISOString().substring(0, 10),
      author: "",
      contributors: [],
      phaseStageId: "",
      description: "",
      rootCause: "",
      impactId: "",
      actionsTaken: "",
      lessonsLearnedId: "",
      recommendationsId: "",
      prioritySeverityId: "",
      frequencyId: "",
      files: [],
    });



  const [filePreviews, setFilePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      const [sRes, uRes, pRes, iRes, lRes, rRes, prRes, fRes] = await Promise.all([
        axios.get("/sprints"),
        axios.get("/users"),
        axios.get("/phase-stage"),
        axios.get("/impact"),
        axios.get("/lessons-learned"),
        axios.get("/recommendations"),
        axios.get("/priority-severity"),
        axios.get("/frequency"),
      ]);
      setSprints(sRes.data);
      setUsers(uRes.data);
      setMasters({
        phases: pRes.data,
        impacts: iRes.data,
        lessons: lRes.data,
        recommendations: rRes.data,
        priorities: prRes.data,
        frequencies: fRes.data,
      });
    };

    const fetchCurrentUser = async () => {
      const res = await axios.get("/auth/me");
      setFormData(prev => ({ ...prev, author: res.data._id }));
    };

    fetchAll();
    fetchCurrentUser();
  }, []);

  const handleSprintChange = (selected) => {
    const sprintId = selected?.value || "";
    const sprint = sprints.find((s) => s._id === sprintId);

    setFormData((prev) => ({
      ...prev,
      sprintId,
      epic: sprint?.epic?.name || "",
      project: sprint?.project?.name || "",
      epicId: sprint?.epic?._id || "",
      projectId: sprint?.project?._id || "",
      createdDate: sprint?.createdAt?.substring(0, 10) || "",
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => file.size <= 10 * 1024 * 1024);
    if (selectedFiles.length + formData.files.length > 3) {
      alert("You can only upload up to 3 files.");
      return;
    }
    setFormData(prev => ({ ...prev, files: [...prev.files, ...validFiles] }));
    const previews = validFiles.map(file => ({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    }));
    setFilePreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...formData.files];
    const newPreviews = [...filePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setFormData(prev => ({ ...prev, files: newFiles }));
    setFilePreviews(newPreviews);
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sprintId) newErrors.sprintId = "Sprint is required";
    if (!formData.phaseStageId ) newErrors.phaseStageId  = "Phase is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.impactId) newErrors.impactId = "Impact is required";
    if (!formData.lessonsLearnedId) newErrors.lessonsLearnedId = "Lessons Learned is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "files") {
        value.forEach(file => payload.append("files", file));
      } else if (Array.isArray(value)) {
        value.forEach(v => payload.append(key, v));
      } else {
        payload.append(key, value);
      }
    });

    try {
      await axios.post("/lesson-learned", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Lesson Learned entry saved.");
      setFormData(prev => ({
        ...prev,
        description: "",
        rootCause: "",
        actionsTaken: "",
        files: [],
        lessonsLearnedId: "",
        recommendationsId: "",
        impactId: "",
        prioritySeverityId: "",
        frequencyId: ""
      }));
      setFilePreviews([]);
    } catch (err) {
      alert("Submission failed");
    }
  };

  const mapOptions = (arr) => arr.map(x => ({ label: x.name, value: x._id }));

  return (
    <div className="p-6 max-w-5xl mx-auto text-sm">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Lesson Learned Register</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Sprint</label>
          <Select
            options={mapOptions(sprints)}
            onChange={handleSprintChange}
            placeholder="Select Sprint"
          />
          {errors.sprintId && <span className="text-red-500 text-xs">{errors.sprintId}</span>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Epic</label>
          <input readOnly value={formData.epic} className="border w-full p-2 rounded bg-gray-100" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Project</label>
          <input readOnly value={formData.project} className="border w-full p-2 rounded bg-gray-100" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Created Date</label>
          <input readOnly type="date" value={formData.createdDate} className="border w-full p-2 rounded bg-gray-100" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Logged Date</label>
          <input type="date" value={formData.loggedDate} onChange={(e) => handleChange("loggedDate", e.target.value)} className="border w-full p-2 rounded" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Contributors</label>
          <Select
            isMulti
            options={mapOptions(users)}
            onChange={(selected) => handleChange("contributors", selected.map(x => x.value))}
            placeholder="Select Contributors"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Phase / Stage</label>
          {/* <Select options={mapOptions(masters.phases)} onChange={(e) => handleChange("phase", e.value)} placeholder="Select Phase" /> */}
          <Select options={mapOptions(masters.phases)} onChange={(e) => handleChange("phaseStageId", e.value)} placeholder="Select Phase" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Impact / Consequences</label>
          {/* <Select options={mapOptions(masters.impacts)} onChange={(e) => handleChange("impact", e.value)} placeholder="Select Impact" /> */}
          <Select options={mapOptions(masters.impacts)} onChange={(e) => handleChange("impactId", e.value)} placeholder="Select Impact" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Lessons Learned</label>
          {/* <Select options={mapOptions(masters.lessons)} onChange={(e) => handleChange("lessonsLearned", e.value)} placeholder="Select Lessons" /> */}
          <Select options={mapOptions(masters.lessons)} onChange={(e) => handleChange("lessonsLearnedId", e.value)} placeholder="Select Lessons" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Recommendations</label>
          {/* <Select options={mapOptions(masters.recommendations)} onChange={(e) => handleChange("recommendations", e.value)} placeholder="Select Recommendations" /> */}
          <Select options={mapOptions(masters.recommendations)} onChange={(e) => handleChange("recommendationsId", e.value)} placeholder="Select Recommendations" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Priority / Severity</label>
          {/* <Select options={mapOptions(masters.priorities)} onChange={(e) => handleChange("priority", e.value)} placeholder="Select Priority" /> */}
          <Select options={mapOptions(masters.priorities)} onChange={(e) => handleChange("prioritySeverityId", e.value)} placeholder="Select Priority" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Frequency</label>
          {/* <Select options={mapOptions(masters.frequencies)} onChange={(e) => handleChange("frequency", e.value)} placeholder="Select Frequency" /> */}
          <Select options={mapOptions(masters.frequencies)} onChange={(e) => handleChange("frequencyId", e.value)} placeholder="Select Frequency" />
        </div>
      </div>

      {/* Textareas */}
      <div className="mt-4 grid grid-cols-1 gap-4">
        <textarea className="border w-full p-2 rounded" rows="3" placeholder="Description" name="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
        <textarea className="border w-full p-2 rounded" rows="3" placeholder="Root Cause / Analysis" name="rootCause" value={formData.rootCause} onChange={(e) => handleChange("rootCause", e.target.value)} />
        <textarea className="border w-full p-2 rounded" rows="3" placeholder="Actions Taken" name="actionsTaken" value={formData.actionsTaken} onChange={(e) => handleChange("actionsTaken", e.target.value)} />
      </div>

      {/* File Upload */}
      <div className="mt-4">
        <label className="block font-semibold">References / Evidence (Max 3 files, 10MB each)</label>
        <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileChange} className="mt-2" />
        {filePreviews.length > 0 && (
          <ul className="text-sm mt-2">
            {filePreviews.map((f, i) => (
              <li key={i} className="flex justify-between">
                <span>{f.name} ({f.size})</span>
                <button onClick={() => handleRemoveFile(i)} className="text-red-500 text-xs ml-4">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={handleSubmit} className="bg-blue-700 text-white px-6 py-2 mt-6 rounded hover:bg-blue-800">
        Submit
      </button>
    </div>
  );
};

export default LessonLearnedForm;
