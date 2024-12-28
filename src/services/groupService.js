import axios from 'axios';

const API_URL = 'https://jvv0skyaw1.execute-api.us-east-2.amazonaws.com/dev/groups';
/*
export const fetchGroups = async () => {
  const response = await axios.get(API_URL);
  return response.data.map((item) => item.groupName); // Extract group names
};*/

export const fetchGroups = async () => {
  const response = await axios.get(API_URL);
  return response.data; // Return full objects (groupID and groupName)
};

export const addGroup = async (groupName) => {
  const response = await axios.post(API_URL, { groupName });
  return response.data.groups;
};

export const deleteGroup = async (groupID) => {
  const response = await axios.delete(API_URL, {
    data: { groupID }, // Send groupID directly
  });
  return response.data.groups;
};