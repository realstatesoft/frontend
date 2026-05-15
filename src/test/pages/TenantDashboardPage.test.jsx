import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import TenantDashboardPage from '../../pages/TenantDashboard/TenantDashboardPage';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';

// Mock del hook useTenantDashboard
vi.mock('../../hooks/useTenantDashboard', () => ({
  useTenantDashboard: vi.fn()
}));

// Mock de useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { name: 'Test User' },
    isAuthenticated: true
  })
}));

// Mock de i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue, vars) => {
      if (typeof defaultValue === 'string' && vars) {
        let result = defaultValue;
        Object.entries(vars).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, v);
        });
        return result;
      }
      if (typeof defaultValue === 'string') return defaultValue;
      return key;
    },
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../../hooks/useFormatters', () => ({
  default: () => ({
    formatCurrency: (amount, currency = 'USD') => `$ ${amount ?? 0}`,
    formatDate: (date) => date || '--/--/----',
  }),
}));

describe('TenantDashboardPage', () => {
  it('debe mostrar el estado de carga inicialmente', () => {
    useTenantDashboard.mockReturnValue({
      isLoading: true
    });

    render(
      <MemoryRouter>
        <TenantDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toBeDefined();
  });

  it('debe mostrar el mensaje de inactividad si no hay contrato', () => {
    useTenantDashboard.mockReturnValue({
      isLoading: false,
      data: {
        status: 'INACTIVE',
        statusMessage: 'No tienes un arriendo activo'
      }
    });

    render(
      <MemoryRouter>
        <TenantDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/No tienes un arriendo activo/)).toBeDefined();
  });

  it('debe mostrar la información del dashboard si el inquilino está activo', () => {
    useTenantDashboard.mockReturnValue({
      isLoading: false,
      data: {
        status: 'ACTIVE',
        activeLeases: [{
          propertyTitle: 'Propiedad de Prueba',
          propertyAddress: 'Calle Falsa 123',
          landlordName: 'Dueño Test',
          daysRemaining: 45,
          monthlyRent: 1500,
          currency: 'USD'
        }],
        pendingBalance: 0,
        unreadMessages: 2,
        openMaintenanceTickets: 1,
        totalPaidLastYear: 18000,
        recentInstallments: [],
        recentMaintenanceTickets: []
      }
    });

    render(
      <MemoryRouter>
        <TenantDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Propiedad de Prueba/)).toBeDefined();
    expect(screen.getByText(/Dueño Test/)).toBeDefined();
    expect(screen.getByText(/45/)).toBeDefined(); // Días restantes
  });
});
