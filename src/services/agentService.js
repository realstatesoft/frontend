import api from './api';

const agentService = {
  getStats() {
    return api.get('/dashboard/agent/stats').then((res) => res.data);
  },
};

export default agentService;
