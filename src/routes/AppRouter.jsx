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
import ClientMessagesPage from "../pages/ClientMessages/ClientMessagesPage";
import MyReservationsPage from "../pages/MyReservations/MyReservationsPage";
import PropertyManagementOptions from "../pages/PropertyManagementOptions/PropertyManagementOptions";
import ClientList from "../pages/ClientList/ClientList";
import AgentProfilePage from "../pages/Agents/AgentProfilePage";
import AgentEditPage from "../pages/Agents/AgentEditPage";
import AgentSearchPage from "../pages/Agents/AgentSearchPage";
import PublicAgentProfilePage from "../pages/Agents/PublicAgentProfilePage";
// Agent Dashboard
import AgentLayout from "../components/layout/AgentLayout/AgentLayout";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ClientsPage from "../pages/clients/ClientsPage";
import AgentPropertiesPage from "../pages/properties/AgentPropertiesPage";
import AgendaPage from "../pages/Agenda/AgendaPage";
import SalesPage from "../pages/Sales/SalesPage";
import ReportsPage from "../pages/Reports/ReportsPage";
import MessagesPage from "../pages/Messages/MessagesPage";
import ContractsPage from "../pages/Contracts/ContractsPage";
import ContractCreatePage from "../pages/Contracts/ContractCreatePage";
import ContractEditPage from "../pages/Contracts/ContractEditPage";
import ContractDetailPage from "../pages/Contracts/ContractDetailPage";
import OfferManagementPage from "../pages/Offers/OfferManagementPage";
import AgentLeadsPage from "../pages/AgentLeads/AgentLeadsPage";
import LeadDetailPage from "../pages/Leads/LeadDetailPage";

// Owner Dashboard
import OwnerLayout from "../components/layout/OwnerLayout/OwnerLayout";
import OwnerDashboardPage from "../pages/OwnerDashboard/OwnerDashboardPage";
import OwnerMessagesPage from "../pages/OwnerMessages/OwnerMessagesPage";
import OwnerReservationsPage from "../pages/OwnerReservations/OwnerReservationsPage";
import AgentReservationsPage from "../pages/AgentReservations/AgentReservationsPage";
import RoleRedirect from "../components/commons/RoleRedirect";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import UserProfilePage from "../pages/UserProfilePage";
import PropertyApprovalPage from "../pages/Admin/PropertyApprovalPage";
import AdminDashboardPage from "../pages/Admin/AdminDashboardPage";
import AdminLayout from "../components/layout/AdminLayout/AdminLayout";
import AdminNotificationsPage from "../pages/Admin/AdminNotificationsPage";
import AdminAuditLogsPage from "../pages/Admin/AdminAuditLogsPage";
import FlagsPage from "../pages/Admin/Flags/FlagsPage";
import PreferencesPage from "../pages/PreferencesPage";

import AdminDocumentsPage from "../pages/Admin/AdminDocumentsPage";
import RentConfigPage from "../pages/Admin/RentConfig/RentConfigPage";
import AdminContractTemplatesPage from "../pages/Admin/AdminContractTemplatesPage";

export default function AppRouter() {
    return (
        <Routes>
            {/* -- Rutas públicas -------------------------------------- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/sell" element={<SellWizardPage />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<ShowProperty />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/:id" element={<PublicAgentProfilePage />} />
            <Route path="/AgentSearch" element={<AgentSearchPage />} />

            {/* -- Rutas protegidas (requieren autenticación) ---------- */}
            <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/create-property" element={<CreateProperty />} />
                <Route path="/properties/:id/edit" element={<CreateProperty />} />
                <Route path="/properties/me" element={<MyProperties />} />
                <Route path="/properties/favorites" element={<MyFavoriteProperties />} />
                <Route path="/preferences" element={<PreferencesPage />} />
                <Route path="/reservations" element={<MyReservationsPage />} />
                <Route path="/trashcan" element={<PropertiesTrashCan />} />
                <Route path="/visit-requests" element={<VisitRequests />} />
                <Route path="/property-management" element={<PropertyManagementOptions />} />
                <Route path="/contratos/nuevo" element={<ContractCreatePage />} />
                <Route path="/clientes" element={<ClientList />} />
                <Route path="/clientes/registrar" element={<RegisterClient />} />
                <Route path="/clientes/:id" element={<ClientProfilePage />} />
                <Route path="/clientes/:id/editar" element={<EditClient />} />
                <Route path="/mensajes" element={<ClientMessagesPage />} />
                <Route path="/contratos/:id" element={<ContractDetailPage />} />
                <Route path="/ofertas" element={<OfferManagementPage />} />
                <Route path="/owner/reservations" element={<OwnerReservationsPage />} />
            </Route>

            {/* -- Rutas protegidas (Agent) ------------------------- */}
            <Route element={<ProtectedRoute requiredRole="AGENT" />}>
                <Route path="/agent" element={<AgentLayout />}>
                    <Route index element={<Navigate to="/agent/dashboard" replace />} />
                    <Route path="perfil" element={<AgentProfilePage />} />
                    <Route path="editar-perfil/:id" element={<AgentEditPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="clientes" element={<ClientsPage />} />
                    <Route path="propiedades" element={<AgentPropertiesPage />} />
                    <Route path="solicitudes-visita" element={<VisitRequests />} />
                    <Route path="agenda" element={<AgendaPage />} />
                    <Route path="ventas" element={<SalesPage />} />
                    <Route path="contratos" element={<ContractsPage />} />
                    <Route path="contratos/nuevo" element={<ContractCreatePage />} />
                    <Route path="contratos/:id" element={<ContractDetailPage />} />
                    <Route path="contratos/:id/editar" element={<ContractEditPage />} />
                    <Route path="reportes" element={<ReportsPage />} />
                    <Route path="mensajes" element={<MessagesPage />} />
                    <Route path="ofertas" element={<OfferManagementPage />} />
                    <Route path="leads" element={<AgentLeadsPage />} />
                    <Route path="reservas" element={<AgentReservationsPage />} />
                    <Route path="prospectos/:id" element={<LeadDetailPage />} />
                </Route>
            </Route>

            {/* -- Rutas protegidas (Owner) ------------------------- */}
            <Route element={<ProtectedRoute requiredRole={["OWNER", "USER"]} />}>
                <Route path="/owner" element={<OwnerLayout />}>
                    <Route index element={<Navigate to="/owner/dashboard" replace />} />
                    <Route path="dashboard" element={<OwnerDashboardPage />} />
                    <Route path="propiedades" element={<MyProperties hideNavbar={true} />} />
                    <Route path="visitas" element={<VisitRequests mode="OWNER" />} />
                    <Route path="mensajes" element={<OwnerMessagesPage />} />
                    <Route path="ofertas" element={<OfferManagementPage />} />
                    <Route path="contratos" element={<ContractsPage />} />
                    <Route path="contratos/nuevo" element={<ContractCreatePage />} />
                    <Route path="contratos/:id" element={<ContractDetailPage />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
                {/* Role-based redirect */}
                <Route path="/dashboard" element={<RoleRedirect />} />

                {/* Admin Dashboard */}
            </Route>

            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="approval" element={<PropertyApprovalPage />} />
                    <Route path="notifications" element={<AdminNotificationsPage />} />
                    <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                    <Route path="flags" element={<FlagsPage />} />
                    <Route path="documents" element={<AdminDocumentsPage />} />
                    <Route path="rent-config" element={<RentConfigPage />} />
                    <Route path="contract-templates" element={<AdminContractTemplatesPage />} />
                </Route>
            </Route>


            {/* Canonical 404 handler */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
