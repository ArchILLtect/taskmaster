import { useApp } from "../contexts/AppContext";


const AppSettingsDialog = ({ onClose }) => {
    const { isDarkMode, setIsDarkMode } = useApp(); // Use dark mode state from context

    const handleDarkModeToggle = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode); // Update context
        localStorage.setItem("darkMode", newDarkMode); // Persist to localStorage
        document.documentElement.classList.toggle("dark", newDarkMode); // Toggle dark class on <html>
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded shadow-md w-5/12">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">App Settings</h2>
                <p className="text-gray-800 dark:text-gray-200">Make changes and click save.</p>
                <div className="flex items-center dark:text-gray-200 justify-between mb-4">
                        <label htmlFor="darkModeToggle" className="text-md font-medium">
                            Dark Mode
                        </label>
                        <input
                            id="darkModeToggle"
                            type="checkbox"
                            checked={isDarkMode}
                            onChange={handleDarkModeToggle}
                            className="toggle-checkbox"
                        />
                    </div>
                    {/* Language option */}
                    {/* Notifications option */}
                <div className="flex justify-end mt-4">

                    <button
                        onClick={onClose}
                        className="mr-2 px-4 py-2 bg-gray-500 text-gray-200 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { alert("Coming Soon!") }}
                        className="px-4 py-2 bg-green-500 text-white rounded-md"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )

};

export default AppSettingsDialog;