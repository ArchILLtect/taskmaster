import React from "react";
import useInitializeUser from "../hooks/useInitializeUser";
import FullPageLoader from "./FullPageLoader";

const ProfileModal = ({ onClose, user }) => {
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
            <div className="bg-white rounded-lg p-6 shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">My Profile</h2>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;