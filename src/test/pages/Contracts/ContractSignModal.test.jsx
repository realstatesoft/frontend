import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContractSignModal from '../../../pages/Contracts/ContractSignModal';
import { useSignContract, useContractSignatures } from '../../../hooks/useContracts';
import { useAuth } from '../../../hooks/useAuth';
import Swal from 'sweetalert2';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../../hooks/useContracts', () => ({
  useSignContract: vi.fn(),
  useContractSignatures: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../pages/Contracts/ContractsPage.module.scss', () => {
  const proxy = new Proxy({}, { get: (_, key) => key });
  return { default: proxy };
});

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

// ── Datos de prueba ────────────────────────────────────────────────────────────
const makeContract = (overrides = {}) => ({
  id: 7,
  status: 'SENT',
  propertyTitle: 'Casa en las sierras',
  ...overrides,
});

// ── Helper ─────────────────────────────────────────────────────────────────────
function renderSignModal(contract = makeContract(), extras = {}) {
  const onClose = extras.onClose ?? vi.fn();
  const onSuccess = extras.onSuccess ?? vi.fn();

  const mutateMock = extras.mutateAsync ?? vi.fn().mockResolvedValue({ data: {} });
  
  useSignContract.mockReturnValue({
    mutateAsync: mutateMock,
    isPending: extras.isPending ?? false,
    isError: false,
  });

  useContractSignatures.mockReturnValue({
    data: extras.signatures ?? { data: [] },
    isLoading: extras.loadingSigs ?? false,
  });

  useAuth.mockReturnValue({
    user: extras.user ?? { id: 1, email: 'test@example.com' },
  });

  return {
    onClose,
    onSuccess,
    mutateMock,
    ...render(<ContractSignModal contract={contract} onClose={onClose} onSuccess={onSuccess} />),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('ContractSignModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    
    // Default mock setup
    useSignContract.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ data: {} }),
      isPending: false,
      isError: false,
    });
    useContractSignatures.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });
    useAuth.mockReturnValue({
      user: { id: 1, email: 'test@example.com' },
    });
  });

  it('NO renderiza nada si contract es null', () => {
    const { container } = render(
      <ContractSignModal contract={null} onClose={vi.fn()} onSuccess={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('muestra "Firmar documento" en el título', () => {
    renderSignModal();
    expect(screen.getByText('Firmar documento')).toBeInTheDocument();
  });

  it('muestra el título de la propiedad', () => {
    renderSignModal();
    expect(screen.getByText('Casa en las sierras')).toBeInTheDocument();
  });

  it('tiene role="dialog"', () => {
    renderSignModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('muestra el checkbox de confirmación', () => {
    renderSignModal();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('el botón Firmar está deshabilitado si el checkbox no está marcado', () => {
    renderSignModal();
    const btn = screen.getByRole('button', { name: /Confirmar y Firmar/i });
    expect(btn).toBeDisabled();
  });

  it('el botón Firmar se habilita al seleccionar rol y marcar checkbox', async () => {
    renderSignModal();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'BUYER');
    await userEvent.click(screen.getByRole('checkbox'));
    const btn = screen.getByRole('button', { name: /Confirmar y Firmar/i });
    expect(btn).not.toBeDisabled();
  });

  it('autodetecta el rol si el usuario está en la lista de firmas pendientes', () => {
    renderSignModal(makeContract(), {
      user: { id: 123, email: 'buyer@test.com' },
      signatures: {
        data: [
          { userId: 123, role: 'BUYER', signed: false }
        ]
      }
    });
    expect(screen.getByText((content, element) => {
      const hasText = (node) => node.textContent === "Detectamos tu identidad como: Comprador / Inquilino";
      const nodeHasText = hasText(element);
      const childrenDontHaveText = Array.from(element.children).every(
        (child) => !hasText(child)
      );
      return nodeHasText && childrenDontHaveText;
    })).toBeInTheDocument();
  });

  it('llama a mutateAsync con el payload correcto al firmar', async () => {
    const mutateMock = vi.fn().mockResolvedValue({});
    renderSignModal(makeContract(), { 
        mutateAsync: mutateMock,
        user: { id: 123 },
        signatures: { data: [{ userId: 123, role: 'BUYER', signed: false }] }
    });

    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /Confirmar y Firmar/i }));

    await waitFor(() =>
      expect(mutateMock).toHaveBeenCalledWith({
        id: 7,
        signatureType: 'ELECTRONIC',
        role: 'BUYER',
        signatureData: 'ELECTRONIC_CONFIRMED',
      })
    );
  });

  it('llama a onSuccess y onClose después de una firma exitosa', async () => {
    const mutateMock = vi.fn().mockResolvedValue({});
    const { onClose, onSuccess } = renderSignModal(makeContract(), { 
        mutateAsync: mutateMock,
        user: { id: 123 },
        signatures: { data: [{ userId: 123, role: 'BUYER', signed: false }] }
    });

    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /Confirmar y Firmar/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('NO llama a mutateAsync si el usuario cancela el diálogo de Swal', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });
    const mutateMock = vi.fn();
    renderSignModal(makeContract(), { 
        mutateAsync: mutateMock,
        user: { id: 123 },
        signatures: { data: [{ userId: 123, role: 'BUYER', signed: false }] }
    });

    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /Confirmar y Firmar/i }));

    await waitFor(() => expect(mutateMock).not.toHaveBeenCalled());
  });

  it('muestra "Procesando..." en el botón cuando isPending es true', () => {
    renderSignModal(makeContract(), { 
        isPending: true,
        user: { id: 123 },
        signatures: { data: [{ userId: 123, role: 'BUYER', signed: false }] }
    });
    expect(screen.getByText('Procesando...')).toBeInTheDocument();
  });

  it('llama a onClose al hacer clic en el botón Cancelar', async () => {
    const { onClose } = renderSignModal();
    await userEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
