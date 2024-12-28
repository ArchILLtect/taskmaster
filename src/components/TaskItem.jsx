import React from 'react';
import { deleteTask } from '../services/api';

const TaskItem = ({ task, onTaskDeleted }) => {

  const handleDelete = async () => {
    try {
      await deleteTask(task.taskID); // Your API call to delete the task
      onTaskDeleted(); // Notify parent about task deletion
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="flex justify-between items-center bg-white shadow-md p-2 rounded-md">
      <span>{task.taskName}</span>
      <button
        onClick={handleDelete}
        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
      >
        Delete
      </button>
    </div>
  );
};

export default TaskItem;