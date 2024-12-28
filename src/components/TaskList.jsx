import React, { useEffect, useState } from 'react';
import { getTasks } from '../services/api';
import TaskItem from './TaskItem';

const TaskList = ({ selectedGroup, refreshFlag }) => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks when the component loads or when refreshFlag changes
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks); // Update the tasks state
        console.log('Tasks:', fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [refreshFlag]); // Refetch tasks when refreshFlag changes

  // Filter tasks by selected group
  const filteredTasks = selectedGroup
    ? tasks.filter((task) => task.group === selectedGroup.groupName)
    : tasks;

  return (
    <div className="space-y-2 bg-gray-200 divide-y shadow-lg rounded-md p-2">
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => (
          <TaskItem key={task.taskID} task={task} />
        ))
      ) : (
        <p>No tasks available.</p>
      )}
    </div>
  );
};

export default TaskList;