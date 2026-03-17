import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import PropertiesPage from "../pages/PropertiesPage";
import AgentsPage from "../pages/AgentsPage";
import PropertiesTrashCan from "../pages/PropertiesTrashCan/PropertiesTrashCan";
import ShowProperty from "../pages/ShowProperty/ShowProperty";
import LogIn from "../pages/Login/LogIn";
import SignUp from "../pages/SignUp";
import ForgotPassword from "../pages/ForgotPassword";
import CreateProperty from "../pages/properties/CreateProperty";
import MyProperties from "../pages/ShowProperty/MyProperties";
import SellWizardPage from "../pages/sell/SellWizardPage";
import ClientProfilePage from "../pages/ClientProfilePage";
import NotFoundPage from "../pages/NotFoundPage";
import MyFavoriteProperties from "../pages/ShowProperty/MyFavoriteProperties";
import PropertyManagementOptions from "../pages/PropertyManagementOption/PropertyManagementOptions";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/property-management" element={<PropertyManagementOptions />} />
            <Route path="/sell" element={<SellWizardPage />} />
            <Route path="/clients/:id" element={<ClientProfilePage />} />
            <Route path="/create-property" element={<CreateProperty />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<ShowProperty />} />
            <Route path="/properties/:id/edit" element={<CreateProperty />} />
            <Route path="/properties/me" element={<MyProperties />} />
            <Route path="/properties/favorites" element={<MyFavoriteProperties />} />
            <Route path="/trashcan" element={<PropertiesTrashCan />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}