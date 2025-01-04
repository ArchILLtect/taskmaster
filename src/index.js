import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client' instead of 'react-dom'
// import App from './App';
import './index.css';
import { AppProvider } from "./contexts/AppContext";
import { Auth0Provider } from '@auth0/auth0-react';
import AppRouter from './AppRouter';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import history from "./services/history";
import { getConfig } from "./services/config";

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
    onRedirectCallback,
    authorizationParams: {
      redirect_uri: window.location.origin,
      ...(config.audience ? { audience: config.audience } : null),
    },
  };

const awsConfig = {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_REGION,
    bucketName: process.env.REACT_APP_S3_BUCKET_NAME,
    domain: process.env.REACT_APP_AUTH0_DOMAIN, // Auth0 domain
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID // Auth0 Client ID
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
                        <AppRouter />
                    </BrowserRouter>
                </UserProvider>
            </AppProvider>
        </Auth0Provider>
    </React.StrictMode>
);