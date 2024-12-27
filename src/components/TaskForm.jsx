import React, { useState } from 'react';
import { addTask } from '../services/api';

const TaskForm = ({ onTaskAdded }) => {
  const [taskName, setTaskName] = useState('');
  const [group, setGroup] = useState('General');

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask({ taskName, group })
      .then(() => {
        setTaskName('');
        onTaskAdded(); // Trigger refresh after adding
      })
      .catch((error) => console.error('Error adding task:', error));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-start space-y-4 bg-white p-4 rounded-md shadow-md"
    >
      <input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="Task name"
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <select
        value={group}
        onChange={(e) => setGroup(e.target.value)}
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="General">General</option>
        <option value="School">School</option>
        <option value="Home">Home</option>
        <option value="X-mas Shopping">X-mas Shopping</option>
      </select>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
      >
        Add Task
      </button>
    </form>
  );
};

export default TaskForm;