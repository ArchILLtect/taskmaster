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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter task name"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        required
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;