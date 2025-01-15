import React from "react";
import { Routes, Route } from "react-router-dom";
import MainView from "./views/MainView"; // New main view component
import AuthLandingPage from "./views/AuthLandingPage"
import MainViewOffline from "./views/MainViewOffline";
import UserSetupModal from "./components/UserSetupModal";

const App = () => {
    return (
            <Routes>
                <Route path="/landing" element={<AuthLandingPage />} />
                <Route path="/setup" element={<UserSetupModal />} />
                <Route path="/offline" element={<MainViewOffline />} />
                <Route path="/" element={<MainView />} />
            </Routes>
    );
};

export default App;
