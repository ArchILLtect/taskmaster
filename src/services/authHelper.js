import { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const useCheckSession = () => {
    const { getAccessTokenSilently, logout } = useAuth0();
  
    const checkSession = async () => {
      try {
        // Try to silently get a new access token
        await getAccessTokenSilently();
        console.log("User is still authenticated");
      } catch (error) {
        if (error.error === "login_required" || error.error === "consent_required") {
          console.log("Session expired. Logging out...");
          logout({ returnTo: window.location.origin }); // Redirect to the home page after logout
        } else {
          console.error("Error checking session:", error);
        }
      }
    };
  
    return { checkSession };
};

export const useSessionMonitor = () => {
    const { getAccessTokenSilently, loginWithRedirect } = useAuth0();
    const [isSessionExpired, setIsSessionExpired] = useState(false);
  
    // Define checkSession with useCallback
    const checkSession = useCallback(async () => {
      const now = new Date();
      try {
          console.log(`Checking session: ${now}`);
          await getAccessTokenSilently();
          setIsSessionExpired(false); // Session is valid
          console.log(`Session still active: ${now}`);
      } catch (error) {
          if (error.error === "login_required") {
              setIsSessionExpired(true); // Session has expired
              console.log(`Session no longer active: ${now}`);
          } else {
              console.error("Unexpected error during session check:", error);
          }
      }
  }, [getAccessTokenSilently]);
  
    // Use useEffect with checkSession as a dependency
    useEffect(() => {
      checkSession(); // Initial check
      const interval = setInterval(() => {
        checkSession();
      }, 5 * 60 * 1000); // Check every 5 minutes
  
      return () => clearInterval(interval); // Cleanup on unmount
    }, [checkSession]);
  
    const reauthenticate = async () => {
      await loginWithRedirect(); // Redirect to Auth0 login page
    };
  
    return { isSessionExpired, reauthenticate };
  };