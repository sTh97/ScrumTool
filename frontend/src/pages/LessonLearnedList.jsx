import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import Modal from "../components/Modal";
import LessonDetailModal from "../components/LessonDetailModal";

const LessonLearnedList = () => {
  const [lessons, setLessons] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const limit = 20;

  const navigate = useNavigate();

  const fetchLessons = async () => {
    try {
      const res = await axios.get(`/lesson-learned?page=${page}&limit=${limit}&search=${search}`);
      setLessons(res.data.lessons || []);
      setTotalPages(Number(res.data.totalPages) || 1);
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
    setPage(1);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`px-3 py-1 rounded border ${i === page ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex gap-2 items-center mt-4 justify-end">
        <button
          className="px-3 py-1 rounded border"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          «
        </button>

        {pages}

        <button
          className="px-3 py-1 rounded border"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        >
          »
        </button>
      </div>
    );
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
        <button className="bg-green-500 text-white px-4 py-1 rounded text-sm">Export to Excel</button>
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
              <td className="p-2 border text-center">{(page - 1) * limit + index + 1}</td>
              <td className="p-2 border">{new Date(lesson.loggedDate).toLocaleDateString()}</td>
              <td className="p-2 border">{lesson.sprintId?.name || "N/A"}</td>
              <td className="p-2 border">{lesson.description?.substring(0, 40)}...</td>
              <td className="p-2 border">{lesson.author?.name || "N/A"}</td>
              <td className="p-2 border text-center space-x-2">
                <button
                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setEditMode(false);
                  }}
                >
                  View
                </button>
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
              <td colSpan="6" className="text-center p-4 text-gray-400">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🎯 Pagination */}
      {totalPages > 1 && renderPagination()}

      {/* Modal for View/Edit */}
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


