// API Helper for user info stuffs

const API_BASE_URL = 'https://amxpsay0hd.execute-api.us-east-2.amazonaws.com/Dev';
const API_FILES = '/files';
const API_GENRERATE_URL = "/generate-upload-url"

export const getUploadUrl = async (fileName, fileType, token) => {
  try {
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

      // Check if response is not ok
      if (!response.ok) {
          const errorData = await response.json(); // Parse the response body
          throw new Error(errorData.message || "Failed to get upload URL");
      }

      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Error in getUploadUrl:", error);
      throw error; // Re-throw the error for the caller
  }
};

export const getUserPictures = async (userId) => {

  const encodedUserId = encodeURIComponent(userId);
  //console.log(`${API_BASE_URL}/users/${encodedUserId}/pictures`)

  try {
    const response = await fetch(`https://amxpsay0hd.execute-api.us-east-2.amazonaws.com/Dev/users/${encodedUserId}/pictures`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user pictures.");
    }

    const pictures = await response.json();
    return pictures;
  } catch (error) {
    console.error("Error fetching pictures:", error);
    throw error;
  }
};

export const saveProfilePicture = async (userId, profilePicKey) => {

  const encodedUserId = encodeURIComponent(userId);

  const response = await fetch(`${API_BASE_URL}/users/${encodedUserId}/metadata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profilePicKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to save profile picture");
  }

  const data = await response.json();
  return data;
};

export const updateUserProfile = async (userId, updatedFields, target) => {
  const encodedUserId = encodeURIComponent(userId);

  const response = await fetch(`${API_BASE_URL}/users/${encodedUserId}/metadata`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ updatedFields, target }), // Pass updated fields directly
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update user profile");
  }

  const data = await response.json();
  return data;
};