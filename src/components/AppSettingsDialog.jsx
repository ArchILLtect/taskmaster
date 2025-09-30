import React, { useEffect, useState } from "react";
import { useApp } from "../contexts/AppContext";
import { updateUserProfile } from "../services/apiHelpers";
import { useAuth0 } from "@auth0/auth0-react";
import FullPageLoader from "./FullPageLoader";


// TODO: Add click outside the box to close modal functionality.
// TODO: Maybe app settings only save on logout? Or is that problematic?
// TODO: Notifications needs light/dark toggle.
// TODO: Language needs <select> type input?
// TODO: Notifications needs T/F toggle.


const AppSettingsDialog = ({ onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const { isDarkMode, setIsDarkMode, currentUser, setUser } = useApp(); // Use dark mode state from context
    const { user: auth0User } = useAuth0();

    // State for editable fields
    const [editValues, setEditValues] = useState({
        theme: isDarkMode ? "dark" : "light", // Initialize directly from isDarkMode
        language: currentUser.language || "English",
        notifications: currentUser.notifications || false,
    });

    useEffect(() => {
        setEditValues((prev) => ({
            ...prev,
            theme: isDarkMode ? "dark" : "light", // Synchronize with isDarkMode
        }));
    }, [isDarkMode]);

    const handleInputChange = (field, value) => {
        console.log(field + value)
        setEditValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        const updatedFields = {};
        const target = 'app_metadata';
        Object.keys(editValues).forEach((key) => {
            if (editValues[key] !== currentUser[key]) {
                updatedFields[key] = editValues[key];
            }
        });

        if (Object.keys(updatedFields).length > 0) {
            try {
                setIsLoading(true); // Show loading spinner
                // Call the API helper to update user profile
                const updatedUser = await updateUserProfile(auth0User.sub, updatedFields, target);

                // Update currentUser in context
                setUser((prevUser) => ({
                    ...prevUser,
                    ...updatedFields, // Merge updated fields
                }));
                console.log(updatedUser)
                alert("Profile updated successfully!");
            } catch (error) {
                console.error("Error updating profile:", error);
                setError("Failed to update profile.");
            } finally {
                setIsLoading(false); // Hide loading spinner
            }
        } else {
            setError("No changes to save.");
        }
    };

    // Handle Dark Mode toggle separately as it directly affects the UI
    const handleDarkModeToggle = (mode) => {
        const isDarkMode = mode === "dark";

        // Update the `theme` in editValues
        handleInputChange("theme", mode);

        // Update the app-wide dark mode state
        setIsDarkMode(isDarkMode);

        // Persist the preference to localStorage
        localStorage.setItem("darkMode", isDarkMode);

        // Update the `dark` class on the <html> element
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        
    };

    //TODO: Change the following 2 if statements to inline displaying:
    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (isLoading || !currentUser) {
        return <FullPageLoader message="Initializing your account..." />;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="relative bg-gray-200 dark:bg-gray-800 p-6 rounded shadow-md w-5/12">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 px-[5px] bg-gray-800 hover:bg-gray-200 text-gray-200 hover:text-gray-900 rounded-sm"
                >
                    X
                </button>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">App Settings</h2>
                <p className="text-gray-800 dark:text-gray-200 ml-4 mt-2 mb-8">Make changes and click save:</p>
                <fieldset className="mt-5 text-gray-800 dark:text-gray-300 border-2 rounded-lg border-gray-900 dark:border-blue-300 border-opacity-20">
                    <legend
                        className="ml-5 mb-0 px-3 pt-1 text-xl font-bold text-gray-700 dark:text-gray-200
                                border-t-[2.5px] rounded-xl border-gray-900 dark:border-blue-300 border-opacity-20">
                            User Details:
                    </legend>
                    <div className="p-4">
                {/* Theme Section */}
                <div className="flex flex-row justify-between mb-8">
                    <label className="block text-md font-medium text-gray-800 dark:text-gray-200">
                        Theme
                    </label>
                    <div className="mt-2 flex gap-4">
                        <button
                            className={`px-4 py-2 rounded-md ${
                                editValues.theme === "light"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            }`}
                            onClick={() => handleDarkModeToggle("light")}
                        >
                            Light
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${
                                editValues.theme === "dark"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            }`}
                            onClick={() => handleDarkModeToggle("dark")}
                        >
                            Dark
                        </button>
                    </div>
                </div>
                <hr className="border-gray-900 dark:border-blue-300 border-opacity-20 dark:border-opacity-50"/>
                {/* Notifications Section */}
                <div className="flex flex-row justify-between mt-2 my-8">
                    <label className="block text-md font-medium text-gray-800 dark:text-gray-200">
                        Notifications
                    </label>
                    <div className="mt-2 flex gap-4">
                        <button
                            className={`px-4 py-2 rounded-md ${
                                editValues.notifications
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            }`}
                            onClick={() => handleInputChange("notifications", true)}
                        >
                            On
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${
                                !editValues.notifications
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            }`}
                            onClick={() => handleInputChange("notifications", false)}
                        >
                            Off
                        </button>
                    </div>
                </div>
                <hr className="border-gray-900 dark:border-blue-300 border-opacity-20 dark:border-opacity-50"/>
                {/* Language Section */}
                <div className="flex flex-row justify-between mt-2 my-8">
                    <label className="block text-md font-medium text-gray-800 dark:text-gray-200">
                        Language
                    </label>
                    <select
                        value={editValues.language}
                        onChange={(e) => handleInputChange("language", e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 mt-2 bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
                    >
                        <option value="English">English</option>
                        {/* Add more language options here in the future */}
                    </select>
                </div>
                    </div>

                </fieldset>
                <div className="flex justify-end mt-4">

                    <button
                        onClick={onClose}
                        className="mr-2 px-4 py-2 bg-gray-500 text-gray-200 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )

};

export default AppSettingsDialog;