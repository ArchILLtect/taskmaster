import { useState } from 'react';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

const App = () => {
  const [refreshFlag, setRefreshFlag] = useState(false);

  const refreshTasks = () => setRefreshFlag((prev) => !prev);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center text-blue-500 mb-6">TaskMaster</h1>
      <TaskForm onTaskAdded={refreshTasks} />
      <TaskList refreshFlag={refreshFlag} />
    </div>
  );
};

export default App;
