import { useState } from "react";
import { useApp } from "../contexts/AppContext";
import User from "../models/User";
import { useNavigate } from "react-router-dom";

const UserSetupModal = () => {
    const [username, setUsername] = useState('');
    const { setStatus, setUser } = useApp();
    const navigate = useNavigate();
    
    const handleOfflineInit = () => {
        if (!username.trim()) {
            console.error("Username cannot be empty.");
            return;
        }

        console.log("Offline Init triggered for username:", username);

        // Generate a random ID and create the user
        const randomIDNumber = Math.floor(Math.random() * 1e6);
        const newUser = new User({
            userID: `offline-${randomIDNumber}`,
            userName: username,
            nickname: "",
            email: "",
            picture: "", // TODO: Set default picture
            createdAt: Date.now(),
            lastLogin: "",
            role: "user",
            website: "",
            company: "",
            theme: "light",
            language: "en",
            notifications: false,
        });

        console.log("New user created:", newUser);

        // Save user locally and update context
        newUser.saveToLocalStorage();
        setUser(newUser);
        setStatus("offline");

        navigate("/offline");
    };

    const handleOnlineInit = () => {
        console.log("online Init triggered");
        setStatus("online");
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="relative bg-gray-200 dark:bg-gray-800 rounded-lg p-8 shadow-xl w-10/12 max-w-4xl border-2 border-blue-300">
                <h1 className="text-4xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
                    Welcome to <span className="text-blue-500">TaskMaster!</span>
                </h1>
                <h2 className="text-2xl font-medium text-center mb-8 text-gray-800 dark:text-gray-200">
                    Choose a Mode
                </h2>
                <div className="flex flex-col sm:flex-row justify-around items-stretch gap-8">
                    {/* Offline Mode */}
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-6 shadow-md">
                        <h3 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">
                            Offline Mode
                        </h3>
                        <p className="text-lg text-center mb-4 text-gray-800 dark:text-gray-200">
                            Get started instantly, no account needed! Caution: Deleting browsing data will clear all tasks and user settings unless you log in and sync.
                        </p>
                        <div className="mb-6">
                            <label
                                htmlFor="username"
                                className="block text-lg text-gray-800 dark:text-gray-200 mb-2"
                            >
                                Enter a username:
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    console.log("Input value:", e.target.value);
                                    setUsername(e.target.value)
                                }}
                                placeholder="Username"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => handleOfflineInit()}
                            className="w-full py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition duration-200"
                        >
                            Continue
                        </button>
                    </div>
                    {/* Online Mode */}
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-6 shadow-md">
                        <h3 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">
                            Online Mode
                        </h3>
                        <p className="text-lg text-center mb-6 text-gray-800 dark:text-gray-200">
                            Sign in or create an account for full features.
                        </p>
                        <button
                            onClick={() => handleOnlineInit()}
                            className="w-full py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition duration-200"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSetupModal;