import React from 'react';
import { useApp } from "../contexts/AppContext";

const TaskGroupTotaler = ({ groupTotal }) => {
    const { selectedGroup } = useApp();
    return (
        <div className="pl-8 border-t-2 border-gray-400 bg-gray-300 rounded-b-lg shadow-md">
            <span className="font-bold">{selectedGroup?.groupName}</span> has <span>{groupTotal ? groupTotal : '0'}</span> task{groupTotal > 1 ? "s" : ""}.
        </div>
    )
};

export default TaskGroupTotaler;