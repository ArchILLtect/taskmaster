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
  const [refreshFlag, setRefreshFlag] = useState(false); // Used to trigger refresh

  const refreshTasks = () => setRefreshFlag((prev) => !prev);

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
    <div>
      <h1 className="text-4xl font-mono font-bold text-center p-5">TaskMaster</h1>

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
