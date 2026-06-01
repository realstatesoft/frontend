import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ContractsPage from '../../../pages/Contracts/ContractsPage';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'AGENT' },
  }),
}));

vi.mock('../../../hooks/useFormatters', () => ({
  __esModule: true,
  default: () => ({
    formatCurrency: (val) => `$${val}`,
    formatDate: (val) => val,
  }),
}));

vi.mock('../../../hooks/useContracts', () => ({
  useContractsAsListingAgent: () => ({ data: [], isLoading: false }),
  useContractsAsBuyerAgent: () => ({ data: [], isLoading: false }),
  useContractsAsSeller: () => ({ data: [], isLoading: false }),
  useContractsAsBuyer: () => ({ data: [], isLoading: false }),
  useUpdateContractStatus: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDownloadContract: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe('ContractsPage', () => {
  it('should render the contracts list page', () => {
    render(
      <BrowserRouter>
        <ContractsPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Total Contratos/i)).toBeInTheDocument();
  });
});
