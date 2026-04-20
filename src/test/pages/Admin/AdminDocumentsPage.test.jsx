import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDocumentsPage from '../../../pages/Admin/AdminDocumentsPage';
import api from '../../../services/api';

vi.mock('react-bootstrap', async () => {
  const actual = await vi.importActual('react-bootstrap');
  const MockModal = ({ show, children }) => (show ? <div data-testid="mock-modal">{children}</div> : null);
  MockModal.Header = ({ children }) => <div>{children}</div>;
  MockModal.Title = ({ children }) => <div>{children}</div>;
  MockModal.Body = ({ children }) => <div>{children}</div>;

  return {
    ...actual,
    Modal: MockModal,
  };
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, role: 'ADMIN' }, isAuthenticated: true }),
}));

const mockDocs = [
  {
    id: 1,
    userId: 10,
    userName: 'John Doe',
    userEmail: 'john@test.com',
    documentType: 'ID_FRONT',
    documentStatus: 'PENDING',
    filename: 'id.jpg',
    size: 1024,
    createdAt: '2024-01-01T10:00:00Z',
    url: 'http://test.com/id.jpg',
  },
];

vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('AdminDocumentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a list of user requests and opens the details modal', async () => {
    api.get.mockResolvedValue({
      data: {
        success: true,
        data: { content: mockDocs, last: true },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminDocumentsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Verificaci.n de Identidad/i)).toBeInTheDocument();
    expect(await screen.findByText('John Doe')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Revisar perfil'));

    const modal = await screen.findByTestId('mock-modal');
    expect(within(modal).getByText(/Revisi.n de Solicitud/i)).toBeInTheDocument();
    expect(within(modal).getByText(/C.dula.+Frente/i)).toBeInTheDocument();
  });
});
