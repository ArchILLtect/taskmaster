import axios from 'axios';

const API_BASE_URL = 'https://jvv0skyaw1.execute-api.us-east-2.amazonaws.com/dev';

// TODO: Add arg userId and add to header??
// TODO: Update Lambda function to get tasks by userId if userId included or how it is if not.
export const getTasks = async () => {
  const response = await axios.get(`${API_BASE_URL}/tasks`);
  return response.data.Items; // Ensure it returns an array of tasks
};

// TODO: Add arg userId and add to header??
// TODO: Update Lambda function to add tasks by userId if userId included or how it is if not.
export const addTask = (task) => axios.post(`${API_BASE_URL}/tasks/add`, task );

// TODO: Does it even need userId??
export const deleteTask = (taskID) =>
    axios.delete(`${API_BASE_URL}/tasks/delete`, {
      data: { taskID },
      headers: {
        'Content-Type': 'application/json',
      },
    });

// TODO: Does it even need userId??
export const reassignTasksToGroup = async (fromGroupID, toGroupID) => {
  try {
    // Make the API call to the PATCH endpoint
    const response = await axios.patch(`${API_BASE_URL}/tasks/reAssign`, {
      fromGroupID,
      toGroupID,
    });
    // Return success response
    return response.data;
  } catch (error) {
    console.error('Error reassigning tasks:', error);
    throw error; // Rethrow error to be handled by the calling code
  }
};

// TODO: Does it even need userId??
export const deleteTasksByGroup = async (groupID) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/tasks/deleteByGroup`, {
      data: { groupID }, // Axios allows sending a body with DELETE requests
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting tasks by group:", error);
    throw error;
  }
};