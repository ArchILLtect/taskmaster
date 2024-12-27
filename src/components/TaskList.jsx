import React, { useEffect, useState } from 'react';
import { getTasks } from '../services/api';
import TaskItem from './TaskItem';

const TaskList = ({ refreshFlag }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getTasks()
      .then((response) => setTasks(response.data.Items))
      .catch((error) => console.error('Error fetching tasks:', error));
  }, [refreshFlag]);

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Tasks</h2>
      {tasks && tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskItem key={task.taskID} task={task} onTaskDeleted={refreshFlag} />
        ))
      ) : (
        <p className="text-gray-600">No tasks available.</p>
      )}
    </div>
  );
};

export default TaskList;