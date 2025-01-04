import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client' instead of 'react-dom'
// import App from './App';
import './index.css';
import { AppProvider } from "./contexts/AppContext";
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import history from "./services/history";
import { getConfig } from "./services/config";
import App from './App';

const onRedirectCallback = (appState) => {
    history.push(
      appState && appState.returnTo ? appState.returnTo : window.location.pathname
    );
};
  
  // Please see https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html
  // for a full list of the available properties on the provider
  const config = getConfig();
  
  const providerConfig = {
    domain: config.domain,
    clientId: config.clientId,
    cacheLocation: "localstorage",
    onRedirectCallback,
    authorizationParams: {
      redirect_uri: window.location.origin,
      ...(config.audience ? { audience: config.audience } : null),
    },
  };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Auth0Provider
            {...providerConfig}
        >
            <AppProvider>
                <UserProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </UserProvider>
            </AppProvider>
        </Auth0Provider>
    </React.StrictMode>
);