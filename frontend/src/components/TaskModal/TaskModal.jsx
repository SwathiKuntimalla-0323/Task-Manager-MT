import React from "react";

function TaskModal({ task, onClose }) {
    console.log("Task in model",task);
    if(!task) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
        <p className="mb-4">
          <span className="font-semibold">Description:</span> {task.description}
        </p>
        <p className="mb-4">
          <span className="font-semibold">Deadline:</span>{" "}
          {new Date(task.deadline).toLocaleString()}
        </p>
        <p className="mb-4">
          <span className="font-semibold">Priority:</span> {task.priority}
        </p>
        <p>
          <span className="font-semibold">Status:</span>{" "}
          {task.status === "Pending" ? (
            <span className="text-red-500">Pending</span>
          ) : (
            <span className="text-green-500">Completed</span>
          )}
        </p>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
