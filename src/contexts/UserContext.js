import React, { createContext, useContext, useState } from 'react';
import User from '../models/User'; // Ensure this is imported
import { useAuth0 } from '@auth0/auth0-react';
import { getUserInfo } from '../services/apiHelpers';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null); // Holds User instance
    const { getAccessTokenSilently } = useAuth0();

    const loadUser = async () => {
        if (currentUser) return currentUser; // Return existing user if already loaded
    
        try {
            const token = await getAccessTokenSilently();
            const data = await getUserInfo(token); // Fetch user data
            const userInstance = new User(data); // Create a User instance
            setCurrentUser(userInstance); // Update the context state
            return userInstance; // Return the loaded user
        } catch (error) {
            console.error("Error loading user:", error);
            throw error; // Re-throw error for caller to handle
        }
    };

    const clearUser = () => {
        // Clear user data on logout
        setCurrentUser(null);
    };

    return (
        <UserContext.Provider value={{ currentUser, loadUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);