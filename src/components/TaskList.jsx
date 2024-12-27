import React, { useEffect, useState } from 'react';
import { getTasks } from '../services/api';
import TaskItem from './TaskItem';

const TaskList = ({ selectedGroup, refreshFlag }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, [refreshFlag]); // Refetch tasks when the refreshFlag changes

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data.Items || []); // Ensure tasks array is set correctly
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const filteredTasks = selectedGroup
    ? tasks.filter((task) => task.group === selectedGroup)
    : tasks;

  return (
    <div className="space-y-2 bg-gray-200 divide-y shadow-lg rounded-md p-2">
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => <TaskItem key={task.taskID} task={task} />)
      ) : (
        <p>No tasks available.</p>
      )}
    </div>
  );
};

export default TaskList;