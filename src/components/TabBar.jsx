import React from "react";

const TabBar = ({ groups, selectedGroup, onSelectGroup }) => {
    return (
      <div className="flex space-x-4 bg-gray-200 p-2 rounded-md shadow-md">
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => onSelectGroup(group)}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              selectedGroup === group
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {group}
          </button>
        ))}
      </div>
    );
  };

export default TabBar;