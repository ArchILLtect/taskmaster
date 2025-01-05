import React, { useEffect } from "react";
import FullPageLoader from "../components/FullPageLoader";
import useInitializeUser from "../hooks/useInitializeUser";
import { useApp } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";

const AuthLandingPage = () => {
    const { currentUser } = useApp();
    const navigate = useNavigate();

    useInitializeUser(!currentUser, true); // Skip redirect in the hook

    useEffect(() => {
        if (currentUser) {
            navigate("/"); // Redirect when user is initialized
        }
    }, [currentUser, navigate]);

    return <FullPageLoader message="Initializing your account..." />;
};

export default AuthLandingPage;