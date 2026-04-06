import api from './api';

const messageService = {
  getConversations() {
    return api.get('/messages/conversations').then((res) => res.data);
  },

  getMessages(conversationId) {
    return api.get(`/messages/conversations/${conversationId}`).then((res) => res.data);
  },
};

export default messageService;
