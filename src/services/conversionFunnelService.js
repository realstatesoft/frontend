import api from './api';

const BASE = '/dashboard/agent/conversion-funnel';

function buildParams(filters) {
  const params = {
    from: filters.from,
    to: filters.to,
    granularity: filters.granularity ?? 'MONTH',
    comparePrevious: filters.comparePrevious !== false,
  };
  if (filters.locationId != null && filters.locationId !== '') {
    params.locationId = Number(filters.locationId);
  }
  if (filters.propertyType) params.propertyType = filters.propertyType;
  if (filters.minPrice != null && filters.minPrice !== '') params.minPrice = filters.minPrice;
  if (filters.maxPrice != null && filters.maxPrice !== '') params.maxPrice = filters.maxPrice;
  return params;
}

function unwrap(r) {
  const body = r?.data;
  if (body && typeof body.success === 'boolean' && 'data' in body) return body.data;
  return body;
}

const conversionFunnelService = {
  getSummary(filters) {
    return api.get(`${BASE}/summary`, { params: buildParams(filters) }).then(unwrap);
  },
  getTopProperties(filters, page = 0, size = 10) {
    return api
      .get(`${BASE}/top-properties`, {
        params: { ...buildParams(filters), page, size },
      })
      .then(unwrap);
  },
};

export default conversionFunnelService;
