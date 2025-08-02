// import React, { useState, useEffect, useRef } from "react";
// import axios from "../api/axiosInstance";
// import { useParams, useNavigate } from "react-router-dom";
// import DocumentEditor from "../components/DocumentEditor";

// const DocumentEdit = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [document, setDocument] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [attachments, setAttachments] = useState([]);
//   const [removedAttachments, setRemovedAttachments] = useState([]);
//   const [content, setContent] = useState("");
//   const [error, setError] = useState("");
//   const [leftPanelWidth, setLeftPanelWidth] = useState(() => parseFloat(localStorage.getItem("leftPanelWidth")) || 30);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const resizing = useRef(false);

//   const fetchDocument = async () => {
//     try {
//       const res = await axios.get(`/docs/${id}`);
//       setDocument(res.data);
//       setContent(res.data.content || "");
//       setAttachments(res.data.attachments || []);
//       setLoading(false);
//     } catch (err) {
//       console.error("Error loading document", err);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDocument();
//     axios.get("/projects")
//       .then((res) => setProjects(res.data))
//       .catch((err) => console.error("Error loading projects", err));
//   }, [id]);

//   const handleFileChange = (e) => {
//     const selected = Array.from(e.target.files);
//     const totalFiles = selected.length + attachments.length - removedAttachments.length;

//     if (totalFiles > 5) {
//       setError("You can upload a maximum of 5 files.");
//       return;
//     }

//     const isValid = selected.every((file) => file.size <= 20 * 1024 * 1024);
//     if (!isValid) {
//       setError("Each file must be ≤ 20MB.");
//       return;
//     }

//     setAttachments((prev) => [...prev, ...selected]);
//     setError("");
//   };

//   const handleRemoveFile = (index) => {
//     const file = attachments[index];
//     if (!(file instanceof File)) {
//       setRemovedAttachments((prev) => [...prev, file._id]);
//     }
//     setAttachments((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!document.project?._id || !document.title || !document.documentType || !content) {
//       setError("All fields are required.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("projectId", document.project._id);
//     formData.append("documentType", document.documentType);
//     formData.append("title", document.title);
//     formData.append("content", content);

//     attachments.forEach((file) => {
//       if (file instanceof File) formData.append("attachments", file);
//     });

//     removedAttachments.forEach((id) => {
//       formData.append("removedAttachments", id);
//     });

//     try {
//       setSaving(true);
//       await axios.put(`/docs/${id}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       alert("Document updated and versioned.");
//       navigate(`/DocumentDetails/${id}`);
//     } catch (err) {
//       console.error("Update error", err);
//       setError("Update failed.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSetBaseline = async (versionId) => {
//     try {
//       await axios.put(`/docs/version/${versionId}/baseline`);
//       await fetchDocument();
//       alert("Baseline version set successfully.");
//     } catch (err) {
//       console.error("Failed to set baseline", err);
//     }
//   };

//   const handleRestore = async (versionId) => {
//     try {
//       await axios.post(`/docs/${id}/restore/${versionId}`);
//       alert("Version restored successfully.");
//       navigate(0);
//     } catch (err) {
//       console.error("Restore failed", err);
//     }
//   };

//   const startResize = () => (resizing.current = true);
//   const stopResize = () => {
//     resizing.current = false;
//     localStorage.setItem("leftPanelWidth", leftPanelWidth.toFixed(2));
//   };
//   const resize = (e) => {
//     if (!resizing.current) return;
//     const newWidth = (e.clientX / window.innerWidth) * 100;
//     if (newWidth > 15 && newWidth < 85) setLeftPanelWidth(newWidth);
//   };

//   if (loading) return <div className="p-10 text-center">Loading...</div>;

