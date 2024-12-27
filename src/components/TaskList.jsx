import React, { useEffect, useState } from 'react';
import { getTasks } from '../services/api';
import { deleteTask } from '../services/api';

const TaskList = ({ group, refreshFlag }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getTasks()
      .then((response) => {
        const allTasks = response.data.Items;
        setTasks(group === 'All' ? allTasks : allTasks.filter((task) => task.group === group));
      })
      .catch((error) => console.error('Error fetching tasks:', error));
  }, [group, refreshFlag]); // Refresh when group or refreshFlag changes

  return (
    <div className="mt-4">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <div
            key={task.taskID}
            className="flex justify-between items-center p-4 mb-2 bg-gray-100 rounded-md shadow-sm"
          >
            <span className="text-gray-700">{task.taskName}</span>
            <button
              onClick={() => deleteTask(task.taskID).then(() => setTasks((prev) => prev.filter((t) => t.taskID !== task.taskID)))}
              className="px-3 py-1 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No tasks available in this group.</p>
      )}
    </div>
  );
};

export default TaskList;