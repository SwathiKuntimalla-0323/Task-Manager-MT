import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";

const TaskCard = ({ task, role, editTask, deleteTask, updateTaskStatus }) => {
  return (
    <div className="relative bg-white shadow-lg rounded-lg p-6 text-gray-800 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
      {role === "admin" && (
        <button
          onClick={() => editTask(task)}
          className="absolute top-3 right-3 text-blue-500 hover:text-blue-600"
        >
          Edit
        </button>
      )}
      <div>
        <h3 className="text-xl font-bold mb-2">{task.title}</h3>
        <p className="mb-2">Description: {task.description}</p>
        <p className="text-gray-600 mb-1">
          <span className="font-semibold">Deadline:</span>{" "}
          {new Date(task.deadline).toLocaleString()}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-semibold">Priority:</span> {task.priority}
        </p>
        <p
          className={`font-semibold ${
            task.status === "Pending" ? "text-red-500" : "text-green-500"
          }`}
        >
          <span>Status:</span> {task.status}
        </p>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => updateTaskStatus(task._id, task.status)}
          className={`px-4 py-2 rounded-lg shadow-md transition duration-300 ${
            task.status === "Pending"
              ? "bg-green-500 text-white"
              : "bg-orange-500 text-white"
          }`}
        >
          Mark as {task.status === "Pending" ? "Completed" : "Pending"}
        </button>
        {role === "admin" && (
          <button
            onClick={() => deleteTask(task._id)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600"
          >
            <DeleteIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
