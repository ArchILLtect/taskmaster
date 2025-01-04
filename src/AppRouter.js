import { Routes, Route } from 'react-router-dom';
import App from './App';


const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<App />} />
        </Routes>
    );
};

export default AppRouter;