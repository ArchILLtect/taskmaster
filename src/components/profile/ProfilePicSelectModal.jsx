import React, { useEffect, useState } from "react";
import { getUserPictures, saveProfilePicture } from "../../services/apiHelpers";
import { useAuth0 } from "@auth0/auth0-react";
import InlineLoader from "../InlineLoader";
import ProfilePicUploadModal from "./ProfilePicUploadModal";
import { useApp } from "../../contexts/AppContext";


const ProfilePicSelectModal = ({ onClose }) => {
    const [pictures, setPictures] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPic, setSelectedPic] = useState("");
    const [showComingSoonMessage, setShowComingSoonMessage] = useState(false);

    const { user: auth0User } = useAuth0(); // For the user's basic info (e.g., sub)
    const { setUser, showPicUploader, setShowPicUploader } = useApp();

    useEffect(() => {
        const fetchPictures = async () => {
            setIsLoading(true);
            try {
                const data = await getUserPictures(auth0User.sub);
                setPictures(data);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching pictures:", err);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchPictures();
    }, [auth0User]);

    const updateProfilePic = async () => {
        try {
            if (!selectedPic) {
                alert("Please select a profile picture to save!");
                return;
            }    
            setIsLoading(true);
            console.log(selectedPic)
            await saveProfilePicture(auth0User.sub, selectedPic); // Call the API helper
            setUser((prevUser) => ({
                ...prevUser,
                picture: selectedPic, // Update the picture in `currentUser`
            }));
            alert("Profile picture updated successfully!");
            onClose(); // Close the modal after saving
        } catch (error) {
            console.error("Error saving profile picture:", error);
            alert(`Failed to save profile picture: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-gray-200 dark:bg-gray-800 rounded-lg p-6 shadow-lg w-5/12 border-2 border-blue-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                >
                    X
                </button>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-10">Choose Profile Pic</h2>
                <div className="flex flex-row justify-between mb-4">
                    <img
                        src={selectedPic}
                        alt="Profile Preview"
                        className="h-48 w-48 object-cover text-gray-800 bg-gray-300 dark:text-gray-200 rounded-full text-center border-2 border-blue-300" // TODO: Need to try to find a way to v-center alt text.
                    />
                    {isLoading ? (
                        <InlineLoader message="Loading pictures..." />
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <ul className="grid grid-cols-3 gap-4 mb-10 p-4 h-48 border-2 bg-gray-300 dark:bg-gray-700 rounded-lg overflow-y-scroll border-blue-300">
                            {pictures.map((picture) => (
                            <li key={picture.key} className="relative">
                                <div>
                                    <button
                                        onClick={() => {setSelectedPic(picture.url)}}
                                    >
                                    <img
                                        src={picture.url}
                                        alt="Profile thumbnail"
                                        className="w-16 h-16 object-cover rounded-lg border"
                                    />
                                    </button>

                                </div>
                                <button
                                    onClick={() => setShowComingSoonMessage(true)}
                                    className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 justify-center items-center rounded-full"
                                >
                                    X
                                </button>
                            </li>
                            ))}
                        </ul>
                    )}
                </div>
                {showComingSoonMessage &&
                <div className="flex flex-row mb-4 p-2 items-center border-2 border-red-300 rounded-md">
                    <p className="text-red-500">
                        Delete functionality coming soon! Please <a href="mailto:nick@nickhanson.me" className="font-bold underline">message me</a> for file deletion!
                    </p>
                    <button
                        onClick={() => setShowComingSoonMessage(false)}
                        className="bg-red-500 text-white text-xs w-5 h-5 justify-center items-center rounded-full"
                    >
                        X
                    </button>
                </div>
                    
                }
                <div className="flex justify-between">
                    <button
                        onClick={() => setShowPicUploader(true)}
                        className="px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
                    >
                        Upload Pic
                    </button>
                    <div className="flex gap-5">
                        <button
                            onClick={() => {updateProfilePic()}}
                            className="px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
                        >
                            Save
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
            {/* Pic Uploader */}
            {showPicUploader && (
                <ProfilePicUploadModal
                    onClose={() => setShowPicUploader(false)}
                />
            )}
        </div>
    );
  };
  
  export default ProfilePicSelectModal;