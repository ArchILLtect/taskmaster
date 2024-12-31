import React, { useState, useEffect } from 'react';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TabBar from './components/TabBar';
import GroupManager from './components/GroupManager';
import { addGroup, fetchGroups } from './services/groupService';
import TaskGroupTotaler from './components/TaskGroupTotaler';
import { useApp } from "./contexts/AppContext";

const App = () => {
    const { setGroups, setSelectedGroup } = useApp();
    const [refreshFlag, setRefreshFlag] = useState(false); // Track refresh triggers
    const [highlightedTaskID, setHighlightedTaskID] = useState(null); // Track highlighted task
    const [highlightedGroupID, setHighlightedGroupID] = useState(null); // Track highlighted group
    const [groupTotal, setGroupTotal] = useState(null);

    useEffect(() => {
        const loadGroups = async () => {
            try {
                const fetchedGroups = await fetchGroups();
                if (!fetchedGroups.find((group) => group.groupID === '1735400111111')) {
                    await addGroup('General'); // Add "General" if it doesn't exist
                    const updatedGroups = await fetchGroups(); // Fetch updated groups
                    setGroups(updatedGroups);
                } else {
                    setGroups(fetchedGroups);
                }

                // Ensure the "General" group is first
                const sortedGroups = fetchedGroups.sort((a, b) => {
                    if (a.groupID === '1735400111111') return -1; // "General" group first
                    if (b.groupID === '1735400111111') return 1;
                    return 0; // Maintain original order otherwise
                });

                // Update state with the sorted groups
                setGroups(sortedGroups);
          
                // Default to "General" group if it exists, or the first group otherwise
                const defaultGroup = sortedGroups.find(group => group.groupID === '1735400111111') || sortedGroups[0];
                setSelectedGroup(defaultGroup || null); // Set selected group to default or null if no groups exist
            
            } catch (error) {
                console.error('Error loading groups:', error);
                setGroups([]); // Ensure groups state is never undefined
            }
      };
    
      loadGroups();
    }, [setGroups, setSelectedGroup]);

    const refreshTasks = () => {
        setRefreshFlag((prev) => !prev); // Toggle refreshFlag to trigger updates in TaskList
    };

    return (
        <div className="sm:p-10 mx-auto bg-gray-100 w-full sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 2xl:w-1/2">
            <div className="p-5 bg-white">
                <h1 className="text-4xl font-mono font-bold text-center">&lt;TaskMaster /&gt;</h1>
            </div>

            <GroupManager
                onGroupsUpdated={setGroups}
                onHighlight={setHighlightedGroupID} // Pass group highlight handler
                highlightedGroupID={highlightedGroupID} // Highlighted group ID
                groupTotal={groupTotal}
            />

            <TabBar onSelectGroup={setSelectedGroup} />

            <TaskGroupTotaler groupTotal={groupTotal} />

            <TaskForm onTaskAdded={refreshTasks} />

            <TaskList
                refreshFlag={refreshFlag}
                highlightedTaskID={highlightedTaskID} // Pass highlighted task ID
                setHighlightedTaskID={setHighlightedTaskID} // Pass setter function
                setGroupTotal={setGroupTotal}
            />

        </div>
    );
};

export default App;
