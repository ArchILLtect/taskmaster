import { Routes, Route } from 'react-router-dom';
import App from './App';
import UserSetupPage from './views/UserSetupPage';
//import { useInitialRoute } from '../src/services/authHelper';


const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/setup" element={<UserSetupPage />} />
        </Routes>
    );
};

export default AppRouter;