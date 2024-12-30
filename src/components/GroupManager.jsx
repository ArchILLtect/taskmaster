import React, { useState } from 'react';
import { addGroup, deleteGroup, fetchGroups } from '../services/groupService';

const GroupManager = ({ onGroupsUpdated, selectedGroup, onHighlight, highlightedGroupID }) => {
    const [newGroupName, setNewGroupName] = useState('');
    const [showDialog, setShowDialog] = useState(false);

    const handleAddGroup = async () => {
        if (newGroupName) {
            try {
                await addGroup(newGroupName); // Add group via service
                const updatedGroups = await fetchGroups(); // Fetch updated groups
                onGroupsUpdated(updatedGroups); // Notify parent about updates
                setNewGroupName(''); // Clear input
            } catch (error) {
                console.error('Error adding group:', error);
            }
        }
    };
    
    const handleDeleteGroup = async (group) => {
        if (group.groupName === 'General') {
            alert('The "General" group cannot be deleted.');
            setShowDialog(false);
            return;
        }
        
        try {
            onHighlight(group.groupID); // Highlight group being deleted
            const updatedGroups = await deleteGroup(group.groupID); // Use groupID
            onGroupsUpdated(updatedGroups); // Notify parent about updates
        } catch (error) {
            console.error('Error deleting group:', error);
        } finally {
            setShowDialog(false); // Close dialog after action
            onHighlight(null)
        }
    };

  return (
    <div className="bg-gray-300 rounded-t-lg shadow-md">
        <div className="flex flex-col sm:flex-row w-full gap-1 items-center sm:justify-between sm:px-8 py-1">
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

            {/* Delete Group Button */}
            <button
                onClick={() => setShowDialog(true)}
                className={`ml-2 px-4 rounded-md max-w-fit ${
                    selectedGroup?.groupID === highlightedGroupID
                    ? 'bg-yellow-200' // Highlighted group styling
                    : selectedGroup?.groupName === 'General'
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-red-400 text-white'
                }`}
                disabled={
                    !selectedGroup || selectedGroup.groupName === 'General'
                }
            >
                Delete Group
            </button>

            {/* Warning Dialog */}
            {showDialog && selectedGroup && ( // Ensure selectedGroup exists
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
                        <p>Are you sure you want to delete the group <strong>{selectedGroup.groupName}</strong>?</p>
                        <p className="mt-3 font-bold text-md text-red-800">*All tasks associated with this group will also be deleted.*</p>
                        <div className="flex justify-end mt-4">
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
            </div>
    </div>
  );
};

export default GroupManager;