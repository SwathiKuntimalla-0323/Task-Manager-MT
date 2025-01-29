import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLoader } from "../../components/Loader/LoaderContext";
import toast, { Toaster } from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validation for empty fields
    if (!email.trim() || !password.trim()) {
      toast.error("All fields are required.");
      return;
    }
  
    showLoader(); // Show loader before API call
  
    try {
  
      const response = await axios.post(`${API_BASE_URL}/api/login`,
         { 
          email,
          password
           });
  
      if (response.data.success) {
        // Store token, userId, role, and email in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId); // Use the userId from backend response
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("email", response.data.email);
  
        console.log("UserID:", response.data.userId);
        console.log("Role:", response.data.role);
        console.log("Token:", response.data.token);
  
        toast.success("Login successful!");
        navigate("/home");
      } else {
        toast.error(response.data.message || "Login failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      hideLoader(); // Hide loader after API call
    }
  };
  
  
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Toaster for Notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Left Side */}
      <div className="lg:w-1/2 w-full bg-gradient-to-br from-blue-500 to-teal-400 text-white flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="text-center">
          <h1 className="text-3xl lg:text-5xl font-extrabold mb-4">
            Welcome Back
          </h1>
          <p className="text-lg lg:text-xl mb-8">
            Log in to continue managing your tasks effortlessly!
          </p>
        </div>
        <div className="space-y-6">
          <div className="flex items-center">
            <span className="material-icons text-3xl lg:text-4xl mr-4">
              check_circle
            </span>
            <p className="text-sm lg:text-lg">Review your progress.</p>
          </div>
          <div className="flex items-center">
            <span className="material-icons text-3xl lg:text-4xl mr-4">
              alarm_on
            </span>
            <p className="text-sm lg:text-lg">Never miss a deadline.</p>
          </div>
          <div className="flex items-center">
            <span className="material-icons text-3xl lg:text-4xl mr-4">
              assignment_turned_in
            </span>
            <p className="text-sm lg:text-lg">Complete tasks with ease.</p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="lg:w-1/2 w-full bg-gray-200 flex flex-col justify-center items-center p-6 lg:p-8">
        <div className="bg-white shadow-2xl rounded-lg p-6 lg:p-10 w-full max-w-md">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-800 mb-6">
            Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-2 lg:py-3 rounded-lg shadow-lg hover:opacity-90 transition duration-300"
            >
              Login
            </button>
          </form>
          <div className="mt-4 lg:mt-6 text-center">
            <p className="text-gray-600">
              New to TaskMaster?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-500 font-bold hover:underline"
              >
                Signup
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
