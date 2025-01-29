// src/axiosConfig.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000", // Backend API URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
