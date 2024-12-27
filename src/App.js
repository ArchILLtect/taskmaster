import React, { useState, useEffect } from 'react';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TabBar from './components/TabBar';
import GroupManager from './components/GroupManager';
import { fetchGroups } from './services/groupService';

const App = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const refreshTasks = () => {
    // Use the function directly without needing refreshFlag
    setGroups([...groups]); // This will re-render the component, triggering a refresh
  };

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const fetchedGroups = await fetchGroups(); // Fetch groups via service
        setGroups(fetchedGroups);
        if (fetchedGroups.length > 0) {
          setSelectedGroup(fetchedGroups[0]); // Default to first group
        }
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    };

    loadGroups();
  }, []);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    console.log(`Selected group: ${group}`);
  };

  const handleTaskAdded = () => {
    console.log('Task added');
    // Logic to refresh tasks or update state
    refreshTasks(); // Call your refresh function if available
  };

  return (
    <div className="p-10 mx-auto bg-gray-100 w-full sm:w-11/12  md:w-10/12 lg:w-9/12 xl:w-8/12 2xl:w-1/2">
      <div className="p-5 bg-white">
        <h1 className="text-4xl font-mono font-bold text-center">TaskMaster</h1>
      </div>

      {/* GroupManager handles adding new groups */}
      <GroupManager
        onGroupsUpdated={setGroups}
        selectedGroup={selectedGroup}
      />

      {/* TabBar now handles group display */}
      <TabBar
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={handleSelectGroup}
        onGroupsUpdated={setGroups} // Update groups from TabBar
      />

      {/* Pass selected group to TaskForm and TaskList */}
      <TaskForm selectedGroup={selectedGroup} onTaskAdded={handleTaskAdded} />

      <TaskList selectedGroup={selectedGroup} />
    </div>
  );
};

export default App;
