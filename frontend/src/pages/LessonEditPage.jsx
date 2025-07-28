import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import Select from "react-select";

const LessonEditForm = ({ lesson, onClose }) => {
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

  const [formData, setFormData] = useState({
    sprintId: "",
    epicId: "",
    projectId: "",
    createdDate: "",
    loggedDate: "",
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
  const [existingFiles, setExistingFiles] = useState([]);

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

    fetchAll();
  }, []);

  useEffect(() => {
    if (lesson) {
      setFormData({
        sprintId: lesson.sprintId?._id || "",
        epicId: lesson.epicId || "",
        projectId: lesson.projectId || "",
        createdDate: lesson.createdDate?.substring(0, 10),
        loggedDate: lesson.loggedDate?.substring(0, 10),
        author: lesson.author?._id || "",
        contributors: lesson.contributors?.map(c => c._id) || [],
        phaseStageId: lesson.phaseStageId?._id || "",
        description: lesson.description,
        rootCause: lesson.rootCause,
        impactId: lesson.impactId?._id || "",
        actionsTaken: lesson.actionsTaken,
        lessonsLearnedId: lesson.lessonsLearnedId?._id || "",
        recommendationsId: lesson.recommendationsId?._id || "",
        prioritySeverityId: lesson.prioritySeverityId?._id || "",
        frequencyId: lesson.frequencyId?._id || "",
        files: [],
      });
      setExistingFiles(lesson.files || []);
    }
  }, [lesson]);

  const mapOptions = (arr) => arr.map(x => ({ label: x.name, value: x._id }));

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).filter(f => f.size <= 10 * 1024 * 1024);
    const previews = selected.map(file => ({ name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)} MB` }));
    setFormData(prev => ({ ...prev, files: [...prev.files, ...selected] }));
    setFilePreviews(prev => [...prev, ...previews]);
  };

  const handleSubmit = async () => {
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => payload.append(key, v));
      } else if (key === "files") {
        value.forEach(f => payload.append("files", f));
      } else {
        payload.append(key, value);
      }
    });

    try {
      await axios.put(`/lesson-learned/${lesson._id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Lesson updated successfully");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update lesson");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <Select label="Sprint" options={mapOptions(sprints)} onChange={(e) => handleChange("sprintId", e.value)} value={mapOptions(sprints).find(opt => opt.value === formData.sprintId)} />
      <input value={formData.loggedDate} onChange={(e) => handleChange("loggedDate", e.target.value)} type="date" className="border p-2" />
      
      <Select isMulti options={mapOptions(users)} onChange={(sel) => handleChange("contributors", sel.map(x => x.value))} value={mapOptions(users).filter(opt => formData.contributors.includes(opt.value))} />
      <Select options={mapOptions(masters.phases)} onChange={(e) => handleChange("phaseStageId", e.value)} value={mapOptions(masters.phases).find(opt => opt.value === formData.phaseStageId)} />
      <Select options={mapOptions(masters.impacts)} onChange={(e) => handleChange("impactId", e.value)} value={mapOptions(masters.impacts).find(opt => opt.value === formData.impactId)} />
      <Select options={mapOptions(masters.lessons)} onChange={(e) => handleChange("lessonsLearnedId", e.value)} value={mapOptions(masters.lessons).find(opt => opt.value === formData.lessonsLearnedId)} />
      <Select options={mapOptions(masters.recommendations)} onChange={(e) => handleChange("recommendationsId", e.value)} value={mapOptions(masters.recommendations).find(opt => opt.value === formData.recommendationsId)} />
      <Select options={mapOptions(masters.priorities)} onChange={(e) => handleChange("prioritySeverityId", e.value)} value={mapOptions(masters.priorities).find(opt => opt.value === formData.prioritySeverityId)} />
      <Select options={mapOptions(masters.frequencies)} onChange={(e) => handleChange("frequencyId", e.value)} value={mapOptions(masters.frequencies).find(opt => opt.value === formData.frequencyId)} />
      
      <textarea placeholder="Description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} className="border p-2 col-span-2" />
      <textarea placeholder="Root Cause" value={formData.rootCause} onChange={(e) => handleChange("rootCause", e.target.value)} className="border p-2 col-span-2" />
      <textarea placeholder="Actions Taken" value={formData.actionsTaken} onChange={(e) => handleChange("actionsTaken", e.target.value)} className="border p-2 col-span-2" />

      <input type="file" multiple onChange={handleFileChange} className="col-span-2" />
      <ul className="col-span-2">
        {existingFiles.map((f, i) => (
          <li key={i}>{f.originalname}</li>
        ))}
        {filePreviews.map((f, i) => (
          <li key={i}>{f.name} ({f.size})</li>
        ))}
      </ul>

      <div className="col-span-2 flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
        <button onClick={handleSubmit} className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800">Update</button>
      </div>
    </div>
  );
};

export default LessonEditForm;
