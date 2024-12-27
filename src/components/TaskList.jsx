import React, { useEffect, useState } from 'react';
import { getTasks } from '../services/api';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  const fetchTasks = () => {
    getTasks()
      .then((response) => {
        setTasks(response.data.Items);
        setError('');
      })
      .catch((error) => setError('Failed to fetch tasks. Please try again.'));
  };

  useEffect(() => {
    fetchTasks(); // Initial fetch
  }, []);

  return (
    <div>
      <h2>Your Tasks</h2>
      {error && <p sytle={{ color: "red" }}>{error}</p>}
      <TaskForm onTaskAdded={fetchTasks} /> {/* Notify parent to refresh */}
      {tasks && tasks.length > 0 ? (
        tasks.map((task) => <TaskItem key={task.taskID} task={task} onTaskDeleted={fetchTasks} />)
      ) : (
        !error && <p>No tasks available.</p>
      )}
    </div>
  );
};

export default TaskList;