
const API_BASE_URL = 'https://amxpsay0hd.execute-api.us-east-2.amazonaws.com/Dev';
const API_FILES = '/files';
const API_GENRERATE_URL = "/generate-upload-url"


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