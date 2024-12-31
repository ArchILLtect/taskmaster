import React, { useState } from 'react';
import { addGroup, deleteGroup, renameGroup } from '../services/groupService';
import { reassignTasksToGroup, deleteTasksByGroup } from '../services/api';
import { useApp } from "../contexts/AppContext";
import RenameGroupDialog from './RenameGroupDialog';

const GroupManager = ({ onGroupsUpdated, onHighlight, highlightedGroupID, groupTotal }) => {
    const { filteredTasks, groups, groupNewName, selectedGroup } = useApp();
    const [newGroupName, setNewGroupName] = useState('');
    const [showRenameGrpDialog, setShowRenameGrpDialog] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showReassignDialog, setShowReassignDialog] = useState(false);
    const [deleteOption, setDeleteOption] = useState("");
    const [reassignGroup, setReassignGroup] = useState("1735400111111"); // Initially, no group selected

    const handleAddGroup = async () => {

        let updatedGroups;
        if (newGroupName) {
            try {
                updatedGroups = await addGroup(newGroupName); // Add group via service
                onGroupsUpdated(updatedGroups); // Notify parent about updates
                setNewGroupName(''); // Clear input
            } catch (error) {
                console.error('Error adding group:', error);
            }
        }
    };

    const handleRenameGroup = async (groupNewName, groupID) => {

        let updatedGroups;
        if (!groupNewName.trim()) {
            alert("Group name cannot be empty.");
            return;
        }
    
        if (groups.some((group) => group.groupName.toLowerCase() === groupNewName.toLowerCase())) {
            alert("A group with this name already exists.");
            return;
        }

        if (selectedGroup.groupID === '1735400111111') {
            alert('The "General" group cannot be renamed.');
            setShowRenameGrpDialog(false);
            return;
        }

        if (groupNewName) {
            try {
                updatedGroups = await renameGroup(groupNewName, groupID); // Add group via service
                setNewGroupName(''); // Clear input
            } catch (error) {
                console.error('Error adding group:', error);
            }
        }
        onGroupsUpdated(updatedGroups); // Notify parent about updates
        setShowRenameGrpDialog(false);
        onHighlight(null);
    };

    const handleDeleteGroup = async (group) => {

        let response;
        let updatedGroups;
        if (group.groupID === '1735400111111') {
            alert('The "General" group cannot be deleted.');
            setShowDialog(false);
            return;
        }

        if (deleteOption === "deleteAll") {

            try {
                // Delete group and its tasks
                updatedGroups = await deleteGroup(group.groupID); // Use groupID
                response = deleteTasksByGroup(group.groupID); // API function to delete group and tasks
            } catch (error) {
                console.error('Error deleting group:', error);
            } finally {
                setShowDialog(false); // Close dialog
                console.log('All tasks deleted successfully:', response);
            }
        } else if (deleteOption === "reassign") {
            if (!reassignGroup) {
                alert("Please select a group to reassign tasks.");
                return; // Prevent proceeding without a selection
            }
            try {
                await reassignTasksToGroup(group.groupID, reassignGroup); // API call to reassign tasks = (FROM GROUP, TO GROUP)
                response = await deleteGroup(group.groupID); // Delete the original group
            } catch (error) {
                console.error("Error reassigning tasks:", error);
            } finally {
                setShowDialog(false); // Close the dialog
                console.log('Tasks reassigned successfully:', response);
            }
        } else {
            try {
                updatedGroups = await deleteGroup(group.groupID); // Delete the original group
            } catch (error) {
                console.error("Error deleting group:", error);
            } finally {
                setShowDialog(false); // Close the dialog
                console.log('Group deleted successfully:', updatedGroups);
            }
        }
        setDeleteOption("");
        onGroupsUpdated(updatedGroups); // Refresh groups
        onHighlight(null)
    };

  return (
    <div className="bg-gray-300 rounded-t-lg shadow-md">
        <div className="flex flex-col sm:flex-row w-full gap-1 items-center sm:justify-between sm:px-8 py-1">
            {/* Add Group Input/Button */}
            <div className="flex">
                <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="New Group Name"
                className="border rounded-md mr-2 placeholder:pl-2 pl-2"
                />
                <button
                onClick={handleAddGroup}
                className="px-4 bg-blue-400 text-white rounded-md"
                >
                Add Group
                </button>
            </div>
            {/* Rename Group Button */}
            <button
                onClick={() => {
                    setShowRenameGrpDialog(true);
                    onHighlight(selectedGroup.groupID) // Highlight group being deleted
                }}
                className={`ml-2 px-4 rounded-md max-w-fit ${
                    selectedGroup?.groupID === highlightedGroupID
                    ? 'bg-yellow-200' // Highlighted group styling
                    : selectedGroup?.groupID === '1735400111111'
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-400 text-white'
                }`}
                disabled={
                    !selectedGroup || selectedGroup.groupID === '1735400111111'
                }
            >
                Rename Group
            </button>
            {/* Delete Group Button */}
            <button
                onClick={() => {
                    setShowDialog(true);
                    onHighlight(selectedGroup.groupID) // Highlight group being deleted
                }}
                className={`ml-2 px-4 rounded-md max-w-fit ${
                    selectedGroup?.groupID === highlightedGroupID
                    ? 'bg-yellow-200' // Highlighted group styling
                    : selectedGroup?.groupID === '1735400111111'
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-red-400 text-white'
                }`}
                disabled={
                    !selectedGroup || selectedGroup.groupID === '1735400111111'
                }
            >
                Delete Group
            </button>
            {/* Rename Confirm Dialog */}
            {showRenameGrpDialog && (
                <RenameGroupDialog
                    onClose={() => {
                        setShowRenameGrpDialog(false);
                        onHighlight(null);
                    }}
                    onRename={() => handleRenameGroup(groupNewName, selectedGroup.groupID)}
                />
            )}

            {/* Delete Confirm Dialog */}
            {showDialog && selectedGroup && ( // Ensure selectedGroup exists
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-md w-5/12">
                        <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
                        <p>You are about to delete the group <strong>{selectedGroup.groupName}</strong>?</p>
                        {groupTotal > 0 &&
                            <>
                                <p className="mt-4">What do you want to do with the tasks from this group?</p>
                                <div className="flex flex-col mt-2">
                                    <label>
                                        <input
                                            type="radio"
                                            name="deleteOption"
                                            value="deleteAll"
                                            checked={deleteOption === "deleteAll"}
                                            onChange={() => setDeleteOption("deleteAll")}
                                        />
                                        <span className="pl-3">Delete group and all tasks</span>
                                    </label>
                                    <label className="flex mt-2 gap-3">
                                        <input
                                            type="radio"
                                            name="deleteOption"
                                            value="reassign"
                                            checked={deleteOption === "reassign"}
                                            onChange={() => setDeleteOption("reassign")}
                                        />
                                        <p>
                                            Reassign tasks to{" "}
                                            <span className="font-bold">
                                                {groups && groups.find((group) => group.groupID === reassignGroup)?.groupName}
                                            </span>{" "}
                                            group
                                        </p>
                                        <button
                                            onClick={() => setShowReassignDialog(true)}
                                            className="px-4 bg-blue-400 text-white rounded-md"
                                        >
                                        Change
                                        </button>
                                    </label>
                                </div>
                            </>
                        }
                        {groupTotal > 0 && deleteOption === "deleteAll" &&
                            <p className="m-2 font-bold text-md text-red-800">*All tasks associated with this group will also be deleted.*</p>
                        }
                        <div className="flex justify-end mt-12">
                            <button
                                onClick={() => {
                                    setShowDialog(false) // Close dialog
                                    onHighlight(null); // Reset highlight
                                }}
                                className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteGroup(selectedGroup)} // Confirm deletion
                                className="px-4 py-2 bg-red-500 text-white rounded-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showReassignDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-lg font-bold mb-4">Confirm Task Target</h2>
                        <p>Which group should these tasks be moved to?</p>
                        {filteredTasks.map((task) => (
                            <p key={task.taskID}>{task.taskName}</p>
                        ))}
                        <select
                            value={reassignGroup}
                            onChange={(e) => setReassignGroup(e.target.value)}
                            className="mt-2 p-2 border rounded"
                        >
                            {groups.map((group) => (
                                group !== selectedGroup && (
                                    <option key={group.groupID} value={group.groupID}>
                                        {group.groupName}
                                    </option>
                                )
                            ))}
                        </select>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => {
                                    setReassignGroup('1735400111111');
                                    setShowReassignDialog(false); // Close dialog
                                }}
                                className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowReassignDialog(false); // Close dialog
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded-md"
                            >
                                Confirm
                            </button>
                        </div>

                    </div>
                </div>
            )}
            </div>
    </div>
  );
};

export default GroupManager;