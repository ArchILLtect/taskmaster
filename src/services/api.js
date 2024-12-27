import axios from 'axios';

const API_BASE_URL = 'https://jvv0skyaw1.execute-api.us-east-2.amazonaws.com/dev';

export const getTasks = () => axios.get(`${API_BASE_URL}/tasks`);
export const addTask = (task) => axios.post(`${API_BASE_URL}/tasks/add`, task );
export const deleteTask = (taskID) =>
    axios.delete(`${API_BASE_URL}/tasks/delete`, {
      data: { taskID },
      headers: {
        'Content-Type': 'application/json',
      },
    });