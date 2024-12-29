import React, { useState, useEffect } from 'react';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TabBar from './components/TabBar';
import GroupManager from './components/GroupManager';
import { addGroup, fetchGroups } from './services/groupService';

const App = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false); // Track refresh triggers

  /*
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const fetchedGroups = await fetchGroups();
        setGroups(fetchedGroups);
        if (fetchedGroups.length > 0) {
          setSelectedGroup(fetchedGroups[0]);
        }
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    };

    loadGroups();
  }, []);
  */

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const fetchedGroups = await fetchGroups();
        if (!fetchedGroups.find((group) => group.groupName === 'General')) {
          await addGroup('General'); // Add "General" if it doesn't exist
          const updatedGroups = await fetchGroups(); // Fetch updated groups
          setGroups(updatedGroups);
        } else {
          setGroups(fetchedGroups);
        }
  
        if (fetchedGroups.length > 0) {
          setSelectedGroup(fetchedGroups[0]); // Default to the first group
        } else {
          setSelectedGroup(null);
        }
      } catch (error) {
        console.error('Error loading groups:', error);
        setGroups([]); // Ensure groups state is never undefined
      }
    };
  
    loadGroups();
  }, []);

  const refreshTasks = () => {
    setRefreshFlag((prev) => !prev); // Toggle refreshFlag to trigger updates in TaskList
  };

  return (
    <div className="p-10 mx-auto bg-gray-100 w-full sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 2xl:w-1/2">
      <div className="p-5 bg-white">
        <h1 className="text-4xl font-mono font-bold text-center">TaskMaster</h1>
      </div>

      <GroupManager onGroupsUpdated={setGroups} selectedGroup={selectedGroup} />

      <TabBar
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
      />

      <TaskForm selectedGroup={selectedGroup} onTaskAdded={refreshTasks} />

      <TaskList selectedGroup={selectedGroup} refreshFlag={refreshFlag} />
    </div>
  );
};

export default App;
