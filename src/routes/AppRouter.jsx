import { Routes, Route, Navigate } from "react-router-dom";
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

// Agent Dashboard
import AgentLayout from "../components/layout/AgentLayout/AgentLayout";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ClientsPage from "../pages/Clients/ClientsPage";
import AgentPropertiesPage from "../pages/Properties/AgentPropertiesPage";
import AgendaPage from "../pages/Agenda/AgendaPage";
import SalesPage from "../pages/Sales/SalesPage";
import ReportsPage from "../pages/Reports/ReportsPage";
import MessagesPage from "../pages/Messages/MessagesPage";

// Owner Dashboard
import OwnerLayout from "../components/layout/OwnerLayout/OwnerLayout";
import OwnerDashboardPage from "../pages/OwnerDashboard/OwnerDashboardPage";
import OwnerPropertiesPage from "../pages/OwnerProperties/OwnerPropertiesPage";
import OwnerVisitsPage from "../pages/OwnerVisits/OwnerVisitsPage";
import OwnerMessagesPage from "../pages/OwnerMessages/OwnerMessagesPage";
import RoleRedirect from "../components/commons/RoleRedirect";
import UserProfilePage from "../pages/UserProfilePage";
import ProtectedRoute from "./ProtectedRoute";

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
            <Route path="/visit-requests" element={<VisitRequests />} />
            <Route path="/property-management" element={<PropertyManagementOptions />} />
            <Route path="/clients" element={<ClientList />} />

            {/* Agent Dashboard */}
            <Route path="/agent" element={<AgentLayout />}>
                <Route index element={<Navigate to="/agent/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="clientes" element={<ClientsPage />} />
                <Route path="propiedades" element={<AgentPropertiesPage />} />
                <Route path="solicitudes-visita" element={<VisitRequests />} />
                <Route path="agenda" element={<AgendaPage />} />
                <Route path="ventas" element={<SalesPage />} />
                <Route path="reportes" element={<ReportsPage />} />
                <Route path="mensajes" element={<MessagesPage />} />
            </Route>

            {/* Owner Dashboard */}
            <Route path="/owner" element={<OwnerLayout />}>
                <Route index element={<Navigate to="/owner/dashboard" replace />} />
                <Route path="dashboard" element={<OwnerDashboardPage />} />
                <Route path="propiedades" element={<OwnerPropertiesPage />} />
                <Route path="visitas" element={<OwnerVisitsPage />} />
                <Route path="mensajes" element={<OwnerMessagesPage />} />
            </Route>

            {/* Role-based redirect */}
            <Route path="/dashboard" element={<RoleRedirect />} />

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />

            {/* ── Rutas protegidas (requieren autenticación) ────────── */}
            <Route element={<ProtectedRoute />}>
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
        </Routes>
    );
}