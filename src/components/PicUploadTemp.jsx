import React, { useState } from "react";
import { getUploadUrl } from "../services/apiHelpers";
import { useAuth0 } from "@auth0/auth0-react";
import { getConfig } from "../services/config";
//import Loading from "../components/Loading";

const ProfilePicUploader = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const { apiOrigin = "http://localhost:3000", audience } = getConfig();

    const {
        getAccessTokenSilently,
        loginWithPopup,
        getAccessTokenWithPopup,
        } = useAuth0();
  
    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile)); // Show a preview of the image
      }
    };


    const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
    });



    const handleConsent = async () => {
        try {
            await getAccessTokenWithPopup();
            setState({
            ...state,
            error: null,
            });
        } catch (error) {
            setState({
            ...state,
            error: error.error,
            });
        }

        await callApi();
        };

    const handleLoginAgain = async () => {
        try {
            await loginWithPopup();
            setState({
            ...state,
            error: null,
            });
        } catch (error) {
            setState({
            ...state,
            error: error.error,
            });
        }

        await callApi();
        };

        const callApi = async () => {
            try {
              // Get an access token silently
              const token = await getAccessTokenSilently();
          
              // Replace with logic to retrieve the file you want to upload
              const file = document.querySelector('input[type="file"]').files[0];
          
              if (!file) {
                throw new Error("No file selected for upload");
              }
          
              // Step 1: Get the signed upload URL from your backend
              const uploadUrlResponse = await fetch(`${apiOrigin}/api/get-upload-url`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  fileName: file.name,
                  fileType: file.type,
                }),
              });
          
              if (!uploadUrlResponse.ok) {
                throw new Error("Failed to get upload URL");
              }
          
              const { uploadUrl } = await uploadUrlResponse.json();
          
              // Step 2: Upload the file to S3 using the signed URL
              const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                  "Content-Type": file.type,
                },
                body: file,
              });
          
              if (uploadResponse.ok) {
                alert("File uploaded successfully!");
              } else {
                throw new Error("Failed to upload file to S3");
              }
            } catch (error) {
              console.error("Error during API call:", error);
              alert("An error occurred during the API call or file upload.");
            }
          };

    const handle = (e, fn) => {
        e.preventDefault();
        fn();
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
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Upload Your Profile Picture</h2>
            {state.error === "consent_required" && (
                <div>
                    You need to{" "}
                    <a
                    href="#/"
                    class="alert-link"
                    onClick={(e) => handle(e, handleConsent)}
                    >
                    consent to get access to users api
                    </a>
                </div>
            )}

            {state.error === "login_required" && (
                <div>
                    You need to{" "}
                    <a
                    href="#/"
                    class="alert-link"
                    onClick={(e) => handle(e, handleLoginAgain)}
                    >
                    log in again
                    </a>
                </div>
            )}
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
            <button
                onClick={handleUpload}
                disabled={!audience || isUploading}
                className={`px-4 py-2 rounded-md text-white ${
                    isUploading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
                {isUploading ? "Uploading..." : "Upload"}
            </button>
        </div>
    );
  };
  
  export default ProfilePicUploader;