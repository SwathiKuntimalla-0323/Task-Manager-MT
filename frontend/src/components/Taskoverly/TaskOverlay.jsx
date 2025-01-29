import React, { useState, useEffect, useRef } from "react";
import "./TaskOverlay.css";
import axios from "axios";
import { useLoader } from "../../components/Loader/LoaderContext";

function TaskOverlay({ closeOverlay, fetchTasks, editingTask }) {
  const [taskDetails, setTaskDetails] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const mediaRecorderRef = useRef(null);
  const { showLoader, hideLoader } = useLoader();
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [loggedInUserEmail, setLoggedInUserEmail] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    const loggedUserEmail = localStorage.getItem("email");
    setRole(userRole);
    setLoggedInUserEmail(loggedUserEmail);

    console.log("userrole-----------Home", userRole);
    console.log("email-----------", loggedUserEmail);

    if (loggedInUserEmail) {
      axios
        .get(`${API_BASE_URL}/api/users?exclude_email=${loggedUserEmail}`)
        .then((response) => {
          if (response.data.success) {
            setUsers(response.data.users);
          }
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
        });
    }

    if (editingTask) {
      setTaskDetails({
        title: editingTask.title,
        description: editingTask.description || "",
        deadline: editingTask.deadline,
        priority: editingTask.priority,
      });
    }

    axios
      .get(`${API_BASE_URL}/api/users`)
      .then((response) => {
        if (response.data.success) {
          setUsers(response.data.users);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [editingTask, loggedInUserEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      setIsTyping(true);
      setTaskDetails((prev) => ({ ...prev, [name]: value }));

      if (value.length > 2) {
        axios
          .get(`https://api.datamuse.com/words?sp=${value}*`)
          .then((response) => {
            setSuggestions(response.data.map((item) => item.word) || []);
          })
          .catch((error) => {
            console.error("Error fetching suggestions:", error);
          });
      } else {
        setSuggestions([]);
      }
    } else {
      setTaskDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const selectSuggestion = (word) => {
    setTaskDetails((prev) => ({ ...prev, title: word }));
    setSuggestions([]); // Clear suggestions after selection
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

  showLoader()

    try {
      if (editingTask) {
        await axios.put(`${API_BASE_URL}/api/tasks/${editingTask._id}`, taskDetails);
      } else {
        await axios.post(`${API_BASE_URL}/api/tasks`, taskDetails);
      }
      fetchTasks();
      closeOverlay();
    } catch (error) {
      console.error("Error saving task:", error);
    }
    hideLoader()
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        try {
          showLoader();
          const response = await axios.post(`${API_BASE_URL}/upload-audio`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          hideLoader();
          if (response.data.success) {
            setTaskDetails((prev) => ({ ...prev, title: response.data.message }));
          } else {
            alert("Audio processing failed.");
          }
        } catch (error) {
          console.error("Error uploading audio:", error);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Unable to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="overlay flex justify-center items-center bg-gray-900 bg-opacity-50 fixed inset-0 z-50">
      <div className="overlay-content bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {editingTask ? "Edit Task" : "New Task"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="text-gray-700 font-semibold">Task Title:</span>
            <div className="relative mt-2">
              <input
                type="text"
                name="title"
                placeholder="Enter task title"
                value={taskDetails.title}
                onChange={handleChange}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-2 w-full max-h-40 overflow-y-auto shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className="record-controls absolute right-2 top-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="text-blue-500 hover:text-blue-600"
                    disabled={isTyping}
                    title="Start Recording"
                  >
                    🎤
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="text-red-500 hover:text-red-600"
                    title="Stop Recording"
                  >
                    ⏹
                  </button>
                )}
              </div>
            </div>
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">Assign To:</span>
            <select
              name="user_id"
              value={taskDetails.user_id || ""}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select a user
              </option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">Description:</span>
            <textarea
              name="description"
              placeholder="Enter task description"
              value={taskDetails.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </label>

          <div className="flex gap-4">
            <label className="flex-1">
              <span className="text-gray-700 font-semibold">Deadline:</span>
              <input
                type="datetime-local"
                name="deadline"
                value={taskDetails.deadline}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex-1">
              <span className="text-gray-700 font-semibold">Priority:</span>
              <select
                name="priority"
                value={taskDetails.priority}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select priority
                </option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2 rounded-lg shadow-md hover:opacity-90 transition duration-300"
            >
              Save Task
            </button>
            <button
              type="button"
              onClick={closeOverlay}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg shadow-md hover:bg-gray-400 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskOverlay;
