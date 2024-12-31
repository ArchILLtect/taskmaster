import React, { useState, useEffect } from 'react';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TabBar from './components/TabBar';
import GroupManager from './components/GroupManager';
import { addGroup, fetchGroups } from './services/groupService';
import TaskGroupTotaler from './components/TaskGroupTotaler';
import { useApp } from "./contexts/AppContext";
import AppSettingsDialog from './components/AppSettingsDialog';

const App = () => {
    const { setGroups, selectedGroup, setSelectedGroup } = useApp();
    const [refreshFlag, setRefreshFlag] = useState(false); // Track refresh triggers
    const [highlightedTaskID, setHighlightedTaskID] = useState(null); // Track highlighted task
    const [highlightedGroupID, setHighlightedGroupID] = useState(null); // Track highlighted group
    const [groupTotal, setGroupTotal] = useState(null);
    const [showAppSettingsDialog, setShowAppSettingsDialog] = useState();
    const [showTaskFormDialog, setShowTaskFormDialog] = useState();

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
        <div className="sm:p-10 mx-auto bg-gray-100 dark:bg-gray-900 w-full sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 2xl:w-1/2">
            <div className="flex justify-between p-5 bg-white dark:bg-gray-600">
                <div className="w-full text-center">
                    <h1 className="text-4xl font-mono font-bold dark:text-white text-center">&lt;TaskMaster /&gt;</h1>
                </div>
                <button
                    onClick={() => setShowAppSettingsDialog(true)}
                    className="px-4 bg-blue-400 text-white text-nowrap rounded-md"
                >
                    . . .
                </button>
            </div>

            <GroupManager
                onGroupsUpdated={setGroups}
                onHighlight={setHighlightedGroupID} // Pass group highlight handler
                highlightedGroupID={highlightedGroupID} // Highlighted group ID
                groupTotal={groupTotal}
            />

            <TabBar onSelectGroup={setSelectedGroup} />

            <TaskGroupTotaler groupTotal={groupTotal} />

            <div className="flex justify-center bg-gray-100 dark:bg-gray-800 pt-4 pb-1 rounded-md mt-6">
                <button
                    onClick={() => setShowTaskFormDialog(true)}
                    className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md"
                    disabled={!selectedGroup}
                >
                    Add Task
                </button>
            </div>

            <TaskList
                refreshFlag={refreshFlag}
                highlightedTaskID={highlightedTaskID} // Pass highlighted task ID
                setHighlightedTaskID={setHighlightedTaskID} // Pass setter function
                setGroupTotal={setGroupTotal}
            />

            {/* Task Form Dialog */}
            {showTaskFormDialog && (
                <TaskForm
                    onClose={() => {
                        setShowTaskFormDialog(false);
                        //onHighlight(null);
                    }}
                    onTaskAdded={refreshTasks}
                />
            )}

            {/* App Settings Dialog */}
            {showAppSettingsDialog && (
                <AppSettingsDialog
                    onClose={() => {
                        setShowAppSettingsDialog(false);
                        //onHighlight(null);
                    }}
                />
            )}

        </div>
    );
};

export default App;
