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

  useEffect(() => {
    // Check localStorage for dark mode preference
    const storedDarkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(storedDarkMode);
    if (storedDarkMode) {
        document.documentElement.classList.add("dark");
    }
  }, []);

  const setUser = (user) => {
    // Clear user data on logout
    setCurrentUser(user);
  };

  const clearUser = () => {
    // Clear user data on logout
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);