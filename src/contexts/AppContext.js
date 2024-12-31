import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]); // Manage all tasks
  const [groups, setGroups] = useState([]); // Manage all groups
  const [selectedGroup, setSelectedGroup] = useState(null); // Currently selected group
  const [filteredTasks, setFilteredTasks] = useState([]); // Manage all tasks

  return (
    <AppContext.Provider
      value={{
        tasks,
        setTasks,
        filteredTasks,
        setFilteredTasks,
        groups,
        setGroups,
        selectedGroup,
        setSelectedGroup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);