import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  it('renders the signup form', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SignUp />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Crea tu cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/Apellido/i)).toBeInTheDocument();
    expect(screen.getByText(/Teléfono/i)).toBeInTheDocument();
  });
});
