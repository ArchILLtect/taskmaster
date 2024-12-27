import React from 'react';
import { deleteTask } from '../services/api';

const TaskItem = ({ task, onTaskDeleted }) => {
  const handleDelete = () => {
    deleteTask(task.taskID)
      .then(() => onTaskDeleted())
      .catch((error) => console.error('Error deleting task:', error));
  };

  return (
    <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md shadow-md mb-2">
      <span className="text-gray-800">{task.taskName}</span>
      <button
        onClick={handleDelete}
        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Delete
      </button>
    </div>
  );
};

export default TaskItem;