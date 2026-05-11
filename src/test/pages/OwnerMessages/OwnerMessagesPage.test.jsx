import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../../i18n';
import OwnerMessagesPage from '../../../pages/OwnerMessages/OwnerMessagesPage';
import * as useMessagesData from '../../../hooks/useMessagesData';

vi.mock('../../../hooks/useMessagesData');
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, role: 'OWNER' }, isAuthenticated: true }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }) => (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

describe('OwnerMessagesPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await initializeI18n();
  });

  it('should render loading state', () => {
    useMessagesData.useConversations.mockReturnValue({
      data: null,
      isLoading: true
    });

    render(<OwnerMessagesPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('should render conversations list', () => {
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

    render(<OwnerMessagesPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Agente Juan')).toBeInTheDocument();
  });

  it('should render empty state when no conversations', () => {
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

    render(<OwnerMessagesPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/no hay conversaciones/i)).toBeInTheDocument();
  });
});