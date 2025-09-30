import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

const useRefreshAuth0User = () => {
    const { getAccessTokenSilently, user: auth0User, isAuthenticated, getIdTokenClaims } = useAuth0();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const refreshUser = async () => {
        if (!isAuthenticated) {
            console.warn("User is not authenticated. Cannot refresh.");
            return;
        }

        setIsRefreshing(true);
        setError(null);

        try {
            // Get a new token silently
            await getAccessTokenSilently({
                detailedResponse: false, // Optional: true if you need full token response
            });

            // Fetch the updated user profile information
            const updatedUser = await getIdTokenClaims();

            console.log("User successfully refreshed!?!?!?:", updatedUser);

            // Optionally, do something with the refreshed user profile
            return updatedUser;

        } catch (err) {
            console.error("Error refreshing user:", err);
            setError(err.message || "Failed to refresh user.");
        } finally {
            setIsRefreshing(false);
        }
    };

    return { refreshUser, isRefreshing, error, auth0User };
};

export default useRefreshAuth0User;
