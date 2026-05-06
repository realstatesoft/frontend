import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../i18n';
import PropertiesPage from '../../pages/PropertiesPage';
import useCurrencyStore from '../../store/useCurrencyStore';
import propertyApi from '../../services/properties/propertyApi';

const queryClient = new QueryClient();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false, preferencesCompleted: false }),
}));

vi.mock('../../hooks/useFavoriteProperties', () => ({
  default: () => ({
    favoriteIds: [],
    togglingIds: [],
    isAuthenticated: false,
    toggleFavorite: vi.fn(),
  }),
}));

vi.mock('../../hooks/useExchangeRates', () => ({
  default: () => ({
    data: {
      rates: [
        { currencyCode: 'USD', sellRate: 6360 },
        { currencyCode: 'BRL', sellRate: 1260 },
      ],
    },
  }),
}));

vi.mock('../../components/properties/PropertiesHero', () => ({
  default: ({ onMinPriceChange, onMaxPriceChange, priceCurrency }) => (
    <div>
      <span data-testid="price-currency">{priceCurrency}</span>
      <button type="button" onClick={() => onMinPriceChange('100')}>set-min</button>
      <button type="button" onClick={() => onMaxPriceChange('200')}>set-max</button>
      <input placeholder="Buscar por ubicación" />
    </div>
  ),
}));

vi.mock('../../components/properties/PropertiesGrid', () => ({
  default: () => <div data-testid="properties-grid" />,
}));

vi.mock('../../components/properties/PropertiesMap', () => ({
  default: () => <div data-testid="properties-map" />,
}));

vi.mock('../../components/Landing/Navbar', () => ({
  default: () => <nav data-testid="navbar" />,
}));

vi.mock('../../components/Landing/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

vi.mock('../../components/preferences/PreferencesBanner', () => ({
  default: () => null,
  shouldShowBanner: () => false,
}));

vi.mock('../../services/properties/propertyApi', () => ({
  default: {
    getAll: vi.fn().mockResolvedValue({ data: { content: [], totalElements: 0 } }),
  }
}));

describe('PropertiesPage', () => {
  beforeEach(() => {
    useCurrencyStore.setState({ selectedCurrency: 'USD' });
    vi.clearAllMocks();
  });

  it('renders the properties search section', async () => {
    await initializeI18n();
    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <PropertiesPage />
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    );

    expect(await screen.findByPlaceholderText(/Buscar por ubicación/i)).toBeInTheDocument();
    expect(screen.getByTestId('price-currency')).toHaveTextContent('USD');
  });

  it('convierte los filtros de precio seleccionados en USD a PYG antes de consultar', async () => {
    await initializeI18n();
    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <PropertiesPage />
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'set-min' }));
    fireEvent.click(screen.getByRole('button', { name: 'set-max' }));

    await waitFor(() => {
      expect(propertyApi.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({
          minPrice: 636000,
          maxPrice: 1272000,
        })
      );
    });
  });

  it('does not render the compare button before selecting properties', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PropertiesPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.queryByRole('button', { name: /Comparar/i })).not.toBeInTheDocument();
  });
});
