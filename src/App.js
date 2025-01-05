import React from "react";
import { Routes, Route } from "react-router-dom";
import MainView from "./views/MainView"; // New main view component
import AuthLandingPage from "./views/AuthLandingPage"

const App = () => {
    return (
            <Routes>
                <Route path="/landing" element={<AuthLandingPage />} />
                <Route path="/" element={<MainView />} />
            </Routes>
    );
};

export default App;
