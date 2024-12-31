import React, { useState } from 'react';
import { deleteTask } from '../services/api';

const TaskItem = ({ task, onTaskDeleted, onHighlight, isHighlighted }) => {
    const [showDialog, setShowDialog] = useState(false);
  
    const handleDeleteTask = async () => {
        try {
            await deleteTask(task.taskID);
            onTaskDeleted(task.taskID);
        } catch (error) {
            console.error('Error deleting task:', error);
        } finally {
            setShowDialog(false);
            onHighlight(null)
        }
    };
  
    return (
        <div
            className={`flex flex-col sm:flex-row justify-between items-center bg-white shadow-md p-2 rounded-md ${
                isHighlighted ? 'bg-red-100' : ''
            }`}
        >
            <div className="flex flex-col sm:flex-row gap-3 w-full">
                <span className="w-full sm:w-48 whitespace-nowrap overflow-hidden text-ellipsis">{task.taskName}</span>
                <p className="w-full">{task.taskDescription}</p>
            </div>
            <div className="flex gap-3">
                <span className="w-20 text-center">{task.taskStatus}</span>
                <button
                    onClick={() => {
                        setShowDialog(true);
                        onHighlight(task.taskID); // Notify App.js of the task to highlight
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
                >
                    Delete
                </button>
            </div>

      
            {showDialog && (
                <div className="fixed inset-0 -top-[500px] bg-black bg-opacity-50 flex items-center z-50 justify-center">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-lg font-bold mb-3">Confirm Deletion</h2>
                        <p>Are you sure you want to delete this task?</p>
                        <p className="p-3 text-lg font-mono font-bold">&gt; {task.taskName}</p>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => {
                                    setShowDialog(false);
                                    onHighlight(null); // Reset highlight
                                }}
                                className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTask}
                                className="px-4 py-2 bg-red-500 text-white rounded-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
  
export default TaskItem;