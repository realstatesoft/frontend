const STATUS_CONFIG = {
  PENDING:              { variant: 'warning',   label: 'Pendiente' },
  ACTIVE:               { variant: 'success',   label: 'Activa' },
  CANCELLED:            { variant: 'secondary', label: 'Cancelada' },
  EXPIRED:              { variant: 'dark',      label: 'Expirada' },
  CONVERTED_TO_CONTRACT:{ variant: 'info',      label: 'Convertida a contrato' },
};

export const statusVariant = (status) => STATUS_CONFIG[status]?.variant ?? 'secondary';
export const statusLabel   = (status) => STATUS_CONFIG[status]?.label   ?? status;
