import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import OwnerDashboardPage from './OwnerDashboardPage';
import useOwnerOverview from '../../hooks/useOwnerOverview';

// Mock del hook
vi.mock('../../hooks/useOwnerOverview');

describe('OwnerDashboardPage', () => {
  it('debe mostrar el estado de carga', () => {
    useOwnerOverview.mockReturnValue({ isLoading: true });
    render(
      <MemoryRouter>
        <OwnerDashboardPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Cargando dashboard.../i)).toBeInTheDocument();
  });

  it('debe renderizar el dashboard con estadísticas y datos', () => {
    const mockData = {
      data: {
        stats: {
          myProperties: { value: 5 },
          totalVisits: { value: 10 },
          inquiries: { value: 2 },
          totalEarnings: { value: 5000 }
        },
        recentProperties: [
          { id: 1, title: 'Casa Test', propertyType: 'Residencial', price: 100000, mainImageUrl: null }
        ],
        urgentContracts: [],
        pendingVisits: [
          { id: 1, propertyTitle: 'Propiedad de Visita', visitorName: 'Juan Pérez', proposedAt: '2026-05-20T10:00:00' }
        ]
      }
    };
    
    useOwnerOverview.mockReturnValue({ 
      data: { data: mockData.data }, 
      isLoading: false 
    });

    render(
      <MemoryRouter>
        <OwnerDashboardPage />
      </MemoryRouter>
    );

    // Header y Stats
    expect(screen.getByText('Mi Panel')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Propiedades
    expect(screen.getByText('10')).toBeInTheDocument(); // Visitas
    
    // Listas
    expect(screen.getByText('Casa Test')).toBeInTheDocument();
    expect(screen.getByText('Propiedad de Visita')).toBeInTheDocument();
    expect(screen.getByText('Visitas pendientes')).toBeInTheDocument();
    expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
  });

  it('debe mostrar la alerta de visitas pendientes cuando no hay contratos urgentes', () => {
    const mockData = {
      data: {
        stats: {},
        recentProperties: [],
        urgentContracts: [],
        pendingVisits: [{ id: 1 }]
      }
    };
    
    useOwnerOverview.mockReturnValue({ 
      data: { data: mockData.data }, 
      isLoading: false 
    });

    render(
      <MemoryRouter>
        <OwnerDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Tienes 1 solicitud\(es\) de visita esperando respuesta/i)).toBeInTheDocument();
  });

  it('debe priorizar alertas de contratos urgentes sobre visitas', () => {
    const mockData = {
      data: {
        stats: {},
        recentProperties: [],
        urgentContracts: [{ id: 101 }],
        pendingVisits: [{ id: 1 }]
      }
    };
    
    useOwnerOverview.mockReturnValue({ 
      data: { data: mockData.data }, 
      isLoading: false 
    });

    render(
      <MemoryRouter>
        <OwnerDashboardPage />
      </MemoryRouter>
    );

    // Alerta de contrato (Acción requerida)
    expect(screen.getByText(/Acción requerida/i)).toBeInTheDocument();
    expect(screen.getByText(/pendiente\(s\) de tu firma digital/i)).toBeInTheDocument();
    
    // No debería estar la de visitas (porque el componente hace !hasUrgentContracts && hasPendingVisits)
    expect(screen.queryByText(/Nuevas visitas/i)).not.toBeInTheDocument();
  });
});
