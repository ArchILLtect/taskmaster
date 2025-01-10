import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]); // Manage all tasks
  const [filteredTasks, setFilteredTasks] = useState([]); // Manage all tasks
  const [groups, setGroups] = useState([]); // Manage all groups
  const [groupNewName, setGroupNewName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null); // Currently selected group
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false); // Track refresh triggers
  const [currentUser, setCurrentUser] = useState(null); // Holds User instance
  const [showProfile, setShowProfile] = useState(false);
  const [showPicUploader, setShowPicUploader] = useState(false);
  const [status, setStatus] = useState("online"); // Default to online

  useEffect(() => {
    // Check localStorage for dark mode preference
    const storedDarkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(storedDarkMode);
    if (storedDarkMode) {
        document.documentElement.classList.add("dark");
    }
  }, []);

  const setUser = (user) => {
    setCurrentUser(user);
  };

  const clearUser = () => {
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        setTasks,
        filteredTasks,
        setFilteredTasks,
        groups,
        setGroups,
        groupNewName,
        setGroupNewName,
        selectedGroup,
        setSelectedGroup,
        isDarkMode,
        setIsDarkMode,
        refreshFlag,
        setRefreshFlag,
        currentUser,
        setUser,
        clearUser,
        showProfile,
        setShowProfile,
        showPicUploader,
        setShowPicUploader,
        status,
        setStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);