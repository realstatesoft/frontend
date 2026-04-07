import api from './api';

const reportService = {
  getSummary() {
    return api.get('/dashboard/reports/summary').then((res) => res.data);
  },
  exportAgentReport() {
    return api.get('/dashboard/agent/report/export', { responseType: 'blob' });
  },
};

export default reportService;
