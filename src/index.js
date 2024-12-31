import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client' instead of 'react-dom'
import App from './App';
import './index.css';
import { AppProvider } from "./contexts/AppContext";

const root = ReactDOM.createRoot(document.getElementById('root')); // Updated syntax
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
