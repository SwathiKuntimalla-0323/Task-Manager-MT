import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLoader } from "../../components/Loader/LoaderContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role is 'user'
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    showLoader();
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(`${API_BASE_URL}/api/signup`, {
        name,
        email,
        password,
        role, // Include the selected role in the request
      });

      if (response.data.success) {
        setSuccess("Signup successful! Redirecting to login...");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole("user");
        setTimeout(() => navigate("/"), 3000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    }
    hideLoader();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Side */}
      <div className="lg:w-1/2 w-full bg-gradient-to-br from-blue-500 to-teal-400 text-white flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="text-center">
          <h1 className="text-3xl lg:text-5xl font-extrabold mb-4">
            Welcome to TaskMaster
          </h1>
          <p className="text-lg lg:text-xl mb-8">
            Simplify your tasks, boost productivity, and achieve your goals!
          </p>
        </div>
        <div className="space-y-6">
          <div className="flex items-center">
            <span className="material-icons text-3xl lg:text-4xl mr-4">
              assignment
            </span>
            <p className="text-sm lg:text-lg">Organize your tasks efficiently.</p>
          </div>
          <div className="flex items-center">
            <span className="material-icons text-3xl lg:text-4xl mr-4">
              alarm
            </span>
            <p className="text-sm lg:text-lg">
              Set reminders and deadlines effortlessly.
            </p>
          </div>
          <div className="flex items-center">
            <span className="material-icons text-3xl lg:text-4xl mr-4">
              check_circle
            </span>
            <p className="text-sm lg:text-lg">Stay focused and achieve more.</p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="lg:w-1/2 w-full bg-gray-200 flex flex-col justify-center items-center p-6 lg:p-8">
        <div className="bg-white shadow-2xl rounded-lg p-6 lg:p-10 w-full max-w-md">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-800 mb-6">
            Create an Account
          </h2>
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-2 lg:py-3 rounded-lg shadow-lg hover:opacity-90 transition duration-300"
            >
              Signup
            </button>
          </form>
          <div className="mt-4 lg:mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-blue-500 font-bold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
