import React from "react";
import { Routes, Route } from "react-router-dom";
import MainView from "./views/MainView"; // New main view component

const App = () => {
    return (
            <Routes>
                <Route path="/" element={<MainView />} />
            </Routes>
    );
};

export default App;
