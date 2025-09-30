import React, { useState } from 'react';
import { addTask } from '../services/api';
import { useApp } from "../contexts/AppContext";

const TaskForm = ({ onClose, onTaskAdded }) => {
    const { selectedGroup } = useApp();
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskDueDate, setTaskDueDate] = useState('');
    const [taskPriority, setTaskPriority] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addTask({
                taskName,
                groupID: selectedGroup.groupID,
                taskDescription: taskDescription,
                taskDueDate: taskDueDate,
                taskStatus: 'pending',
                taskPriority: taskPriority
            });
            setTaskName(''); // Clear the input field
            setTaskDescription(''); // Clear the input field
            setTaskDueDate(''); // Clear the input field
        } catch (error) {
            console.error('Error adding task:', error);
        } finally {
            onTaskAdded(); // Notify parent to refresh tasks
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded shadow-md w-fit">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Create Task</h2>
                <form onSubmit={handleSubmit} className="task-form gap-2 flex flex-col">
                    <label className="flex gap-20 items-center justify-start"><p className="text-gray-800 dark:text-gray-200 w-24">Name: </p>
                        <input
                            id="taskName"
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            placeholder="Enter task name"
                            required
                            className="p-2 border rounded-md"
                        />
                    </label>
                    <label className="flex gap-20 items-center justify-start"><p className="text-gray-800 dark:text-gray-200 w-24">Description: </p>
                        <input
                            id="taskDescription"
                            type="text"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            placeholder="Enter task description"
                            className="p-2 border rounded-md"
                        />
                    </label>
                    <label className="flex gap-20 items-center justify-start"><p className="text-gray-800 dark:text-gray-200 w-24">Due Date: </p>
                        <input
                            id="taskDueDate"
                            type="date"
                            value={taskDueDate}
                            onChange={(e) => setTaskDueDate(e.target.value)}
                            placeholder="Enter task due date"
                            className="p-2 border rounded-md"
                        />
                    </label>
                    <label className="flex gap-20 items-center justify-start"><p className="text-gray-800 dark:text-gray-200 w-24">Priority: </p>
                        <select
                            id="taskPriority"
                            value={taskPriority}
                            onChange={(e) => setTaskPriority(e.target.value)}
                            className="p-2 border rounded dark:text-gray-800 font-bold"
                        >
                            <option key={"lowest"} value={"1"}>
                                Lowest
                            </option>
                            <option key={"low"} value={"2"}>
                                Low
                            </option>
                            <option defaultChecked key={"medium"} value={"3"}>
                                Medium
                            </option>
                            <option key={"high"} value={"4"}>
                                High
                            </option>
                            <option key={"highest"} value={"5"}>
                                Highest
                            </option>
                        </select>
                    </label>
                    <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-2 px-4 py-2 bg-gray-500 text-gray-200 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-green-500 text-white rounded-md"
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default TaskForm;