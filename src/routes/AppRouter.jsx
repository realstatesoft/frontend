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
import VisitRequests from "../pages/VisitRequests";
import ClientProfilePage from "../pages/ClientProfilePage";
import NotFoundPage from "../pages/NotFoundPage";
import MyFavoriteProperties from "../pages/ShowProperty/MyFavoriteProperties";
import RegisterClient from "../pages/clients/RegisterClient";
import EditClient from "../pages/clients/EditClient";
import PropertyManagementOptions from "../pages/PropertyManagementOptions/PropertyManagementOptions";
import ClientList from "../pages/ClientList/ClientList";
import AgendaPage from "../pages/Agenda/AgendaPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import UserProfilePage from "../pages/UserProfilePage";
import PropertyApprovalPage from "../pages/Admin/PropertyApprovalPage";

export default function AppRouter() {
    return (
        <Routes>
            {/* ── Rutas públicas ─────────────────────────────────────── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/sell" element={<SellWizardPage />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<ShowProperty />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />

            {/* ── Rutas protegidas (requieren autenticación) ────────── */}
            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/create-property" element={<CreateProperty />} />
                <Route path="/properties/:id/edit" element={<CreateProperty />} />
                <Route path="/properties/me" element={<MyProperties />} />
                <Route path="/properties/favorites" element={<MyFavoriteProperties />} />
                <Route path="/trashcan" element={<PropertiesTrashCan />} />
                <Route path="/visit-requests" element={<VisitRequests />} />
                <Route path="/property-management" element={<PropertyManagementOptions />} />
                <Route path="/clients" element={<ClientList />} />
                <Route path="/clients/register" element={<RegisterClient />} />
                <Route path="/clients/:id" element={<ClientProfilePage />} />
                <Route path="/clients/:id/edit" element={<EditClient />} />
                <Route path="/agenda" element={<AgendaPage />} />
            </Route>
            <Route 
                path="/admin/approval" 
                element={
                    <ProtectedRoute requiredRole="ADMIN">
                        <PropertyApprovalPage />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
}