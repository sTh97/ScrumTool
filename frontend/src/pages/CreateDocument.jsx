import React, { useState, useEffect, useRef } from "react";
import axios from "../api/axiosInstance";
import DocumentEditor from "../components/DocumentEditor";
import { useNavigate } from "react-router-dom";

const CreateDocument = () => {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(localStorage.getItem("draftProjectId") || "");
  const [documentType, setDocumentType] = useState(localStorage.getItem("draftDocumentType") || "");
  const [title, setTitle] = useState(localStorage.getItem("draftTitle") || "");
  const [content, setContent] = useState(localStorage.getItem("draftContent") || "");
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    return parseFloat(localStorage.getItem("leftPanelWidth")) || 30;
  });

  const resizing = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/projects");
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects", err);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem("draftProjectId", projectId);
      localStorage.setItem("draftDocumentType", documentType);
      localStorage.setItem("draftTitle", title);
      localStorage.setItem("draftContent", content);
    }, 5000);
    return () => clearInterval(interval);
  }, [projectId, documentType, title, content]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const totalFiles = selected.length + attachments.length;
    const isValid = selected.every((file) => file.size <= 20 * 1024 * 1024);

    if (totalFiles > 5) {
      setError("You can upload a maximum of 5 files.");
      return;
    }

    if (!isValid) {
      setError("Each file must be ≤ 20MB.");
      return;
    }

    setAttachments((prev) => [...prev, ...selected]);
    setError("");
  };

  const handleRemoveFile = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId || !documentType || !title || !content) {
      setError("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("documentType", documentType);
    formData.append("title", title);
    formData.append("content", content);
    attachments.forEach((file) => formData.append("attachments", file));

    try {
      await axios.post("/docs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      localStorage.removeItem("draftProjectId");
      localStorage.removeItem("draftDocumentType");
      localStorage.removeItem("draftTitle");
      localStorage.removeItem("draftContent");

      alert("Document created successfully!");
      navigate("/documents");
    } catch (err) {
      console.error(err);
      setError("Failed to create document.");
    }
  };

  const startResize = () => {
    resizing.current = true;
  };

  const stopResize = () => {
    resizing.current = false;
    localStorage.setItem("leftPanelWidth", leftPanelWidth.toFixed(2));
  };

  const resize = (e) => {
    if (!resizing.current) return;
    const newLeftWidth = (e.clientX / window.innerWidth) * 100;
    if (newLeftWidth > 15 && newLeftWidth < 85) {
      setLeftPanelWidth(newLeftWidth);
    }
  };

  return (
    <div
      className="h-screen w-full flex bg-white text-black"
      onMouseMove={resize}
      onMouseUp={stopResize}
    >
      {/* Left Panel */}
      <div
        style={{ width: `${leftPanelWidth}%` }}
        className="p-4 overflow-auto border-r bg-gray-50"
      >
        <h2 className="text-xl font-semibold mb-4">Create Document</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Select Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Select --</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Select --</option>
              {["AS-IS", "BRD", "FSD", "HLD", "LLD", "API", "MOM", "RELEASE NOTE", "OTHER"].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold">Attachments (max 5, ≤ 20MB each)</label>
            <input type="file" multiple onChange={handleFileChange} />
            <ul className="mt-2 text-sm">
              {attachments.map((file, i) => (
                <li key={i} className="flex justify-between">
                  <span>{file.name}</span>
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

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Document
          </button>
        </form>
      </div>

      {/* Resizer Divider */}
      <div
        className="w-1 bg-gray-300 cursor-col-resize"
        onMouseDown={startResize}
      />

      {/* Right Editor Panel */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <DocumentEditor
            onChange={setContent}
            initialContent={content}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateDocument;
