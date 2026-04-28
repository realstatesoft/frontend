import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LeadDetailPage from './LeadDetailPage';
import { useLead } from '../../hooks/useLeads';

// Mock del hook useLead
vi.mock('../../hooks/useLeads', () => ({
  useLead: vi.fn(),
}));

const mockLead = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+595981234567',
  source: 'sell_wizard',
  status: 'Nuevo',
  statusColor: '#3b82f6',
  notes: 'Notas de prueba del wizard',
  metadata: {
    address: 'Calle Falsa 123',
    surfaceArea: '150',
    builtArea: '120',
    bedrooms: 3,
    halfBath: 1,
    threeQuarterBath: 1,
    parkingSpaces: 2,
    yearBuilt: '2010',
    kitchenCondition: 'Excelente',
    hasPool: true,
    specialConditions: ['hoa', 'security_system'],
    timeline: 'asap'
  },
  interactions: [
    {
      id: 1,
      type: 'CALL',
      subject: 'Llamada inicial',
      note: 'Interesado en vender pronto',
      createdAt: '2026-04-25T10:00:00Z'
    }
  ]
};

describe('LeadDetailPage', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderWithProviders = (ui) => render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );

  it('debe mostrar el cargando inicialmente', () => {
    useLead.mockReturnValue({ isLoading: true });
    
    renderWithProviders(
      <MemoryRouter initialEntries={['/agent/prospectos/1']}>
        <Routes>
          <Route path="/agent/prospectos/:id" element={<LeadDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Cargando ficha del prospecto/i)).toBeInTheDocument();
  });

  it('debe mostrar el error si falla la carga', () => {
    useLead.mockReturnValue({ error: true, isLoading: false });
    
    renderWithProviders(
      <MemoryRouter initialEntries={['/agent/prospectos/1']}>
        <Routes>
          <Route path="/agent/prospectos/:id" element={<LeadDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByText(/No se pudo cargar el prospecto/i)).toBeInTheDocument();
  });

  it('debe renderizar correctamente los datos del prospecto y el metadata', () => {
    useLead.mockReturnValue({ data: mockLead, isLoading: false });
    
    renderWithProviders(
      <MemoryRouter initialEntries={['/agent/prospectos/1']}>
        <Routes>
          <Route path="/agent/prospectos/:id" element={<LeadDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Verificamos datos básicos
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    
    // Verificamos metadata mapeada
    expect(screen.getByText('150 m²')).toBeInTheDocument();
    expect(screen.getByText('120 m²')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Habitaciones
    
    // Verificamos dirección
    expect(screen.getByText('Calle Falsa 123')).toBeInTheDocument();
    
    // Verificamos Tags de condiciones especiales
    expect(screen.getByText(/hoa/i)).toBeInTheDocument();
    expect(screen.getByText(/security system/i)).toBeInTheDocument();
    
    // Verificamos línea de tiempo
    expect(screen.getByText('Llamada inicial')).toBeInTheDocument();
    expect(screen.getByText('Interesado en vender pronto')).toBeInTheDocument();
  });
});
