import React, { useEffect, useState } from 'react';
import { getTasks } from '../services/api';
import TaskItem from './TaskItem';

const TaskList = ({ selectedGroup, refreshFlag, highlightedTaskID, setHighlightedTaskID }) => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks when the component loads or when refreshFlag changes
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks); // Update the tasks state
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

  // Handle task deletion
  const handleTaskDeleted = (deletedTaskID) => {
    // Remove the deleted task from the tasks state
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.taskID !== deletedTaskID)
    );
  };

  return (
    <div className="space-y-2 bg-gray-200 divide-y shadow-lg rounded-md p-2">
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => (
          <TaskItem
            key={task.taskID}
            task={task}
            isHighlighted={highlightedTaskID === task.taskID} // Pass whether the task is highlighted
            onTaskDeleted={handleTaskDeleted}
            onHighlight={setHighlightedTaskID} // Pass function to highlight
          />
        ))
      ) : (
        <p>No tasks available.</p>
      )}
    </div>
  );
};

export default TaskList;