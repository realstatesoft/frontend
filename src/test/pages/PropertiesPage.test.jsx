import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../i18n';
import PropertiesPage from '../../pages/PropertiesPage';

const queryClient = new QueryClient();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false, preferencesCompleted: false }),
}));

vi.mock('../../services/properties/propertyApi', () => ({
  default: {
    getAll: vi.fn().mockResolvedValue({ data: { content: [], totalElements: 0 } }),
  }
}));

describe('PropertiesPage', () => {
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
