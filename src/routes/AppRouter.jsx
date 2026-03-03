import { Routes, Route } from "react-router-dom";
import LogIn from "../pages/LogIn";
import SignUp from "../pages/SignUp";
import ForgotPassword from "../pages/ForgotPassword";
import CreateProperty from "../pages/properties/CreateProperty";
import ShowProperty from "../pages/ShowProperty/ShowProperty";
import LandingPage from "../pages/LandingPage";
import PropertiesPage from "../pages/PropertiesPage";
import PropertiesTrashCan from "../pages/PropertiesTrashCan/PropertiesTrashCan";


export default function AppRouter() {
    return (
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
    )
}