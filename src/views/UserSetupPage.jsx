import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { updateUserInfo } from '../services/apiHelpers';
import { useUser } from '../contexts/UserContext';

const UserSetupPage = () => {
    const { logout } = useAuth0();
    const { loadUser } = useUser();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const user = await loadUser(); // Always use loadUser to fetch or return existing user
            console.log(user)
            if (user?.username) {
                navigate('/'); // Redirect to home if username is set
            }
        };

        checkUser();
    }, [loadUser, navigate]); // Only necessary dependencies

    const handleSave = async () => {
        if (!username.trim()) {
            alert('Username is required.');
            return;
        }

        setIsSaving(true);

        try {
            await updateUserInfo(username);
            navigate('/'); // Redirect to app
        } catch (error) {
            console.error('Error saving username:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Initial Profile Setup</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                }}
                className="w-1/2 p-6 bg-white rounded shadow-md"
            >
                <label className="block mb-4">
                    <span className="text-gray-700">Username</span>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full p-2 border rounded"
                        required
                    />
                </label>
                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={() => logout({ returnTo: window.location.origin })}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                        Log Out
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`px-4 py-2 text-white rounded ${isSaving ? 'bg-gray-400' : 'bg-blue-500'}`}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserSetupPage;