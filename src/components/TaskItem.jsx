import React, { useState } from 'react';
import { deleteTask } from '../services/api';

const TaskItem = ({ task, onTaskDeleted }) => {
    const [showDialog, setShowDialog] = useState(false);

    const handleDeleteTask = async () => {
        try {
            await deleteTask(task.taskID); // Your API call to delete the task
            onTaskDeleted(task.taskID); // Notify parent about task deletion
        } catch (error) {
            console.error('Error deleting task:', error);
        } finally {
            setShowDialog(false); // Close dialog after action
    }
    };

    return (
        <div
            className={`flex justify-between items-center bg-white shadow-md p-2 rounded-md ${
                showDialog ? 'relative z-50' : ''
            }`}
        >
            <span>{task.taskName}</span>
            <button
                onClick={() => setShowDialog(true)}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
            >
                Delete
            </button>

            {/* Warning Dialog */}
            {showDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
                        <p>Are you sure you want to delete this task?</p>
                        <div className="flex justify-end mt-4">
                        <button
                            onClick={() => setShowDialog(false)} // Close dialog
                            className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteTask} // Confirm deletion
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