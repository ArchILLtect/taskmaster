import React, { useState } from 'react';
import { addTask } from '../services/api';

const TaskForm = ({ selectedGroup, onTaskAdded }) => {
  const [taskName, setTaskName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTask({ taskName, group: selectedGroup.groupName });
      setTaskName(''); // Clear the input field
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