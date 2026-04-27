const ALLOWED_TYPES = ['RESERVATION', 'CONTRACT', 'PROPERTY_HIGHLIGHT', 'SUBSCRIPTION', 'OTHER'];

/**
 * Builds the query string for navigating to /payment.
 *
 * @param {object} params
 * @param {number|string} params.amount
 * @param {string} params.concept
 * @param {string} [params.description]
 * @param {string} [params.type]          - one of ALLOWED_TYPES
 * @param {string} [params.redirectUrl]   - must be a relative path
 * @param {string} [params.cancelUrl]     - must be a relative path
 * @returns {string} full path including query string, e.g. "/payment?amount=..."
 */
export function buildPaymentUrl({
  amount,
  concept,
  description = '',
  type = 'OTHER',
  redirectUrl = '',
  cancelUrl = '',
} = {}) {
  if (!ALLOWED_TYPES.includes(type)) {
    throw new Error(`Invalid payment type "${type}". Allowed: ${ALLOWED_TYPES.join(', ')}`);
  }

  const params = new URLSearchParams();
  params.set('amount', String(amount ?? 0));
  params.set('concept', concept ?? '');
  params.set('type', type);
  if (description) params.set('description', description);
  if (redirectUrl) params.set('redirectUrl', redirectUrl);
  if (cancelUrl) params.set('cancelUrl', cancelUrl);

  return `/payment?${params.toString()}`;
}
