import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import DEFAULT_PIC from '../assets/logo.svg';
import { useApp } from "../contexts/AppContext";

const AuthPortal = ({ onSettingsOpen }) => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const { setShowProfile, currentUser } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);


  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown only if the click is outside the dropdown container
      if (!event.target.closest(".auth-dropdown")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Use "mousedown" for faster detection
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //if (isLoading) return <p>Loading...</p>;

  return (
    <div className="relative flex flex-col items-center auth-dropdown bg-white dark:bg-gray-600 p-1 rounded-lg shadow-md">
      {isAuthenticated ? (
        <>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="px-1 py-0 bg-gray-50 rounded-md hover:bg-gray-200 transition duration-200"
          >
            <div className="flex gap-1 items-center">
            <p className="text-md font-semibold text-gray-700 max-w-[12rem]">
              <span className="text-blue-600 ml-2">{currentUser.nickname || user?.name}</span>
            </p>
            <img src={user?.picture || DEFAULT_PIC } alt="Profile pic" className="w-8 h-8 rounded-full" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className={`absolute top-10 right-0 bg-white rounded-md shadow-lg w-40 z-50 transition-transform duration-200 ${
                showDropdown ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}>
              <ul className="flex flex-col text-left">
                <li
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                    onClick={() => setShowProfile(true)}
                    >
                    My Profile
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => onSettingsOpen(true)}
                >
                  Account Settings
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => logout({ returnTo: window.location.origin })}
                >
                  Log Out
                </li>
              </ul>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => loginWithRedirect()
          }
          className="px-6 py-3 bg-blue-500 text-white text-nowrap rounded-md hover:bg-blue-600 transition duration-200"
        >
          Log In
        </button>
      )}
    </div>
  );
};

export default AuthPortal;