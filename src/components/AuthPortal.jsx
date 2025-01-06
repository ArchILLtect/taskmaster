import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import DEFAULT_PIC from '../assets/logo.svg';
import { useApp } from "../contexts/AppContext";
import useInitializeUser from "../hooks/useInitializeUser";
import InlineLoader from "./InlineLoader";

const AuthPortal = ({ onSettingsOpen }) => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const { setShowProfile, currentUser } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  // Reinitialize user if not already set
  const { isLoading, error } = useInitializeUser(!currentUser);

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

  if (error) {
    return <div className="text-red-500">An error occurred. Please try refreshing the page.</div>;
  }

  return (
    <div className="relative flex flex-col items-center auth-dropdown bg-white dark:bg-gray-600 p-1 rounded-lg shadow-md">
      {/* While loading run the inline loader spinner */}
      {isLoading || !user ? (
        <div className="flex items-center justify-center">
            <InlineLoader message="Fetching data..." />
        </div>
      ) : isAuthenticated ? (
        <>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="px-1 py-0 bg-gray-50 rounded-md hover:bg-gray-200 transition duration-200"
          >
            <div className="flex gap-1 items-center">
            <p className="text-md font-semibold text-gray-700 max-w-[12rem]">
              <span className="text-blue-600 ml-2">{currentUser?.nickname || user?.name}</span>
            </p>
            <img src={user?.picture || DEFAULT_PIC } alt="Profile pic" className="w-8 h-8 rounded-full" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="px-1 py-0 bg-gray-50 rounded-md hover:bg-gray-200 transition duration-200"
                  aria-expanded={showDropdown}
            >
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