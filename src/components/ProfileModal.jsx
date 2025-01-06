import React, { useState } from "react";
import useInitializeUser from "../hooks/useInitializeUser";
import FullPageLoader from "./FullPageLoader";
import DEFAULT_PIC from '../assets/logo.svg';
import ProfilePicUploader from "./ProfilePicUploader";

const ProfileModal = ({ onClose, user }) => {
    const [showPicUploader, setShowPicUploader] = useState();
    // Reinitialize user if not already set
    const { isLoading, error } = useInitializeUser(!user);

    if (error) {
        return <div>{error}</div>;
    }

    if (isLoading || !user) {
        return <FullPageLoader message="Initializing your account..." />;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg p-6 shadow-lg w-5/12">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 px-[5px] bg-gray-100 text-gray-800 hover:text-gray-900 hover:bg-gray-200"
                >
                    X
                </button>
                <h2 className="text-3xl font-bold mb-4 text-center">My Profile</h2>
                <div className="flex flex-row gap-3 ml-5">
                    <img src={user?.picture || DEFAULT_PIC } alt="Profile pic" className="w-48 h-48 rounded-full border-gray-900 border-2" />
                    <div className="absolute top-15 -right-2 flex gap-4 flex-col">
                        <button
                            className="px-6 py-3 bg-blue-500 border-blue-300 border-2 text-white text-nowrap rounded-md hover:bg-blue-600 transition duration-200"
                        >
                            Change Pic
                        </button>
                        <button
                            onClick={() => {setShowPicUploader(true)}}
                            className="px-6 py-3 bg-blue-500 border-blue-300 border-2 text-white text-nowrap rounded-md hover:bg-blue-600 transition duration-200"
                        >
                            Upload New Pic
                        </button>
                    </div>

                    
                </div>
                <div>
                <p className="mt-3"><strong>Username:</strong> {user.username}</p>
                <p><strong>Nickname:</strong> {user.nickname}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Created At:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : <span className="text-red-500">error</span>}</p>
                <p><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : <span className="text-red-500">error</span>}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Website:</strong> {user.website}</p>
                <p><strong>Company:</strong> {user.company}</p>
                <p><strong>Theme:</strong> {user.theme}</p>
                <p><strong>Status:</strong> {user.status}</p>
                <p><strong>Language:</strong> {user.language}</p>
                <p><strong>Notifications:</strong> {user.notifications ? "Enabled" : "Disabled"}</p>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md"
                    >
                        Close
                    </button>
                </div>
            </div>
            {/* Pic Uploader Dialog */}
            {showPicUploader && (
                <ProfilePicUploader
                    onClose={() => {
                        setShowPicUploader(false);
                    }}                  
                />
            )}
        </div>
    );
};

export default ProfileModal;