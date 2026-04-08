import api from './api';

const reportService = {
  getSummary() {
    return api.get('/dashboard/reports/summary').then((res) => res.data);
  },
};

export default reportService;
