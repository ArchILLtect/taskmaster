import React, { useState } from 'react';
import { addTask } from '../services/api';

const TaskForm = ({ onTaskAdded }) => {
  const [taskName, setTaskName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask({ taskName })
      .then(() => {
        alert('Task added successfully');
        onTaskAdded(); // Notify parent component to update tasks
        setTaskName(''); // Clear the input field
      })
      .catch((error) => console.error('Error adding task:', error));
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-center mb-6">
      <input
        type="text"
        placeholder="Enter task name"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        required
        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Task
      </button>
    </form>
  );
};

export default TaskForm;