import React, { useState } from "react";
import { getUploadUrl } from "../services/apiHelpers";
import { useAuth0 } from "@auth0/auth0-react";

// TODO - Pic name must be input validated to deal with spaces (replace with undersores?)
// TODO - A limiter has to be added for number of currently uploaded pics
// TODO - Add delete pic button functionality for currently uploaded pics

const ProfilePicUploader = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const { getAccessTokenSilently } = useAuth0();
  
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith("image/")) { // Validate file type
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile)); // Show a preview of the image
        } else {
            alert("Please select a valid image file.");
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
                setFile(null); // Clear selected file
                setPreview(null); // Clear preview
            } else {
                throw new Error("Failed to upload file");
            }

        } catch (err) {
            // Display specific error message for 403 or other errors
            alert(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };
  
    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 dark:text-gray-200">Choose pic to upload</h2>
            <div className="mb-16">
                {preview && (
                    <div className="mb-4 dark:text-gray-200">
                        <img
                            src={preview}
                            alt="Profile Preview"
                            className="h-32 w-32 text-white dark:text-gray-200 object-cover rounded-full"
                        />
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*.jpg"
                    onChange={handleFileChange}
                    className="mb-4 dark:text-gray-200"
                />
            </div>
            <div className="flex justify-center gap-7">
            <button
                onClick={handleUpload}
                disabled={isUploading || !file} // Disable if no file is selected
                className={`px-4 py-2 rounded-md text-white ${
                    isUploading || !file ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
                {isUploading ? "Uploading..." : "Upload"}
            </button>
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600"
                >
                    Close
                </button>    
            </div>
        </div>
        
    );
  };
  
  export default ProfilePicUploader;
  




