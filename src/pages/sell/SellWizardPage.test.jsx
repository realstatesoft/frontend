import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SellWizardPage from './SellWizardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mocks
vi.mock('../../hooks/useLeads', () => ({
  useCreateLeadFromWizard: () => ({
    mutate: vi.fn(),
    isLoading: false
  })
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (ui) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('SellWizardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el primer paso del wizard correctamente', () => {
    renderWithProviders(<SellWizardPage />);
    
    expect(screen.getByText(/Contanos sobre tu propiedad/i)).toBeInTheDocument();
    expect(screen.getByText(/Dirección de la propiedad/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Hacé clic en el mapa/i)).toBeInTheDocument();
  });

  it('debe mostrar el botón de navegación deshabilitado inicialmente', () => {
    renderWithProviders(<SellWizardPage />);
    
    const nextButton = screen.getByRole('button', { name: /Continuar/i });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
  });
});
