import axios from 'axios';

const API_BASE_URL = 'https://jvv0skyaw1.execute-api.us-east-2.amazonaws.com/dev';

export const getTasks = async () => {
  const response = await axios.get(`${API_BASE_URL}/tasks`);
  return response.data.Items; // Ensure it returns an array of tasks
};
export const addTask = (task) => axios.post(`${API_BASE_URL}/tasks/add`, task );
export const deleteTask = (taskID) =>
    axios.delete(`${API_BASE_URL}/tasks/delete`, {
      data: { taskID },
      headers: {
        'Content-Type': 'application/json',
      },
    });