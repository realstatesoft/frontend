import api from './api';

const messageService = {
  getConversations() {
    return api.get('/messages/conversations').then((res) => res.data);
  },

  getMessages(conversationId) {
    return api.get(`/messages/conversations/${conversationId}`).then((res) => res.data);
  },

  sendMessage(receiverId, content, propertyId = null) {
    return api.post('/messages', {
      receiverId,
      content,
      propertyId
    }).then((res) => res.data);
  },

  markAsRead(conversationId) {
    return api.put(`/messages/conversations/${conversationId}/read`);
  },
};

export default messageService;
