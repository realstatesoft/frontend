// ─── Contract Type ─────────────────────────────────────────────────────────

export const CONTRACT_TYPE = {
  Venta:         'SALE',
  Alquiler:      'RENT',
  'Opción a Compra': 'OPTION_TO_BUY',
};

export const CONTRACT_TYPE_LABELS = Object.fromEntries(
  Object.entries(CONTRACT_TYPE).map(([k, v]) => [v, k])
);

export const CONTRACT_TYPE_OPTIONS = Object.keys(CONTRACT_TYPE);

// ─── Contract Status ────────────────────────────────────────────────────────

export const CONTRACT_STATUS = {
  Borrador:           'DRAFT',
  Enviado:            'SENT',
  'Parcialmente Firmado': 'PARTIALLY_SIGNED',
  Firmado:            'SIGNED',
  Rechazado:          'REJECTED',
  Vencido:            'EXPIRED',
  Cancelado:          'CANCELLED',
};

export const CONTRACT_STATUS_LABELS = Object.fromEntries(
  Object.entries(CONTRACT_STATUS).map(([k, v]) => [v, k])
);

export const CONTRACT_STATUS_OPTIONS = Object.keys(CONTRACT_STATUS);

/** Mapea status → variante de color para el Badge */
export const CONTRACT_STATUS_COLORS = {
  DRAFT:             'neutral',
  SENT:              'info',
  PARTIALLY_SIGNED:  'accent',
  SIGNED:            'success',
  REJECTED:          'danger',
  EXPIRED:           'warning',
  CANCELLED:         'danger',
};

/**
 * Transiciones de estado permitidas para el agente (no admin).
 * key: estado actual → value: array de estados a los que puede pasar.
 */
export const ALLOWED_STATUS_TRANSITIONS = {
  DRAFT:             ['SENT', 'CANCELLED'],
  SENT:              ['PARTIALLY_SIGNED', 'REJECTED', 'CANCELLED'],
  PARTIALLY_SIGNED:  ['SIGNED', 'REJECTED', 'CANCELLED'],
};
