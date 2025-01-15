import axios from 'axios';

const API_URL = 'https://jvv0skyaw1.execute-api.us-east-2.amazonaws.com/dev/groups';
const DEFAULT_GRP_ID = '1735400111111';

export const fetchGroups = async () => {
  const response = await axios.get(API_URL);
  return response.data; // Return full objects (groupID and groupName)
};

// TODO: Add arg userId and add to header??
// TODO: Update Lambda function to add groups by userId if userId included or how it is if not.
export const addGroup = async (groupName) => {
  try {
    const response = await axios.post(API_URL, {
      groupName,
      groupID: groupName.toLowerCase() === 'general' ? DEFAULT_GRP_ID : undefined,
    });
    return response.data.groups; // Return the updated groups list
  } catch (err) {
    console.error("Error adding group:", err.response?.data?.error || err.message);
    throw new Error(err.response?.data?.error || 'An error occurred while adding the group.');
  }
};

// TODO: Add arg userId and add to header??
// TODO: Update Lambda function to rename groups by userId if userId included or how it is if not.
export const renameGroup = async (groupNewName, groupID) => {
  if (!groupID || !groupNewName) {
    throw new Error('Both groupID and groupNewName are required to rename a group.');
  }

  try {
    const response = await axios.put(API_URL, {
      groupID,
      groupNewName
    });

    return response.data.groups; // Return the updated groups list
  } catch (err) {
    console.error("Error renaming group:", err.response?.data?.error || err.message);
    throw new Error(err.response?.data?.error || 'An error occurred while renaming the group.');
  }
};

// TODO: Add arg userId and add to header??
// TODO: Update Lambda function to delete groups by userId if userId included or how it is if not.
export const deleteGroup = async (groupID) => {
  const response = await axios.delete(API_URL, {
    data: { groupID },
  });
  return response.data.groups;
};