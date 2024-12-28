import React, { useState } from 'react';
import { addGroup, deleteGroup, fetchGroups } from '../services/groupService';

const GroupManager = ({ onGroupsUpdated, selectedGroup }) => {
    const [newGroupName, setNewGroupName] = useState('');

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
        try {
          const updatedGroups = await deleteGroup(group.groupID); // Use groupID
          onGroupsUpdated(updatedGroups); // Notify parent about updates
        } catch (error) {
          console.error('Error deleting group:', error);
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
                onClick={() => handleDeleteGroup(selectedGroup)}
                className="ml-2 px-4 bg-red-400 text-white rounded-md max-w-fit"
                >
                Delete Group
            </button>
        </div>
    </div>
  );
};

export default GroupManager;