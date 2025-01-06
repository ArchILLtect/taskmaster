import React, { useState } from "react";
import { getUploadUrl } from "../services/apiHelpers";
import { useAuth0 } from "@auth0/auth0-react";


const ProfilePicUploader = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const { getAccessTokenSilently } = useAuth0();

  
    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile)); // Show a preview of the image
      }
    };
  
    const handleUpload = async () => {

        const token = await getAccessTokenSilently();

        if (!file) {
            alert("Please select a file first!");
            return;
        }
    
        setIsUploading(true);
  
        try {
            const uploadUrl = await getUploadUrl(file.name, file.type, token);
    
            // Upload the file to S3 using the signed URL
            const response = await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type,
                },
                body: file,
            });
    
            if (response.ok) {
                alert("File uploaded successfully!");
            } else {
                throw new Error("Failed to upload file");
            }
        } catch (error) {
            console.error("Error during upload:", error);
            alert("An error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
        };
  
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg p-6 shadow-lg w-96">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                >
                    X
                </button>
                <h2 className="text-lg font-semibold mb-4">Update Profile Picture</h2>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mb-4"
                />
                {preview && (
                    <div className="mb-4">
                        <img
                            src={preview}
                            alt="Profile Preview"
                            className="h-32 w-32 object-cover rounded-full"
                        />
                    </div>
                )}
                <div className="flex justify-between">
                    <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className={`px-4 py-2 rounded-md text-white ${
                            isUploading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                        }`}
                    >
                        {isUploading ? "Uploading..." : "Upload"}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
  };
  
  export default ProfilePicUploader;
  




