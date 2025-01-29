import React from "react";

function TaskDetailsModal({ task, onClose }) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
        <p className="mb-4 text-gray-700">{task.description}</p>
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default TaskDetailsModal;
