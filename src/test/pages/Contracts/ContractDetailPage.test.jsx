import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ContractDetailPage from '../../../pages/Contracts/ContractDetailPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'ADMIN' },
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
  useContractDetail: () => ({ data: { id: 123, propertyTitle: 'Test Property', contractType: 'RENT', status: 'DRAFT', amount: 1000 }, isLoading: false }),
  useContractSignatures: () => ({ data: [], isLoading: false }),
  useSignContract: () => ({ mutateAsync: vi.fn() }),
  useDownloadContract: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateContractStatus: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe('ContractDetailPage', () => {
  it('should render contract details', () => {
    render(
      <BrowserRouter>
        <ContractDetailPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Contrato #123/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Property/i)).toBeInTheDocument();
  });
});
