import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useApp } from "../contexts/AppContext";
import User from "../models/User";

const useInitializeUser = (shouldInitialize = true) => {
    const { isAuthenticated, user: auth0User } = useAuth0(); // For the user's basic info (e.g., sub)
    const { setUser } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!shouldInitialize) return;

        const initializeUser = async () => {
            setIsLoading(true);

            try {
                if (isAuthenticated && auth0User) {
                    // Fetch user metadata from your API Gateway endpoint
                    const url =
                        `https://amxpsay0hd.execute-api.us-east-2.amazonaws.com/Dev/users/${auth0User.sub}/metadata`;
                    const response = await fetch(url,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Failed to fetch user data from backend.");
                    }

                    const userData = await response.json();

                    // Create the User object
                    const currentUser = new User({
                        userID: userData.user_id,
                        userName: userData.name,
                        nickname: userData.nickname,
                        email: userData.email,
                        picture: userData.picture,
                        createdAt: userData.created_at,
                        lastLogin: userData.last_login,
                        role: userData.app_metadata?.role || "user",
                        website: userData.user_metadata?.website || "",
                        company: userData.user_metadata?.company || "",
                        theme: userData.user_metadata?.theme || "light",
                        language: userData.user_metadata?.language || "en",
                        notifications: userData.user_metadata?.notifications || true,
                    });

                    // Save user locally and update context
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