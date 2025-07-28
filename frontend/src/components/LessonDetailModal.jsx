import React from "react";
import FileViewer from "./FileViewer";

const LessonDetailModal = ({ lesson, isEdit, onClose, onSave }) => {
  if (!lesson) return null;

  const renderField = (label, value) => (
    <div className="mb-2">
      <strong>{label}: </strong>
      <span>{value || "-"}</span>
    </div>
  );

  return (
    <div className="p-4 space-y-2">
      {renderField("Project", lesson.projectId?.name)}
      {renderField("Epic", lesson.epicId?.name)}
      {renderField("Sprint", lesson.sprintId?.name)}
      {renderField("Created Date", new Date(lesson.createdDate).toLocaleDateString())}
      {renderField("Logged Date", new Date(lesson.loggedDate).toLocaleDateString())}
      {renderField("Author", lesson.author?.name)}
      {renderField("Contributors", lesson.contributors?.map(c => c.name).join(", "))}
      {renderField("Phase", lesson.phaseStageId?.name)}
      {renderField("Description", lesson.description)}
      {renderField("Root Cause", lesson.rootCause)}
      {renderField("Impact", lesson.impactId?.name)}
      {renderField("Actions Taken", lesson.actionsTaken)}
      {renderField("Lesson Learned", lesson.lessonsLearnedId?.name)}
      {renderField("Recommendations", lesson.recommendationsId?.name)}
      {renderField("Priority", lesson.prioritySeverityId?.name)}
      {renderField("Frequency", lesson.frequencyId?.name)}

      <div className="mt-4">
        <FileViewer lesson={lesson} isEdit={isEdit} />
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default LessonDetailModal;
