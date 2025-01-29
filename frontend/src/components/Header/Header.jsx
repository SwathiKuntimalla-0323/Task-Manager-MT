import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
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
  );
}

export default Header;
