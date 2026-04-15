export const AGENT_TOUR_STEPS = [
  {
    id: 'welcome',
    target: null,
    title: '¡Bienvenido a OpenRoof!',
    content: 'Este es tu panel de agente. Te guiaremos por las funciones principales para que puedas empezar a trabajar rápidamente.',
    placement: 'center',
  },
  {
    id: 'sidebar',
    target: '[data-tour="sidebar"]',
    title: 'Menú de Navegación',
    content: 'Desde aquí accedes a todas las secciones: clientes, propiedades, agenda, ventas, reportes y mensajes.',
    placement: 'right',
  },
  {
    id: 'dashboard-stats',
    target: '[data-tour="dashboard-stats"]',
    title: 'Resumen de Actividad',
    content: 'Aquí ves un vistazo rápido de tus clientes activos, ventas del mes, visitas programadas y comisiones.',
    placement: 'bottom',
  },
  {
    id: 'quick-actions',
    target: '[data-tour="quick-actions"]',
    title: 'Acciones Rápidas',
    content: 'Accede directamente a las tareas más frecuentes: registrar un cliente, agregar una propiedad, o agendar una visita.',
    placement: 'top',
  },
];

export const OWNER_TOUR_STEPS = [
  {
    id: 'welcome',
    target: null,
    title: '¡Bienvenido a tu Panel!',
    content: 'Este es tu panel de propietario. Aquí puedes gestionar tus propiedades, ver visitas recibidas y comunicarte con tu agente.',
    placement: 'center',
  },
  {
    id: 'sidebar',
    target: '[data-tour="sidebar"]',
    title: 'Menú de Navegación',
    content: 'Navega entre tus propiedades, visitas y mensajes desde este menú lateral.',
    placement: 'right',
  },
  {
    id: 'dashboard-stats',
    target: '[data-tour="dashboard-stats"]',
    title: 'Tus Estadísticas',
    content: 'Ve de un vistazo cuántas propiedades tenés publicadas, las visitas recibidas, consultas y vistas totales.',
    placement: 'bottom',
  },
  {
    id: 'quick-actions',
    target: '[data-tour="quick-actions"]',
    title: 'Acciones Rápidas',
    content: 'Publica una nueva propiedad o gestiona las que ya tienes con un solo clic.',
    placement: 'top',
  },
];

export const TOUR_STORAGE_KEY = (tourId) => `openroof_tour_seen_${tourId}`;
