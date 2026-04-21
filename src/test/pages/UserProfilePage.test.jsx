import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserProfilePage from '../../pages/UserProfilePage';
import api from '../../services/api';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'USER' },
    isAuthenticated: true,
  }),
}));

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: { name: 'John Doe', email: 'john@example.com', role: 'USER' } } }),
    put: vi.fn(),
  }
}));

describe('UserProfilePage', () => {
  it('renders user profile information after loading', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UserProfilePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Should show loading initially or we just wait for the content
    await waitFor(() => {
        expect(screen.getByText(/Información Personal/i)).toBeInTheDocument();
    });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
