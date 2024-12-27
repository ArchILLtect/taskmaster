import React from 'react';
import { deleteTask } from '../services/api';

const TaskItem = ({ task, onTaskDeleted }) => {
  const handleDelete = () => {
    console.log(task.taskID)
    deleteTask(task.taskID)
      .then(() => {
        alert('Task deleted successfully');
        onTaskDeleted(); // Notify parent component to refresh tasks
      })
      .catch((error) => console.error('Error deleting task:', error));
  };

  return (
    <div>
      <p>{task.taskName}</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default TaskItem;