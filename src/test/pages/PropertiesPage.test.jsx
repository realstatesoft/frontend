import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PropertiesPage from '../../pages/PropertiesPage';

const queryClient = new QueryClient();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

vi.mock('../../services/properties/propertyApi', () => ({
  default: {
    getAll: vi.fn().mockResolvedValue({ data: { content: [], totalElements: 0 } }),
  }
}));

describe('PropertiesPage', () => {
  it('renders the properties search section', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PropertiesPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByPlaceholderText(/Buscar por ubicación/i)).toBeInTheDocument();
  });
});
