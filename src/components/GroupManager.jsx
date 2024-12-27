import React, { useState } from 'react';
import { addGroup, deleteGroup } from '../services/groupService';

const GroupManager = ({ onGroupsUpdated, selectedGroup }) => {
    const [newGroupName, setNewGroupName] = useState('');

    const handleAddGroup = async () => {
        if (newGroupName) {
            try {
                const updatedGroups = await addGroup(newGroupName); // Add group via service
                onGroupsUpdated(updatedGroups); // Notify parent about updates
                setNewGroupName(''); // Clear input
            } catch (error) {
                console.error('Error adding group:', error);
            }
        }
    };

    const handleDeleteGroup = async (group) => {
        try {
            const updatedGroups = await deleteGroup(group); // Delete group via service
            onGroupsUpdated(updatedGroups); // Notify parent about updates
        } catch (error) {
        console.error('Error deleting group:', error);
        }
    };

  return (
    <div className="bg-gray-200">

        <div className="flex w-full justify-between px-4 pt-2">
            <div className="flex">
                <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="New Group Name"
                className="border rounded-md mr-2"
                />
                <button
                onClick={handleAddGroup}
                className="px-4 bg-blue-500 text-white rounded-md"
                >
                Add Group
                </button>
            </div>

            {/* Delete Group Button */}
            <button
                onClick={() => handleDeleteGroup(selectedGroup)}
                className="ml-2 px-4 bg-red-500 text-white rounded-md"
                >
                Delete Group
            </button>
        </div>
    </div>
  );
};

export default GroupManager;