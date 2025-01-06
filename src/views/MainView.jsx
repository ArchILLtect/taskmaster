import React, { useState } from 'react';
import '../App.css';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TabBar from '../components/TabBar';
import GroupManager from '../components/GroupManager';
import TaskGroupTotaler from '../components/TaskGroupTotaler';
import { useApp } from "../contexts/AppContext";
import AppSettingsDialog from '../components/AppSettingsDialog';
import Header from '../components/Header';
import { useSessionMonitor } from '../services/authHelper';
import SessionExpiredModal from '../components/SessionExpiredModal';
import useLoadGroups from '../hooks/useLoadGroups';
import ProfileModal from '../components/ProfileModal';

const MainView = () => {
    const { setGroups, selectedGroup, setSelectedGroup, setRefreshFlag, refreshFlag, currentUser, setShowProfile, showProfile } = useApp();
    const { isSessionExpired, reauthenticate } = useSessionMonitor();
    const [highlightedTaskID, setHighlightedTaskID] = useState(null); // Track highlighted task
    const [highlightedGroupID, setHighlightedGroupID] = useState(null); // Track highlighted group
    const [groupTotal, setGroupTotal] = useState(null);
    const [showAppSettingsDialog, setShowAppSettingsDialog] = useState();
    const [showTaskFormDialog, setShowTaskFormDialog] = useState();
    const [isLoading, setIsLoading] = useState(true);

    useLoadGroups(setGroups, setSelectedGroup, setIsLoading);


    const refreshTasks = () => {
        setRefreshFlag((prev) => !prev); // Toggle refreshFlag to trigger updates in TaskList
    };

    return (
        <div className="sm:p-10 mx-auto bg-gray-100 dark:bg-gray-900 w-full sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 2xl:w-1/2">
            {isSessionExpired && (
                <SessionExpiredModal
                    onLogin={reauthenticate}
                    onClose={() => console.log("User dismissed the modal")} // Optional
                />
            )}

            <Header onSettingsOpen={setShowAppSettingsDialog} />

            <GroupManager
                onGroupsUpdated={setGroups}
                onHighlight={setHighlightedGroupID} // Pass group highlight handler
                highlightedGroupID={highlightedGroupID} // Highlighted group ID
                groupTotal={groupTotal}
            />

            <TabBar
                onSelectGroup={setSelectedGroup}
                isLoading={isLoading}
            />

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

            {/* My Profile Dialog */}
            {showProfile && (
                <ProfileModal
                    onClose={() => {
                        setShowProfile(false);
                        //onHighlight(null);
                    }}
                    user={currentUser}                    
                />
            )}
        </div>
    );
};

export default MainView;