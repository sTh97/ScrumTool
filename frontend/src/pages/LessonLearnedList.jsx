import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import Modal from "../components/Modal"; // Create this modal component or use your existing modal
import LessonDetailModal from "../components/LessonDetailModal"; // Component to preview/download/delete files

const LessonLearnedList = () => {
  const [lessons, setLessons] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [editMode, setEditMode] = useState(false);

const navigate = useNavigate();

  const fetchLessons = async () => {
    try {
      const res = await axios.get(`/lesson-learned?page=${page}&search=${search}`);
      setLessons(res.data.lessons);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch lessons", err);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(`/lesson-learned/${id}`);
      fetchLessons();
    } catch (err) {
      alert("Failed to delete entry");
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // reset to first page on new search
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Lesson Learned Register</h2>
      
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by Description..."
          className="border px-3 py-1 rounded w-64 text-sm"
          value={search}
          onChange={handleSearchChange}
        />
        <button>Export to Excel</button>
      </div>

      <table className="w-full text-sm border shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Logged Date</th>
            <th className="p-2 border">Sprint</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Author</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson, index) => (
            <tr key={lesson._id}>
              <td className="p-2 border text-center">{(page - 1) * 5 + index + 1}</td>
              <td className="p-2 border">{new Date(lesson.loggedDate).toLocaleDateString()}</td>
              <td className="p-2 border">{lesson.sprintId?.name || "N/A"}</td>
              <td className="p-2 border">{lesson.description?.substring(0, 40)}...</td>
              <td className="p-2 border">{lesson.author?.name || "N/A"}</td>
              <td className="p-2 border text-center space-x-2">
                <button
                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => { setSelectedLesson(lesson); setEditMode(false); }}
                >
                  View
                </button>
                {/* <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                  onClick={() => { setSelectedLesson(lesson); setEditMode(true); }}
                >
                  Edit
                </button> */}
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                  onClick={() => navigate(`/LessonEditPage/edit/${lesson._id}`)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => handleDelete(lesson._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {lessons.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-400">No records found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-end mt-3 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="bg-gray-200 px-3 py-1 rounded"
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="text-sm pt-1">Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          className="bg-gray-200 px-3 py-1 rounded"
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {/* Modal for View / Edit */}
      {selectedLesson && (
        <Modal
          isOpen={!!selectedLesson}
          onClose={() => setSelectedLesson(null)}
          title={editMode ? "Edit Lesson" : "Lesson Details"}
        >
          <LessonDetailModal
            lesson={selectedLesson}
            isEdit={editMode}
            onClose={() => {
              setSelectedLesson(null);
              fetchLessons();
            }}
          />
        </Modal>

      )}
    </div>
  );
};

export default LessonLearnedList;
