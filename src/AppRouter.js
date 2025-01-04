import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import UserSetupPage from './views/UserSetupPage';
//import { useInitialRoute } from '../src/services/authHelper';
import ExternalApi from './views/ExternalApi';


const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/setup" element={<UserSetupPage />} />
            <Route path="/external-api" element={<ExternalApi />} />
        </Routes>
    );
};

export default AppRouter;