import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../services/contracts/contractApi', () => ({
  default: {
    getAsListingAgent: vi.fn(),
    getAsBuyerAgent:   vi.fn(),
    getAsSeller:       vi.fn(),
    getAsBuyer:        vi.fn(),
    getById:           vi.fn(),
    getSignatures:     vi.fn(),
    create:            vi.fn(),
    update:            vi.fn(),
    updateStatus:      vi.fn(),
    sign:              vi.fn(),
  },
}));

import contractApi from '../../services/contracts/contractApi';
import {
  useContractsAsListingAgent,
  useContractsAsBuyerAgent,
  useContractsAsSeller,
  useContractsAsBuyer,
  useContractDetail,
  useContractSignatures,
  useCreateContract,
  useUpdateContract,
  useUpdateContractStatus,
  useSignContract,
} from '../../hooks/useContracts';

// ── Helper ─────────────────────────────────────────────────────────────────────
const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

const mockContract = {
  id: 1,
  contractType: 'SALE',
  status: 'DRAFT',
  propertyTitle: 'Casa en venta',
  amount: 500000,
  commissionPct: 3,
};

const mockSignature = {
  signatureId: 10,
  signerId: 2,
  signerName: 'María López',
  role: 'SELLER',
  signed: true,
  signatureType: 'ELECTRONIC',
  signedAt: '2025-01-20T10:00:00Z',
};

// ── Tests: queries de listado ──────────────────────────────────────────────────
describe('useContractsAsListingAgent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna isLoading true inicialmente', () => {
    contractApi.getAsListingAgent.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useContractsAsListingAgent(), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
  });

  it('resuelve con la lista de contratos del agente listador', async () => {
    contractApi.getAsListingAgent.mockResolvedValue({ data: [mockContract] });
    const { result } = renderHook(() => useContractsAsListingAgent(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.data[0].id).toBe(1);
  });

  it('pone isError en true cuando la API falla', async () => {
    contractApi.getAsListingAgent.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useContractsAsListingAgent(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useContractsAsBuyerAgent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a contractApi.getAsBuyerAgent al montar', async () => {
    contractApi.getAsBuyerAgent.mockResolvedValue({ data: [] });
    renderHook(() => useContractsAsBuyerAgent(), { wrapper: createWrapper() });
    await waitFor(() => expect(contractApi.getAsBuyerAgent).toHaveBeenCalledTimes(1));
  });
});

describe('useContractsAsSeller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a contractApi.getAsSeller al montar', async () => {
    contractApi.getAsSeller.mockResolvedValue({ data: [] });
    renderHook(() => useContractsAsSeller(), { wrapper: createWrapper() });
    await waitFor(() => expect(contractApi.getAsSeller).toHaveBeenCalledTimes(1));
  });
});

describe('useContractsAsBuyer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a contractApi.getAsBuyer al montar', async () => {
    contractApi.getAsBuyer.mockResolvedValue({ data: [] });
    renderHook(() => useContractsAsBuyer(), { wrapper: createWrapper() });
    await waitFor(() => expect(contractApi.getAsBuyer).toHaveBeenCalledTimes(1));
  });
});

// ── Tests: useContractDetail ───────────────────────────────────────────────────
describe('useContractDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('NO llama a la API cuando id es falsy (enabled: false)', () => {
    const { result } = renderHook(() => useContractDetail(null), {
      wrapper: createWrapper(),
    });
    expect(contractApi.getById).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('llama a getById con el id correcto cuando se provee', async () => {
    contractApi.getById.mockResolvedValue({ data: mockContract });
    const { result } = renderHook(() => useContractDetail(1), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contractApi.getById).toHaveBeenCalledWith(1);
    expect(result.current.data.data.propertyTitle).toBe('Casa en venta');
  });

  it('pone isError en true cuando getById rechaza', async () => {
    contractApi.getById.mockRejectedValue(new Error('Not found'));
    const { result } = renderHook(() => useContractDetail(99), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── Tests: useContractSignatures ──────────────────────────────────────────────
describe('useContractSignatures', () => {
  beforeEach(() => vi.clearAllMocks());

  it('NO llama a la API cuando id es falsy', () => {
    renderHook(() => useContractSignatures(undefined), { wrapper: createWrapper() });
    expect(contractApi.getSignatures).not.toHaveBeenCalled();
  });

  it('resuelve con las firmas del contrato', async () => {
    contractApi.getSignatures.mockResolvedValue({ data: [mockSignature] });
    const { result } = renderHook(() => useContractSignatures(1), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.data[0].signerName).toBe('María López');
  });
});

// ── Tests: mutaciones ──────────────────────────────────────────────────────────
describe('useCreateContract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a contractApi.create con el payload correcto', async () => {
    contractApi.create.mockResolvedValue({ data: { ...mockContract, id: 5 } });
    const { result } = renderHook(() => useCreateContract(), {
      wrapper: createWrapper(),
    });
    const payload = { contractType: 'SALE', amount: 200000 };
    result.current.mutate(payload);
    await waitFor(() => expect(contractApi.create).toHaveBeenCalledWith(payload));
  });

  it('pone isError en true cuando create falla', async () => {
    contractApi.create.mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() => useCreateContract(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({});
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateContract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a contractApi.update separando id del resto del payload', async () => {
    contractApi.update.mockResolvedValue({ data: mockContract });
    const { result } = renderHook(() => useUpdateContract(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: 1, amount: 600000 });
    await waitFor(() =>
      expect(contractApi.update).toHaveBeenCalledWith(1, { amount: 600000 })
    );
  });
});

describe('useUpdateContractStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a contractApi.updateStatus con id y status', async () => {
    contractApi.updateStatus.mockResolvedValue({ data: { ...mockContract, status: 'SENT' } });
    const { result } = renderHook(() => useUpdateContractStatus(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: 1, status: 'SENT' });
    await waitFor(() =>
      expect(contractApi.updateStatus).toHaveBeenCalledWith(1, 'SENT')
    );
  });
});

describe('useSignContract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a contractApi.sign con el payload de firma correctamente', async () => {
    contractApi.sign.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useSignContract(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      id: 1,
      signatureType: 'ELECTRONIC',
      role: 'BUYER',
      signatureData: 'ELECTRONIC_CONFIRMED',
    });
    await waitFor(() =>
      expect(contractApi.sign).toHaveBeenCalledWith(1, {
        signatureType: 'ELECTRONIC',
        role: 'BUYER',
        signatureData: 'ELECTRONIC_CONFIRMED',
      })
    );
  });

  it('pone isError en true cuando sign falla', async () => {
    contractApi.sign.mockRejectedValue(new Error('Sign failed'));
    const { result } = renderHook(() => useSignContract(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: 1, signatureType: 'ELECTRONIC', role: 'BUYER' });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
