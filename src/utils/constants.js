export const AGENT_ROUTES = {
  DASHBOARD: '/agent/dashboard',
  CLIENTS: '/agent/clientes',
  PROPERTIES: '/agent/propiedades',
  VISIT_REQUESTS: '/agent/solicitudes-visita',
  AGENDA: '/agent/agenda',
  SALES: '/agent/ventas',
  REPORTS: '/agent/reportes',
  MESSAGES: '/agent/mensajes',
  CREATE_PROPERTY: '/create-property',
  REGISTER_CLIENT: '/clients/register',
};

export const OWNER_ROUTES = {
  DASHBOARD: '/owner/dashboard',
  PROPERTIES: '/owner/propiedades',
  VISITS: '/owner/visitas',
  MESSAGES: '/owner/mensajes',
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
