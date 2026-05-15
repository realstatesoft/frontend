import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

// ─── Auth guards (lightweight, always needed) ───────────────────────────────
import RoleRedirect from "../components/commons/RoleRedirect";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// ─── Lazy-loaded routes (code-split) ────────────────────────────────────────
const LandingPage = lazy(() => import("../pages/LandingPage"));
const PropertiesPage = lazy(() => import("../pages/PropertiesPage"));
const ShowProperty = lazy(() => import("../pages/ShowProperty/ShowProperty"));
const LogIn = lazy(() => import("../pages/Login/LogIn"));
const SignUp = lazy(() => import("../pages/SignUp"));
const AgentSignUp = lazy(() => import("../pages/AgentSignUp"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const AgentsPage = lazy(() => import("../pages/AgentsPage"));
const PublicAgentProfilePage = lazy(() => import("../pages/Agents/PublicAgentProfilePage"));
const AgentSearchPage = lazy(() => import("../pages/Agents/AgentSearchPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

const PropertyComparePage = lazy(() => import("../pages/PropertyComparePage"));
const PropertiesTrashCan = lazy(() => import("../pages/PropertiesTrashCan/PropertiesTrashCan"));
const CreateProperty = lazy(() => import("../pages/properties/CreateProperty"));
const MyProperties = lazy(() => import("../pages/ShowProperty/MyProperties"));
const MyFavoriteProperties = lazy(() => import("../pages/ShowProperty/MyFavoriteProperties"));
const SellWizardPage = lazy(() => import("../pages/sell/SellWizardPage"));
const VisitRequests = lazy(() => import("../pages/VisitRequests"));
const ClientProfilePage = lazy(() => import("../pages/ClientProfilePage"));
const RegisterClient = lazy(() => import("../pages/clients/RegisterClient"));
const EditClient = lazy(() => import("../pages/clients/EditClient"));
const ClientMessagesPage = lazy(() => import("../pages/ClientMessages/ClientMessagesPage"));
const MyReservationsPage = lazy(() => import("../pages/MyReservations/MyReservationsPage"));
const PropertyManagementOptions = lazy(() => import("../pages/PropertyManagementOptions/PropertyManagementOptions"));
const ClientList = lazy(() => import("../pages/ClientList/ClientList"));
const AgentProfilePage = lazy(() => import("../pages/Agents/AgentProfilePage"));
const AgentEditPage = lazy(() => import("../pages/Agents/AgentEditPage"));
const UserProfilePage = lazy(() => import("../pages/UserProfilePage"));
const PreferencesPage = lazy(() => import("../pages/PreferencesPage"));
const PaymentPage = lazy(() => import("../pages/Payment/PaymentPage"));
const MyPaymentsPage = lazy(() => import("../pages/MyPayments/MyPaymentsPage"));

// Tenant Dashboard
const TenantLayout = lazy(() => import("../components/layout/TenantLayout/TenantLayout"));
const TenantDashboardPage = lazy(() => import("../pages/TenantDashboard/TenantDashboardPage"));
const TenantLeasePage = lazy(() => import("../pages/TenantDashboard/TenantLeasePage"));
const TenantLeaseDetailPage = lazy(() => import("../pages/TenantDashboard/TenantLeaseDetailPage"));
const TenantMaintenancePage = lazy(() => import("../pages/TenantDashboard/Maintenance/TenantMaintenancePage"));
const TenantPaymentsPage = lazy(() => import("../pages/TenantDashboard/Payments/TenantPaymentsPage"));


// Agent Dashboard (chunk-agent)
const AgentLayout = lazy(() => import("../components/layout/AgentLayout/AgentLayout"));
const DashboardPage = lazy(() => import("../pages/Dashboard/DashboardPage"));
const ClientsPage = lazy(() => import("../pages/clients/ClientsPage"));
const AgentPropertiesPage = lazy(() => import("../pages/properties/AgentPropertiesPage"));
const AgendaPage = lazy(() => import("../pages/Agenda/AgendaPage"));
const SalesPage = lazy(() => import("../pages/Sales/SalesPage"));
const ReportsPage = lazy(() => import("../pages/Reports/ReportsPage"));
const ConversionFunnelPage = lazy(() => import("../pages/ConversionFunnel/ConversionFunnelPage"));
const MessagesPage = lazy(() => import("../pages/Messages/MessagesPage"));
const ContractsPage = lazy(() => import("../pages/Contracts/ContractsPage"));
const ContractCreatePage = lazy(() => import("../pages/Contracts/ContractCreatePage"));
const ContractEditPage = lazy(() => import("../pages/Contracts/ContractEditPage"));
const ContractDetailPage = lazy(() => import("../pages/Contracts/ContractDetailPage"));
const OfferManagementPage = lazy(() => import("../pages/Offers/OfferManagementPage"));
const AgentLeadsPage = lazy(() => import("../pages/AgentLeads/AgentLeadsPage"));
const LeadDetailPage = lazy(() => import("../pages/Leads/LeadDetailPage"));
const AgentReservationsPage = lazy(() => import("../pages/AgentReservations/AgentReservationsPage"));
const LeasePaymentsPage = lazy(() => import("../pages/Contracts/LeasePaymentsPage"));

// Owner Dashboard (chunk-owner)
const OwnerLayout = lazy(() => import("../components/layout/OwnerLayout/OwnerLayout"));
const OwnerDashboardPage = lazy(() => import("../pages/OwnerDashboard/OwnerDashboardPage"));
const OwnerMessagesPage = lazy(() => import("../pages/OwnerMessages/OwnerMessagesPage"));
const OwnerReservationsPage = lazy(() => import("../pages/OwnerReservations/OwnerReservationsPage"));

// Admin Dashboard (chunk-admin)
const AdminLayout = lazy(() => import("../components/layout/AdminLayout/AdminLayout"));
const AdminDashboardPage = lazy(() => import("../pages/Admin/AdminDashboardPage"));
const PropertyApprovalPage = lazy(() => import("../pages/Admin/PropertyApprovalPage"));
const AdminNotificationsPage = lazy(() => import("../pages/Admin/AdminNotificationsPage"));
const AdminAuditLogsPage = lazy(() => import("../pages/Admin/AdminAuditLogsPage"));
const FlagsPage = lazy(() => import("../pages/Admin/Flags/FlagsPage"));
const AdminDocumentsPage = lazy(() => import("../pages/Admin/AdminDocumentsPage"));
const RentConfigPage = lazy(() => import("../pages/Admin/RentConfig/RentConfigPage"));
const AdminContractTemplatesPage = lazy(() => import("../pages/Admin/AdminContractTemplatesPage"));
const AdminPaymentsPage = lazy(() => import("../pages/Admin/AdminPaymentsPage"));

const AdminSettingsPage = lazy(() => import("../pages/Admin/Settings/AdminSettingsPage"));
const AgentSettingsPage = lazy(() => import("../pages/AgentSettings/AgentSettingsPage"));
const UserSettingsPage = lazy(() => import("../pages/UserSettings/UserSettingsPage"));

// ─── Suspense fallback ──────────────────────────────────────────────────────
function PageLoader() {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Spinner animation="border" variant="primary" />
        </div>
    );
}

export default function AppRouter() {
    return (
        <Suspense fallback={<PageLoader />}>
        <Routes>
            {/* -- Rutas públicas -------------------------------------- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/sell" element={<SellWizardPage />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signup/agent" element={<AgentSignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/compare" element={<PropertyComparePage />} />
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
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/my-payments" element={<MyPaymentsPage />} />
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

                <Route path="/tenant" element={<TenantLayout />}>
                    <Route index element={<Navigate to="/tenant/dashboard" replace />} />
                    <Route path="dashboard" element={<TenantDashboardPage />} />
                    <Route path="lease" element={<TenantLeasePage />} />
                    <Route path="lease/:id" element={<TenantLeaseDetailPage />} />
                    <Route path="maintenance" element={<TenantMaintenancePage />} />
                    <Route path="payments" element={<TenantPaymentsPage />} />
                </Route>
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
                    <Route path="contratos/:id/pagos" element={<LeasePaymentsPage />} />
                    <Route path="contratos/:id/editar" element={<ContractEditPage />} />
                    <Route path="reportes" element={<ReportsPage />} />
                    <Route path="reportes/embudo" element={<ConversionFunnelPage />} />
                    <Route path="mensajes" element={<MessagesPage />} />
                    <Route path="ofertas" element={<OfferManagementPage />} />
                    <Route path="leads" element={<AgentLeadsPage />} />
                    <Route path="leads/:id" element={<LeadDetailPage />} />
                    <Route path="reservas" element={<AgentReservationsPage />} />
                    <Route path="prospectos/:id" element={<LeadDetailPage />} />
                    <Route path="settings" element={<AgentSettingsPage />} />
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
                    <Route path="contratos/:id/pagos" element={<LeasePaymentsPage />} />
                    <Route path="reservations" element={<OwnerReservationsPage />} />
                    <Route path="settings" element={<UserSettingsPage />} />
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
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="contract-templates" element={<AdminContractTemplatesPage />} />
                    <Route path="payments" element={<AdminPaymentsPage />} />
                </Route>
            </Route>


            {/* Canonical 404 handler */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
    );
}
