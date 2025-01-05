// API Helper for user info stuffs

//import User from "../models/User";


const API_BASE_URL = 'https://amxpsay0hd.execute-api.us-east-2.amazonaws.com/Dev';
//const AUTH0_DOMAIN = process.env.REACT_APP_AUTH0_DOMAIN;
//const AUTH0_USERS = 'http://' + AUTH0_DOMAIN + '/users'
const API_FILES = '/files';
const API_USERS = '/users/metadata'
const API_GENRERATE_URL = "/generate-upload-url"
//const TEMP_USERS = 'https://amxpsay0hd.execute-api.us-east-2.amazonaws.com/Dev/users/metadata'


export const getUploadUrl = async (fileName, fileType, token) => {
    const response = await fetch(
      API_BASE_URL + API_FILES + API_GENRERATE_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName,
          fileType,
          folderName: "profile-pics", // Ensure it matches the S3 folder name
        }),
      }
    );
  
    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }
  
    const data = await response.json();
    return data.uploadUrl;
  };


export const getUserInfo = async (token) => {
  try{
    const response = await fetch(
      API_BASE_URL + API_USERS,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      }
    );
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to get user info: ${errorMessage}`);
  }
    const data = await response.json();
    console.log(data)
    return data; // Return a User instance
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error; // Re-throw the error for the caller to handle
  }
};

export const updateUserInfo = async (user) => {
    const response = await fetch(`/api/users/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user.toJSON()), // Convert User instance to JSON
    });

    if (!response.ok) {
        throw new Error('Failed to update user info.');
    }

    return response.json();
};