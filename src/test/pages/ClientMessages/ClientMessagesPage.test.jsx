import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ClientMessagesPage from '../../../pages/ClientMessages/ClientMessagesPage';
import { AuthProvider } from '../../../context/AuthContext';
import * as useMessagesData from '../../../hooks/useMessagesData';

vi.mock('../../../hooks/useMessagesData');
vi.mock('../../../utils/authToken', () => ({
  getAccessToken: vi.fn(() => 'mock-token'),
  setAccessToken: vi.fn(),
  getRefreshToken: vi.fn(() => 'mock-refresh'),
  setRefreshToken: vi.fn(),
  getUserInfo: vi.fn(() => ({ id: 1, email: 'test@test.com', role: 'USER' })),
  setUserInfo: vi.fn(),
  clearSession: vi.fn(),
  removeAccessToken: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ClientMessagesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state when isLoading is true', () => {
    useMessagesData.useConversations.mockReturnValue({
      data: null,
      isLoading: true
    });

    render(<ClientMessagesPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/cargando mensajes/i)).toBeInTheDocument();
  });

  it('should render page title and subtitle', () => {
    const mockConversations = [
      { id: 1, contactName: 'Agente Juan', lastMessage: 'Hola', timestamp: new Date(), unread: 0 }
    ];
    useMessagesData.useConversations.mockReturnValue({
      data: { data: mockConversations },
      isLoading: false
    });
    useMessagesData.useMessages.mockReturnValue({
      data: { data: [] },
      isLoading: false
    });
    useMessagesData.useSendMessage.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false
    });
    useMessagesData.useMarkAsRead.mockReturnValue({
      mutate: vi.fn()
    });

    render(<ClientMessagesPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Mensajes')).toBeInTheDocument();
    expect(screen.getByText('Comunicación con agentes')).toBeInTheDocument();
  });

  it('should render conversations list with name, last message, and unread count', () => {
    const mockConversations = [
      { id: 1, contactName: 'Agente Juan', lastMessage: 'Hola', timestamp: new Date(), unread: 2 }
    ];
    useMessagesData.useConversations.mockReturnValue({
      data: { data: mockConversations },
      isLoading: false
    });
    useMessagesData.useMessages.mockReturnValue({
      data: { data: [] },
      isLoading: false
    });
    useMessagesData.useSendMessage.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false
    });
    useMessagesData.useMarkAsRead.mockReturnValue({
      mutate: vi.fn()
    });

    render(<ClientMessagesPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Agente Juan')).toBeInTheDocument();
    expect(screen.getByText('Hola')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render empty state when no conversations exist', () => {
    useMessagesData.useConversations.mockReturnValue({
      data: { data: [] },
      isLoading: false
    });
    useMessagesData.useMessages.mockReturnValue({
      data: { data: [] },
      isLoading: false
    });
    useMessagesData.useSendMessage.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false
    });
    useMessagesData.useMarkAsRead.mockReturnValue({
      mutate: vi.fn()
    });

    render(<ClientMessagesPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/no hay conversaciones/i)).toBeInTheDocument();
  });

  it('should render empty conversation panel when no conversation is selected', () => {
    const mockConversations = [
      { id: 1, contactName: 'Agente Juan', lastMessage: 'Hola', timestamp: new Date(), unread: 0 }
    ];
    useMessagesData.useConversations.mockReturnValue({
      data: { data: mockConversations },
      isLoading: false
    });
    useMessagesData.useMessages.mockReturnValue({
      data: { data: [] },
      isLoading: false
    });
    useMessagesData.useSendMessage.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false
    });
    useMessagesData.useMarkAsRead.mockReturnValue({
      mutate: vi.fn()
    });

    render(<ClientMessagesPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/selecciona una conversación para comenzar a chatear/i)).toBeInTheDocument();
  });
});
