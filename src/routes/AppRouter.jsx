import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import PropertiesPage from "../pages/PropertiesPage";
import PropertiesTrashCan from "../pages/PropertiesTrashCan/PropertiesTrashCan";
import ShowProperty from "../pages/ShowProperty/ShowProperty";
import LogIn from "../pages/LogIn";
import SignUp from "../pages/SignUp";
import ForgotPassword from "../pages/ForgotPassword";
import CreateProperty from "../pages/properties/CreateProperty";

export default function AppRouter() {
    return (
<<<<<<< HEAD
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/create-property" element={<CreateProperty />} />
                <Route path="/show-property/:id/edit" element={<CreateProperty />} />
                <Route path="/show-property/:id" element={<ShowProperty />} />
                <Route path="/propiedades" element={<PropertiesPage />} />
                <Route path="/trashcan" element={<PropertiesTrashCan />} />
            </Routes>
    )
=======
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create-property" element={<CreateProperty />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/propiedades" element={<PropertiesPage />} />
            <Route path="/show-property/:id" element={<ShowProperty />} />
            <Route path="/trashcan" element={<PropertiesTrashCan />} />
        </Routes>
    );
>>>>>>> dev
}