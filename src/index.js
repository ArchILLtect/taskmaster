import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client' instead of 'react-dom'
import App from './App';
import './index.css';
import { AppProvider } from "./contexts/AppContext";
import { Auth0Provider } from '@auth0/auth0-react';

const awsConfig = {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_REGION,
    bucketName: process.env.REACT_APP_S3_BUCKET_NAME,
    domain: process.env.REACT_APP_AUTH0_DOMAIN, // Auth0 domain
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID // Auth0 Client ID
};

const root = ReactDOM.createRoot(document.getElementById('root')); // Updated syntax
root.render(
    <React.StrictMode>
        <Auth0Provider
            domain={awsConfig.domain}
            clientId={awsConfig.clientId}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: "https://dev-cmwqc1e84xjkhk78.us.auth0.com/api/v2/",
                scope: "read:current_user update:current_user_metadata"
            }}
        >
            <AppProvider>
                <App />
            </AppProvider>
        </Auth0Provider>
    </React.StrictMode>
);