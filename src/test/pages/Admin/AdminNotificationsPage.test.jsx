import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mocks
import notificationApi from '../../../services/notifications/notificationApi';
import AdminNotificationsPage from '../../../pages/Admin/AdminNotificationsPage';

// Mock specific UI child components that usually contain unconnected context logic
vi.mock('../../../components/Landing/Navbar', () => ({
  default: () => <nav data-testid="mock-navbar">Navbar</nav>,
}));

vi.mock('../../../components/Landing/Footer', () => ({
  default: () => <footer data-testid="mock-footer">Footer</footer>,
}));

// Mock the API calls
vi.mock('../../../services/notifications/notificationApi', () => ({
  default: {
    getUnreadCount: vi.fn(),
    getAll: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    deleteAllNotifications: vi.fn(),
  },
}));

// Provide router stubs
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe('AdminNotificationsPage', () => {

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AdminNotificationsPage />
      </MemoryRouter>
    );
  };

  it('renders a loading spinner initially before fetching', () => {
    // Keep it pending
    notificationApi.getAll.mockReturnValue(new Promise(() => {}));
    notificationApi.getUnreadCount.mockReturnValue(new Promise(() => {}));

    renderComponent();

    // The loading text or spinner
    expect(screen.getByText(/Cargando notificaciones.../i)).toBeInTheDocument();
  });

  it('renders empty state correctly when response is empty', async () => {
    notificationApi.getAll.mockResolvedValue({ data: { data: { content: [], totalElements: 0, totalPages: 0 } } });
    notificationApi.getUnreadCount.mockResolvedValue({ data: { data: 0 } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No hay notificaciones')).toBeInTheDocument();
    });
    expect(screen.getByText('Aún no has recibido ninguna notificación.')).toBeInTheDocument();
  });

  it('renders a list of notifications correctly', async () => {
    const mockNotifications = [
      { id: 1, type: 'PROPERTY', title: 'Nueva Propiedad', message: 'Revisa esta casa', read: false, createdAt: '2025-01-01T10:00:00Z' },
      { id: 2, type: 'SYSTEM', title: 'Actualización', message: 'Sistema listo', read: true, createdAt: '2025-01-01T12:00:00Z' }
    ];

    notificationApi.getAll.mockResolvedValue({ 
      data: { data: { content: mockNotifications, totalElements: 2, totalPages: 1 } } 
    });
    notificationApi.getUnreadCount.mockResolvedValue({ data: { data: 1 } });

    renderComponent();

    // Utilizamos findByText para mayor resiliencia en la cola de react
    const title1 = await screen.findByText('Nueva Propiedad');
    expect(title1).toBeInTheDocument();
    
    expect(screen.getByText('Revisa esta casa')).toBeInTheDocument();
    expect(screen.getByText('Actualización')).toBeInTheDocument();
    
    // Simplificamos la comprobación de texto para el caso de notificaciones plurales/singulares
    expect(screen.getByText(/Viendo 2/i)).toBeInTheDocument();
  });

  it('calls marking all as read successfully when header button is clicked', async () => {
    // Definimos múltiples resoluciones consecutivas si es necesario (para el mount y para después del click)
    notificationApi.getAll
      .mockResolvedValueOnce({ 
        data: { data: { content: [{ id: 1, type: 'ALERT', title: 'Warn', message: 'Hello', read: false, createdAt: '2025-01-01T10:00:00Z' }], totalElements: 1, totalPages: 1 } } 
      })
      .mockResolvedValue({ 
        data: { data: { content: [{ id: 1, type: 'ALERT', title: 'Warn', message: 'Hello', read: true, createdAt: '2025-01-01T10:00:00Z' }], totalElements: 1, totalPages: 1 } } 
      });
      
    notificationApi.getUnreadCount
      .mockResolvedValueOnce({ data: { data: 1 } })
      .mockResolvedValue({ data: { data: 0 } });
      
    notificationApi.markAllAsRead.mockResolvedValue({});

    renderComponent();

    // Wait until loaded
    await waitFor(() => {
      expect(screen.getByText('Warn')).toBeInTheDocument();
    });

    // Click the Mark All As Read button
    const markAllBtn = screen.getByText(/Marcar leídas/i);
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(notificationApi.markAllAsRead).toHaveBeenCalledTimes(1);
    });
    // Check success feedback message
    expect(screen.getByText('Todas las notificaciones marcadas como leídas')).toBeInTheDocument();
  });

});
