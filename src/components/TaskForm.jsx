import React, { useState } from 'react';
import { addTask } from '../services/api';
import { useApp } from "../contexts/AppContext";

const TaskForm = ({ onTaskAdded }) => {
    const { selectedGroup } = useApp();
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskStatus, setTaskStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addTask({ taskName, groupID: selectedGroup.groupID, taskDescription: taskDescription, taskStatus: taskStatus });
            setTaskName(''); // Clear the input field
            setTaskDescription(''); // Clear the input field
            setTaskStatus(''); // Clear the input field
            onTaskAdded(); // Notify parent to refresh tasks
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    return (
        <div className="flex justify-center bg-gray-100 pt-4 pb-1 rounded-md mt-6">
            <form onSubmit={handleSubmit} className="task-form">
                <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Enter task name"
                    required
                    className="p-2 border rounded-md"
                />
                <input
                    type="text"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Enter task description"
                    required
                    className="p-2 border rounded-md"
                />
                <input
                    type="text"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    placeholder="Enter task status"
                    required
                    className="p-2 border rounded-md"
                />
                <button
                    type="submit"
                    className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md"
                    disabled={!selectedGroup}
                >
                    Add Task
                </button>
            </form>
        </div>
    );
};

export default TaskForm;