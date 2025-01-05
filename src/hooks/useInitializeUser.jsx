import { useEffect, useState } from "react";
import User from "../models/User";
import { useAuth0 } from "@auth0/auth0-react";
import { useApp } from "../contexts/AppContext";

const useInitializeUser = (shouldInitialize = true) => {
    const { isAuthenticated, user: auth0User } = useAuth0();
    const { setUser } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!shouldInitialize) return;

        const initializeUser = async () => {
            setIsLoading(true);
            try {
                if (isAuthenticated && auth0User) {
                    const currentUser = new User({
                        userID: auth0User.sub,
                        userName: auth0User.name,
                        email: auth0User.email,
                        settings: auth0User.user_metadata || {}, // Include metadata
                    });

                    currentUser.saveToLocalStorage();
                    setUser(currentUser);
                }
            } catch (err) {
                setError("Failed to initialize user.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        initializeUser();
    }, [isAuthenticated, auth0User, setUser, shouldInitialize]);

    return { isLoading, error };
};

export default useInitializeUser;