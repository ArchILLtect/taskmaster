import { useState } from 'react';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TabBar from './components/TabBar';

const App = () => {
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [refreshFlag, setRefreshFlag] = useState(false); // Refresh trigger

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
  };

  const handleTaskUpdate = () => {
    setRefreshFlag((prev) => !prev); // Toggle the flag to refresh
  };

  const groups = ['All', 'School', 'Home', 'X-mas Shopping']; // Example groups

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">TaskMaster</h1>
      <TabBar groups={groups} selectedGroup={selectedGroup} onSelectGroup={handleSelectGroup} />
      <TaskForm onTaskAdded={handleTaskUpdate} />
      <TaskList group={selectedGroup} refreshFlag={refreshFlag} />
    </div>
  );
};

export default App;
