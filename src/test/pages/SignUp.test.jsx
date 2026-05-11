import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../i18n';
import SignUp from '../../pages/SignUp';

// Simple QueryClient for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
  }),
}));

describe('SignUp Page', () => {
  beforeEach(async () => {
    await initializeI18n();
  });

  it('renders the signup form', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <SignUp />
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    );

    expect(screen.getByRole('heading', { name: /Crea tu cuenta/i })).toBeInTheDocument();
    expect(screen.getByText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/Apellido/i)).toBeInTheDocument();
    expect(screen.getByText(/Teléfono/i)).toBeInTheDocument();
  });
});
