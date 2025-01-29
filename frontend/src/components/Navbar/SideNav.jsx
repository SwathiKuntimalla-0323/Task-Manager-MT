import React from "react";

function SideNav({ activeTab, setActiveTab, role, toggleOverlay }) {
  return (
    <aside className="w-1/4 min-w-[300px] max-w-[300px] bg-gradient-to-br from-blue-500 to-teal-400 text-white p-6">
      {/* New Task Button for Admin */}
      {role === "admin" && (
        <button
          className="w-full bg-white text-blue-600 font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300"
          onClick={() => toggleOverlay()}
        >
          + New Task
        </button>
      )}

      {/* Tabs */}
      <ul className="mt-6 space-y-4">
        <li
          className={`cursor-pointer py-2 px-4 rounded-lg ${
            activeTab === "All" ? "bg-white text-blue-600" : "hover:bg-blue-600"
          }`}
          onClick={() => setActiveTab("All")}
        >
          All Tasks
        </li>
        <li
          className={`cursor-pointer py-2 px-4 rounded-lg ${
            activeTab === "Completed"
              ? "bg-white text-blue-600"
              : "hover:bg-blue-600"
          }`}
          onClick={() => setActiveTab("Completed")}
        >
          Completed
        </li>
        <li
          className={`cursor-pointer py-2 px-4 rounded-lg ${
            activeTab === "Pending"
              ? "bg-white text-blue-600"
              : "hover:bg-blue-600"
          }`}
          onClick={() => setActiveTab("Pending")}
        >
          Pending
        </li>
        <li
          className={`cursor-pointer py-2 px-4 rounded-lg ${
            activeTab === "Record"
              ? "bg-white text-blue-600"
              : "hover:bg-blue-600"
          }`}
          onClick={() => setActiveTab("Record")}
        >
          Record Option
        </li>
      </ul>
    </aside>
  );
}

export default SideNav;
