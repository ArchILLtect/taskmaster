import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client' instead of 'react-dom'
import App from './App';
import './index.css';
import { AppProvider } from "./contexts/AppContext";
import { Auth0Provider } from '@auth0/auth0-react';

require("dotenv").config();

const domain = process.env.REACT_APP_AUTH0_DOMAIN; // Auth0 domain
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID; // Auth0 Client ID

const root = ReactDOM.createRoot(document.getElementById('root')); // Updated syntax
root.render(
    <React.StrictMode>
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
              redirect_uri: window.location.origin,
            }}
        >
            <AppProvider>
                <App />
            </AppProvider>
        </Auth0Provider>
    </React.StrictMode>
);