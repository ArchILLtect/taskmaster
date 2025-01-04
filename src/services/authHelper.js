import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserInfo } from './apiHelpers';
import { useUser } from '../contexts/UserContext';



export const useInitialRoute = () => {
    const { isAuthenticated } = useAuth0();
    const { currentUser } = useUser();

    if (!isAuthenticated) {
        return '/'; // User is not logged in
    }

    if (!currentUser) {
        return '/setup'; // No User instance exists
    }

    if (!currentUser.isUsernameSet()) {
        return '/setup'; // User instance exists but username is not set
    }

    return '/'; // All conditions satisfied, go to main app
};

export const useLoadUserOnAuth = () => {
    const { isAuthenticated, user } = useAuth0();
    const { currentUser, loadUser } = useUser();

    useEffect(() => {
        const fetchAndLoadUser = async () => {
            if (isAuthenticated && !currentUser) {
                const userData = await getUserInfo(user.sub); // Fetch from backend
                await loadUser(userData); // Create and cache User instance
            }
        };

        fetchAndLoadUser();
    }, [isAuthenticated, user, currentUser, loadUser]);
};