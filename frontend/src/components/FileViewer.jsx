import React from "react";
import { FaFilePdf, FaDownload, FaTrash } from "react-icons/fa";

const FileViewer = ({ lesson = {}, isEdit, onDelete }) => {
  const files = lesson.files || [];

  if (!files.length) {
    return <p className="text-sm text-gray-500">No files uploaded</p>;
  }

  return (
    <ul className="space-y-2 text-sm max-h-48 overflow-y-auto border p-2 rounded">
      {files.map((file, index) => (
        <li key={file._id || index} className="flex items-center justify-between border-b pb-1">
          <div className="flex items-center gap-2">
            <FaFilePdf className="text-red-600" />
            <span>{file.originalname}</span>
          </div>
          <div className="flex gap-2">
            <a
              href={`http://localhost:5000/uploads/lesson-files/${file.filename}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              title="Download"
            >
              <FaDownload />
            </a>
            {isEdit && (
              <button
                onClick={() => onDelete?.(file._id)}
                className="text-red-600 hover:text-red-800"
                title="Delete"
              >
                <FaTrash />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default FileViewer;
