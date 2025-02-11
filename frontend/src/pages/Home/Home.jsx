
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TaskOverlay from "../../components/Taskoverly/TaskOverlay";;
import  RecordOption from "../../components/Record/RecordOption"
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoader } from "../../components/Loader/LoaderContext";
import { Chat, ChatSharp, Search } from "@mui/icons-material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import TaskModal from "../../components/TaskModal/TaskModal"
import ChatComponent from "../../components/Chat/ChatComponent";
import VideoCall from "../../components/Videocall/VideoCall";


function Home() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [editingTask, setEditingTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const tasksPerPage = 9;
  const dropdownRef = useRef(null);
  const [role,setRole] = useState("")
  const [loggedInUserEmail,setLoggedInUserEmail] = useState("")
  const navigate = useNavigate();
  const toggleOverlay = () => setShowOverlay((prev) => !prev);
  const { showLoader, hideLoader } = useLoader();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchTasks = async () => {
    try {
      const userId = localStorage.getItem("userId"); 
      const role = localStorage.getItem("role");     
  
      const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
        params: { user_id: userId, role: role },  
      
           // Send user_id and role as query parameters
      });
      console.log(userId,role);
      
  
      if (response.data.success) {
        setTasks(response.data.tasks); // Update tasks state with the response
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  
  

  useEffect(() => {
    fetchTasks();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

    };
    const userRole = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    const loggedUserEmail = localStorage.getItem("email"); 
    setRole(userRole)
    setLoggedInUserEmail(loggedUserEmail)

    console.log("userrole-----------Home",userRole);
    console.log("email-----------",loggedUserEmail);
    console.log("useId----------",userId);
    
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

   
  }, []);

  const updateTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "Pending" ? "Completed" : "Pending";
    try {
      showLoader();
      const response = await axios.put(
        `${API_BASE_URL}/api/tasks/${taskId}/status`,
        {
          status: newStatus,
        }
      );

      if (response.data.success) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, status: newStatus } : task
          )
        );
      } else {
        console.error("Failed to update task status:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
    hideLoader();
  };

  const deleteTask = async (taskId) => {
    showLoader();
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/tasks/${taskId}`
      );
      if (response.data.success) {
        setTasks((prevTasks) => {
          const updatedTasks = prevTasks.filter((task) => task._id !== taskId);
          const filteredTasks = updatedTasks.filter((task) =>
            activeTab === "All" ? true : task.status === activeTab
          );
  
          // Navigate to the previous page if the current page becomes empty
          if (
            filteredTasks.length <= (currentPage - 1) * tasksPerPage &&
            currentPage > 1
          ) {
            setCurrentPage(currentPage - 1);
          }
  
          return updatedTasks;
        });
      } else {
        console.error("Failed to delete task:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
    hideLoader();
  };
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const editTask = (task) => {
    setEditingTask(task);
    setShowOverlay(true);
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "All") return true;
    return task.status === activeTab;
  });
  

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const openModal = (task) => {
    setSelectedTask(task);
    console.log(task,"task details");
    
  };

  const closeModal = () => {
    setSelectedTask(null);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-500 to-teal-400 text-white">
      <header className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <h1
            className="text-2xl font-extrabold cursor-pointer"
            onClick={() => navigate("/home")}
          >
            Task Manager
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          {/* <div className="relative cursor-pointer">
            <NotificationsIcon fontSize="large" />
            <span className="absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full px-1">
              3
            </span>
          </div> */}
          <div className="relative cursor-pointer z-20" ref={dropdownRef}>
            <AccountCircleIcon
              fontSize="large"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white text-gray-800 shadow-lg rounded-lg">
                <ul>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate("/profile")}
                  >
                    Profile
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate("/settings")}
                  >
                    Settings
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex flex-grow">
        <aside className="w-1/4 min-w-[300px] max-w-[300px] bg-gradient-to-br from-blue-500 to-teal-400 text-white p-6">
       
        {role === "admin" && (
            <button
              className="w-full bg-white text-blue-600 font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300"
              onClick={() => setEditingTask(null) || toggleOverlay()}
            >
              + New Task
            </button>
          )}
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
                activeTab === "Chat"
                  ? "bg-white text-blue-600"
                  : "hover:bg-blue-600"
              }`}
              onClick={() => setActiveTab("Chat")}
            >
             Chat
            </li>
            <li
              className={`cursor-pointer py-2 px-4 rounded-lg ${
                activeTab === "Video"
                  ? "bg-white text-blue-600"
                  : "hover:bg-blue-600"
              }`}
              onClick={() => setActiveTab("Video")}
            >
             Video
            </li>
          </ul>

        </aside>
        <main className="flex-grow bg-gray-200 p-6 overflow-y-auto">
          {activeTab === "Chat" && (
            <div className="flex justify-center items-center h-full">
              <ChatComponent/>
            </div>
          )}
          {activeTab === "Video" && (
            <div className="flex justify-center items-center h-full">
              <VideoCall/>
            </div>
          )}
          {activeTab !== "Record" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTasks.map((task, index) => (
                <div
                  className="relative bg-white shadow-lg rounded-lg p-6 text-gray-800 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
                  key={index}
                  // onClick={() => openModal(task)}
                >
                  {role=="admin" &&(

                  <button
                    onClick={() => editTask(task)}
                    className="absolute top-3 right-3 text-blue-500 hover:text-blue-600"
                  >
                    <span className="material-icons text-2xl">edit</span>
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
                      <span className="font-semibold">Priority:</span>{" "}
                      {task.priority}
                    </p>
                    <p
                      className={`font-semibold ${
                        task.status === "Pending"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      <span>Status:</span> {task.status}
                    </p>
                  </div>
                  <div className="flex justify-between mt-4 space-x-2">
                    <button
                      onClick={() => updateTaskStatus(task._id, task.status)}
                      className={`px-4 py-2 rounded-lg shadow-md transition duration-300 ${
                        task.status === "Pending"
                          ? "bg-gradient-to-br from-green-500 to-teal-400 text-white "
                          : "bg-gradient-to-r from-orange-500 to-pink-600 text-white t"
                      }`}
                    >
                      Mark as {task.status === "Pending" ? "Completed" : "Pending"}
                    </button>
                    {role == "admin" &&(

                    <button
                      className="bg-red-500  hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:opacity-90 transition duration-300 flex items-center"
                      onClick={() => deleteTask(task._id)}
                    >
                      <DeleteIcon />
                    </button>
                    )}
                  </div>
                </div>
              ))}
              {/* {selectedTask && (
            // <TaskModal task={selectedTask} onClose={closeModal} />
          // )} */}
            </div>
            
          )}
            {totalPages > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-white p-4 flex justify-center items-center space-x-4">
              <button
                className="bg-gray-200 px-4 py-2 rounded-full shadow hover:bg-gray-300"
                onClick={() => handlePageChange("prev")}
                disabled={currentPage === 1}
              >
                <ArrowBackIos fontSize="small" />
              </button>
              <p className="text-gray-800">
                Page {currentPage} of {totalPages}
              </p>
              <button
                className="bg-gray-200 px-4 py-2 rounded-full shadow hover:bg-gray-300"
                onClick={() => handlePageChange("next")}
                disabled={currentPage === totalPages}
              >
                <ArrowForwardIos fontSize="small" />
              </button>
            </div>
          )}
          {showOverlay && (
            <TaskOverlay
              closeOverlay={toggleOverlay}
              fetchTasks={fetchTasks}
              editingTask={editingTask}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;
