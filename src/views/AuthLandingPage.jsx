import React, { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import User from "../models/User";
import { useApp } from "../contexts/AppContext";
import FullPageLoader from "../components/FullPageLoader";

const LoadingPage = () => {
    const { isAuthenticated, user: auth0User } = useAuth0();
    const { setUser } = useApp();
    const navigate = useNavigate();
    const isInitialized = useRef(false); // Ref to track initialization

    useEffect(() => {
        const initializeUser = async () => {
            if (isInitialized.current) return; // Prevent re-initialization
            if (isAuthenticated && auth0User) {
                isInitialized.current = true; // Mark as initialized

                // Transform Auth0 data into a User object
                const currentUser = new User({
                    userID: auth0User.sub,
                    userName: auth0User.name,
                    email: auth0User.email,
                    settings: auth0User.user_metadata || {}, // Include metadata
                });

                // Save the user locally and in app state
                currentUser.saveToLocalStorage();
                setUser(currentUser);

                // Redirect to the main view
                navigate("/");
            }
        };

        initializeUser();
    }, [isAuthenticated, auth0User, setUser, navigate]);

    return <FullPageLoader message="Initializing your account..." />;
};

export default LoadingPage;