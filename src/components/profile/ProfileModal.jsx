import React, { useState } from "react";
import FullPageLoader from "../FullPageLoader";
import DEFAULT_PIC from '../../assets/logo.svg';
import ProfilePicSelectModal from "./ProfilePicSelectModal";
import { useApp } from "../../contexts/AppContext";
import { useAuth0 } from "@auth0/auth0-react";
import StatusIndicator from "../StatusIndicator";
import { updateUserProfile } from "../../services/apiHelpers";

// TODO: Add click outside the box to close modal functionality.
/* TODO: As it stands, all fields that get updated in Auth0 pass to the user_metadata field in Auth0 server.
            The non-user_metadata fields (the ones that have their own field - e.g. nickname) need to pass
            to their own field in the Auth0 server.*/

const ProfileModal = ({ onClose }) => {
    const [showPicUpdater, setShowPicUpdater] = useState();
    const [isLoading, setIsLoading] = useState();
    const [error, setError] = useState();
    const { currentUser, setUser } = useApp();
    const { user: auth0User } = useAuth0();
    // Update with the currentUser instead of following useInitializeUser:
    // const { isLoading, error } = useInitializeUser(!currentUser);

    // State for editable fields
    const [isEditing, setIsEditing] = useState({
        nickname: false,
        email: false,
        website: false,
        company: false,
    });
    const [editValues, setEditValues] = useState({
        nickname: currentUser.nickname,
        email: currentUser.email,
        website: currentUser.website,
        company: currentUser.company,
    });

    const handleEditToggle = (field) => {
        setIsEditing((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleInputChange = (field, value) => {
        setEditValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        const updatedFields = {};
        const target = 'user_metadata';
        Object.keys(editValues).forEach((key) => {
            if (editValues[key] !== currentUser[key]) {
                updatedFields[key] = editValues[key];
            }
        });

        if (Object.keys(updatedFields).length > 0) {
            try {
                setIsLoading(true); // Show loading spinner
                // Call the API helper to update user profile
                const updatedUser = await updateUserProfile(auth0User.sub, updatedFields, target);

                // Update currentUser in context
                setUser((prevUser) => ({
                    ...prevUser,
                    ...updatedFields, // Merge updated fields
                }));
                console.log(updatedUser)
                alert("Profile updated successfully!");
            } catch (error) {
                console.error("Error updating profile:", error);
                setError("Failed to update profile.");
            } finally {
                setIsLoading(false); // Hide loading spinner
            }
        } else {
            setError("No changes to save.");
        }

        // Reset edit states
        setIsEditing({
            nickname: false,
            email: false,
            website: false,
            company: false,
        });
    };

    //TODO: Change the following 2 if statements to inline displaying:
    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (isLoading || !currentUser) {
        return <FullPageLoader message="Initializing your account..." />;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-gray-200 dark:bg-gray-800 rounded-lg p-6 shadow-lg w-5/12 border-2 border-blue-300">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 px-[5px] bg-gray-800 hover:bg-gray-200 text-gray-200 hover:text-gray-900 rounded-sm"
                >
                    X
                </button>
                <h2 className="text-3xl text-gray-800 dark:text-gray-200 font-bold mb-4 text-center">My Profile</h2>
                <div className="flex flex-row gap-3 ml-5">
                    <img
                        src={currentUser.picture || auth0User.picture || DEFAULT_PIC}
                        alt="Profile pic"
                        className="w-48 h-48 rounded-full border-gray-900 border-4 dark:border-blue-300"
                    />
                    <div className="absolute top-15 -right-2 flex gap-4 flex-col">
                        <button
                            onClick={() => setShowPicUpdater(true)}
                            className="px-6 py-3 bg-blue-500 border-blue-300 border-2 text-white text-nowrap rounded-md hover:bg-blue-600 transition duration-200"
                        >
                            Change Pic
                        </button>
                    </div>
                </div>
                <div className="flex justify-start w-full p-1 mt-1 ml-4">
                    <StatusIndicator type={"both"} />
                </div>
                <fieldset className="mt-5 text-gray-800 dark:text-gray-300 border-2 rounded-lg border-gray-900 dark:border-blue-300 border-opacity-20">
                    <legend
                        className="ml-5 mb-0 px-3 pt-1 text-xl font-bold text-gray-700 dark:text-gray-200
                                border-t-[2.5px] rounded-xl border-gray-900 dark:border-blue-300 border-opacity-20">
                            User Details:
                    </legend>
                    {/* Editable Fields */}
                    <div className="px-4">
                        {["nickname", "email", "website", "company"].map((field) => (
                            <div key={field} className="flex justify-between items-center mt-1 min-h-9">
                                <div className="flex items-start gap-2 mt-1 min-h-9">
                                    <p>
                                        <strong className="text-lg text-gray-800 dark:text-gray-200">{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>
                                    </p>
                                    {isEditing[field] ? (
                                        <input
                                            type="text"
                                            value={editValues[field]}
                                            onChange={(e) => handleInputChange(field, e.target.value)}
                                            /* TODO: Set up to use green border for validated/red for non-validated?? */
                                            className="border border-green-300 rounded px-2 py-1 text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-800"
                                        />
                                    ) : (
                                        <span className="text-gray-800 px-[9px] py-[5px] dark:text-gray-200">{editValues[field]}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleEditToggle(field)}
                                    className="px-2 py-1 bg-blue-500 text-white rounded-md"
                                >
                                    {isEditing[field] ? "Cancel" : "Edit"}
                                </button>
                            </div>
                        ))}
                        <div className="my-5">
                            <p className="mt-1"><strong className="text-lg">Username: </strong> {currentUser.username}</p>
                            <p className="mt-1"><strong className="text-lg">Account Creation: </strong>
                                {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : <span className="text-red-500">error</span>}</p>
                            <p className="mt-1"><strong className="text-lg">Last Login: </strong>
                                {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString() : <span className="text-red-500">error</span>}</p>
                            <p className="mt-1"><strong className="text-lg">Role: </strong> {currentUser.role}</p>
                        </div>
                    </div>
                </fieldset>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                        disabled={Object.keys(isEditing).every((key) => !isEditing[key])}
                    >
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md ml-2"
                    >
                        Close
                    </button>
                </div>
            </div>
            {showPicUpdater && (
                <ProfilePicSelectModal
                    onClose={() => setShowPicUpdater(false)}
                />
            )}
        </div>
    );
};

export default ProfileModal;