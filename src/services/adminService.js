import api from './api';

const adminService = {
  getDashboardOverview() {
    return api.get('/admin/dashboard').then((res) => res.data);
  },
};

export default adminService;
