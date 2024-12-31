import React, { useEffect } from 'react';
import { getTasks } from '../services/api';
import TaskItem from './TaskItem';
import { useApp } from "../contexts/AppContext";

const TaskList = ({ refreshFlag, highlightedTaskID, setHighlightedTaskID, setGroupTotal }) => {
    const { tasks, setTasks, filteredTasks, setFilteredTasks, selectedGroup } = useApp();

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
    }, [setTasks, refreshFlag]); // Refetch tasks when refreshFlag changes

    useEffect(() => {
        // Filter tasks by selected group
        const filterTasks = selectedGroup
            ? tasks.filter((task) => task.groupID === selectedGroup.groupID)
            : tasks;
      
        setFilteredTasks(filterTasks); // From context
        setGroupTotal(filterTasks.length); // From prop or context
    }, [tasks, selectedGroup, setFilteredTasks, setGroupTotal]); // Re-run when filteredTasks changes

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