import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mocks
import { useAuth } from '../../../hooks/useAuth';
import agentApi from '../../../services/agents/agentApi';
import AgentProfilePage from '../../../pages/Agents/AgentProfilePage';

// Mock the modules explicitly
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../services/agents/agentApi', () => ({
  default: {
    getAgentById: vi.fn(),
  },
}));

describe('AgentProfilePage', () => {

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AgentProfilePage />
      </MemoryRouter>
    );
  };

  it('renders a denegated access fallback if user id is missing', () => {
    useAuth.mockReturnValue({ user: null }); // Missing user userId

    renderComponent();

    expect(screen.getByText(/Acceso denegado/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No se pudo resolver tu identificador personal/i)
    ).toBeInTheDocument();
  });

  it('renders a loading spinner initially when agent id is correctly resolved', () => {
    useAuth.mockReturnValue({ user: { userId: 123 } });
    
    // Defer the promise forever to keep it in loading state
    agentApi.getAgentById.mockReturnValue(new Promise(() => {}));

    const { container } = renderComponent();

    // Check for spinner class (react-bootstrap default classes)
    const spinner = container.querySelector('.spinner-border');
    expect(spinner).toBeInTheDocument();
  });

  it('renders agent profile data gracefully upon successful API response', async () => {
    useAuth.mockReturnValue({ user: { userId: 123 } });

    // Mock realistic API payload format
    agentApi.getAgentById.mockResolvedValue({
      data: {
        userName: 'Carlos Agente Test',
        userPhone: '+595999000123',
        experienceYears: 6,
        bio: 'Líder en ventas inmobiliarias.',
        specialties: [{ id: 1, name: 'Comercial' }, { id: 2, name: 'Residencial' }],
        userAvatarUrl: 'https://example.com/avatar.jpg',
        avgRating: 4.5,
        totalReviews: 12,
        stats: {
          vendidas: 15,
          alquiladas: 7,
          total: 22,
          precioPromedio: "$ 850.000"
        },
        socialMedia: [
          { platform: "INSTAGRAM", url: "https://instagram.com/carlos" }
        ]
      }
    });

    renderComponent();

    // After loading, it should display the agent's name
    await waitFor(() => {
      expect(screen.getByText('Carlos Agente Test')).toBeInTheDocument();
    });

    // Validating specific derived content based on experience > 5
    expect(screen.getByText(/Agente Inmobiliario Senior/i)).toBeInTheDocument();
    
    // Validating dynamic fields loaded correctly
    expect(screen.getByText('Líder en ventas inmobiliarias.')).toBeInTheDocument();
    
    // Validating rating
    expect(screen.getByText(/4.5/)).toBeInTheDocument();
    expect(screen.getByText(/12 reseñas/i)).toBeInTheDocument();
    
    // Validating stats
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('$ 850.000')).toBeInTheDocument();
    
    // Validating social links
    const instagramLink = screen.getByLabelText(/Instagram/i);
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink.closest('a')).toHaveAttribute('href', 'https://instagram.com/carlos');
  });

  it('handles API errors gracefully and renders internal warnings', async () => {
    useAuth.mockReturnValue({ user: { userId: 123 } });

    agentApi.getAgentById.mockRejectedValue(new Error('Network error'));

    renderComponent();

    // Evaluate that it catches the component's inner layout fallback
    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el perfil del agente/i)).toBeInTheDocument();
    });
  });

});
