const ALLOWED_TYPES = ['RESERVATION', 'CONTRACT', 'PROPERTY_HIGHLIGHT', 'SUBSCRIPTION', 'OTHER'];

// redirectUrl, cancelUrl y concept se derivan del type en PaymentPage,
// así no viajan como query params. Los que dependen de datos dinámicos son funciones.
export const PAYMENT_TYPE_DEFAULTS = {
  RESERVATION:        { redirectUrl: '/',              cancelUrl: (_id) => '/',              concept: () => 'Reserva' },
  CONTRACT:           { redirectUrl: '/contracts',     cancelUrl: (_id) => '/contracts',     concept: () => 'Contrato' },
  PROPERTY_HIGHLIGHT: { redirectUrl: '/properties/me', cancelUrl: (_id) => '/properties/me', concept: (planLabel) => `Destacar propiedad – Plan ${planLabel}` },
  SUBSCRIPTION:       { redirectUrl: '/subscriptions',  cancelUrl: (_id) => '/subscriptions', concept: (planLabel) => planLabel ? `Suscripción – ${planLabel}` : 'Suscripción' },
  OTHER:              { redirectUrl: '',               cancelUrl: (_id) => '',               concept: () => '' },
};

export function buildPaymentUrl({
  amount,
  description = '',
  type = 'OTHER',
  referenceId = '',
  planLabel = '',
  planDays = null,
  concept = '',
} = {}) {
  if (!ALLOWED_TYPES.includes(type)) {
    throw new Error(`Invalid payment type "${type}". Allowed: ${ALLOWED_TYPES.join(', ')}`);
  }

  const params = new URLSearchParams();
  params.set('amount', String(amount ?? 0));
  params.set('type', type);
  if (description) params.set('description', description);
  if (referenceId) params.set('referenceId', String(referenceId));
  if (planLabel) params.set('planLabel', planLabel);
  if (planDays) params.set('planDays', String(planDays));
  if (concept) params.set('concept', concept);

  return `/payment?${params.toString()}`;
}
