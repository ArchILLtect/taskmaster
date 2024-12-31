import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]); // Manage all tasks
  const [filteredTasks, setFilteredTasks] = useState([]); // Manage all tasks
  const [groups, setGroups] = useState([]); // Manage all groups
  const [groupNewName, setGroupNewName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null); // Currently selected group


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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);