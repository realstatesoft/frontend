export const AGENT_ROUTES = {
  DASHBOARD: '/agent/dashboard',
  CLIENTS: '/agent/clientes',
  PROPERTIES: '/agent/propiedades',
  VISIT_REQUESTS: '/agent/solicitudes-visita',
  LEADS: '/agent/leads',
  AGENDA: '/agent/agenda',
  SALES: '/agent/ventas',
  CONTRACTS: '/agent/contratos',
  REPORTS: '/agent/reportes',
  MESSAGES: '/agent/mensajes',
  OFFERS: '/agent/ofertas',
  CREATE_PROPERTY: '/create-property',
  REGISTER_CLIENT: '/clientes/registrar',
};

export const OWNER_ROUTES = {
  DASHBOARD: '/owner/dashboard',
  PROPERTIES: '/owner/propiedades',
  VISITS: '/owner/visitas',
  MESSAGES: '/owner/mensajes',
  OFFERS: '/owner/ofertas',
  CONTRACTS: '/owner/contratos',
};

export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  APPROVAL: '/admin/approval',
  AUDIT_LOGS: '/admin/audit-logs',
  FLAGS: '/admin/flags',
  DOCUMENTS: '/admin/documents',
  RENT_CONFIG: '/admin/rent-config',
  CONTRACT_TEMPLATES: '/admin/contract-templates',
};

export const STATUS_COLORS = {
  activo: 'success',
  active: 'success',
  pendiente: 'warning',
  pending: 'warning',
  inactivo: 'danger',
  inactive: 'danger',
  completado: 'info',
  completed: 'info',
  cancelado: 'danger',
  cancelled: 'danger',
  en_proceso: 'accent',
  in_progress: 'accent',
};

export const APPOINTMENT_COLORS = {
  visita: '#6c63ff',
  reunion: '#00d4aa',
  llamada: '#ffb547',
  visit: '#6c63ff',
  meeting: '#00d4aa',
  call: '#ffb547',
};