//   return (
//     <div className="h-screen w-full flex bg-white text-black" onMouseMove={resize} onMouseUp={stopResize}>
//       {/* Left Panel */}
//       <div style={{ width: `${leftPanelWidth}%` }} className="p-4 overflow-auto border-r bg-gray-50">
//         <h2 className="text-xl font-semibold mb-4">Edit Document</h2>
//         {error && <p className="text-red-600 mb-2">{error}</p>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block font-semibold">Project</label>
//             <select value={document.project?._id || ""} disabled className="w-full border px-3 py-2 rounded">
//               {projects.map((p) => (
//                 <option key={p._id} value={p._id}>{p.name}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block font-semibold">Document Type</label>
//             <select
//               value={document.documentType}
//               onChange={(e) => setDocument({ ...document, documentType: e.target.value })}
//               className="w-full border px-3 py-2 rounded"
//             >
//               {["AS-IS", "BRD", "FSD", "HLD", "LLD", "API", "MOM", "OTHER"].map((type) => (
//                 <option key={type}>{type}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block font-semibold">Title</label>
//             <input
//               type="text"
//               value={document.title}
//               onChange={(e) => setDocument({ ...document, title: e.target.value })}
//               className="w-full border px-3 py-2 rounded"
//             />
//           </div>

//           <div>
//             <label className="block font-semibold">Attachments (max 5, ≤ 20MB each)</label>
//             <input type="file" multiple onChange={handleFileChange} />
//             <ul className="mt-2 text-sm">
//               {attachments.map((file, i) => (
//                 <li key={i} className="flex justify-between items-center">
//                   <span>{file.name || file.originalName}</span>
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveFile(i)}
//                     className="text-red-600 ml-3"
//                   >
//                     Remove
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={saving}>
//             {saving ? "Saving..." : "Update Document"}
//           </button>
//         </form>

//         {/* Version History */}
//         <div className="mt-8">
//           <h3 className="text-lg font-semibold mb-2">Version History</h3>
//           <table className="w-full text-sm border">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border px-2 py-1">Version</th>
//                 <th className="border px-2 py-1">Updated By</th>
//                 <th className="border px-2 py-1">At</th>
//                 <th className="border px-2 py-1">Baseline</th>
//                 <th className="border px-2 py-1">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {document.versions?.map((v) => (
//                 <tr key={v._id}>
//                   <td className="border px-2 py-1 text-center">{v.versionNumber}</td>
//                   <td className="border px-2 py-1">{v.updatedBy?.name || "-"}</td>
//                   <td className="border px-2 py-1">{new Date(v.updatedAt).toLocaleString()}</td>
//                   <td className="border px-2 py-1 text-center">{v.isBaselined ? "✅" : "❌"}</td>
//                   <td className="border px-2 py-1 text-center space-x-2">
//                     <button
//                       onClick={() => handleSetBaseline(v._id)}
//                       className="text-blue-600 hover:underline text-xs"
//                       disabled={v.isBaselined}
//                     >
//                       Set Baseline
//                     </button>
//                     <button
//                       onClick={() => handleRestore(v._id)}
//                       className="text-green-600 hover:underline text-xs"
//                     >
//                       Restore
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Divider */}
//       <div className="w-1 bg-gray-300 cursor-col-resize" onMouseDown={startResize} />

//       {/* Right Panel */}
//       <div className="flex-1 overflow-hidden">
//         <DocumentEditor onChange={setContent} initialContent={content} />
//       </div>
//     </div>
//   );
// };

// export default DocumentEdit;


import React, { useState, useEffect, useRef } from "react";
import axios from "../api/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";
import DocumentEditor from "../components/DocumentEditor";

const DocumentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [projects, setProjects] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [removedAttachments, setRemovedAttachments] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => parseFloat(localStorage.getItem("leftPanelWidth")) || 30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const resizing = useRef(false);

  const fetchDocument = async () => {
    try {
      const res = await axios.get(`/docs/${id}`);
      setDocument(res.data);
      setContent(res.data.content || "");
      setAttachments(res.data.attachments || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading document", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
    axios.get("/projects")
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Error loading projects", err));
  }, [id]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const totalFiles = selected.length + attachments.filter(a => !(a instanceof File)).length;

    if (totalFiles > 5) {
      setError("You can upload a maximum of 5 files.");
      return;
    }

    const isValid = selected.every((file) => file.size <= 20 * 1024 * 1024);
    if (!isValid) {
      setError("Each file must be ≤ 20MB.");
      return;
    }

    setAttachments(prev => [...prev, ...selected]);
    setError("");
  };

  const handleRemoveFile = (index) => {
    const file = attachments[index];
    if (!(file instanceof File)) {
      setRemovedAttachments(prev => [...prev, file._id]);
    }
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!document.project?._id || !document.title || !document.documentType || !content) {
      setError("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("projectId", document.project._id);
    formData.append("documentType", document.documentType);
    formData.append("title", document.title);
    formData.append("content", content);

    attachments.forEach(file => {
      if (file instanceof File) {
        formData.append("attachments", file);
      } else if (!removedAttachments.includes(file._id)) {
        formData.append("existingAttachments", JSON.stringify(file));
      }
    });

    removedAttachments.forEach(id => {
      formData.append("removedAttachments", id);
    });

    try {
      setSaving(true);
      await axios.put(`/docs/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Document updated and versioned.");
      navigate(`/DocumentDetails/${id}`);
    } catch (err) {
      console.error("Update error", err);
      setError("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetBaseline = async (versionId) => {
    try {
      await axios.put(`/docs/version/${versionId}/baseline`);
      await fetchDocument();
      alert("Baseline version set successfully.");
    } catch (err) {
      console.error("Failed to set baseline", err);
    }
  };

  const handleRestore = async (versionId) => {
    try {
      await axios.post(`/docs/${id}/restore/${versionId}`);
      alert("Version restored successfully.");
      navigate(0);
    } catch (err) {
      console.error("Restore failed", err);
    }
  };

  const startResize = () => (resizing.current = true);
  const stopResize = () => {
    resizing.current = false;
    localStorage.setItem("leftPanelWidth", leftPanelWidth.toFixed(2));
  };
  const resize = (e) => {
    if (!resizing.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 15 && newWidth < 85) setLeftPanelWidth(newWidth);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="h-screen w-full flex bg-white text-black" onMouseMove={resize} onMouseUp={stopResize}>
      {/* Left Panel */}
      <div style={{ width: `${leftPanelWidth}%` }} className="p-4 overflow-auto border-r bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Edit Document</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Project</label>
            <select value={document.project?._id || ""} disabled className="w-full border px-3 py-2 rounded">
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold">Document Type</label>
            <select
              value={document.documentType}
              onChange={(e) => setDocument({ ...document, documentType: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            >
              {["AS-IS", "BRD", "FSD", "HLD", "LLD", "API", "MOM", "OTHER"].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold">Title</label>
            <input
              type="text"
              value={document.title}
              onChange={(e) => setDocument({ ...document, title: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold">Attachments (max 5, ≤ 20MB each)</label>
            <input type="file" multiple onChange={handleFileChange} />
            <ul className="mt-2 text-sm">
              {attachments.map((file, i) => (
                <li key={i} className="flex justify-between items-center">
                  <span>{file.name || file.originalName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="text-red-600 ml-3"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={saving}>
            {saving ? "Saving..." : "Update Document"}
          </button>
        </form>

        {/* Version History */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Version History</h3>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Version</th>
                <th className="border px-2 py-1">Updated By</th>
                <th className="border px-2 py-1">At</th>
                <th className="border px-2 py-1">Baseline</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {document.versions?.map((v) => (
                <tr key={v._id}>
                  <td className="border px-2 py-1 text-center">{v.versionNumber}</td>
                  <td className="border px-2 py-1">{v.updatedBy?.name || "-"}</td>
                  <td className="border px-2 py-1">{new Date(v.updatedAt).toLocaleString()}</td>
                  <td className="border px-2 py-1 text-center">{v.isBaselined ? "✅" : "❌"}</td>
                  <td className="border px-2 py-1 text-center space-x-2">
                    <button
                      onClick={() => handleSetBaseline(v._id)}
                      className="text-blue-600 hover:underline text-xs"
                      disabled={v.isBaselined}
                    >
                      Set Baseline
                    </button>
                    <button
                      onClick={() => handleRestore(v._id)}
                      className="text-green-600 hover:underline text-xs"
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Divider */}
      <div className="w-1 bg-gray-300 cursor-col-resize" onMouseDown={startResize} />

      {/* Right Panel */}
      <div className="flex-1 overflow-hidden">
        <DocumentEditor onChange={setContent} initialContent={content} />
      </div>
    </div>
  );
};

export default DocumentEdit;
