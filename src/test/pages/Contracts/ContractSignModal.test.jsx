import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../../hooks/useContracts', () => ({
  useSignContract: vi.fn(),
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

import Swal from 'sweetalert2';
import { useSignContract } from '../../../hooks/useContracts';
import ContractSignModal from '../../../pages/Contracts/ContractSignModal';

// ── Datos de prueba ────────────────────────────────────────────────────────────
const makeContract = (overrides = {}) => ({
  id: 7,
  status: 'SENT',
  propertyTitle: 'Casa en las sierras',
  sellerName: 'Marta Ríos',
  buyerName: 'Jorge Méndez',
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
  });

  // ── Renderizado condicional ────────────────────────────────────────────────
  it('NO renderiza nada si contract es null', () => {
    useSignContract.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    const { container } = render(
      <ContractSignModal contract={null} onClose={vi.fn()} onSuccess={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('muestra el ID del contrato en el título', () => {
    renderSignModal();
    expect(screen.getByText(/Firmar Contrato #7/i)).toBeInTheDocument();
  });

  it('muestra la propiedad "Casa en las sierras"', () => {
    renderSignModal();
    expect(screen.getByText('Casa en las sierras')).toBeInTheDocument();
  });

  it('muestra el nombre del vendedor', () => {
    renderSignModal();
    expect(screen.getByText('Marta Ríos')).toBeInTheDocument();
  });

  it('muestra el nombre del comprador', () => {
    renderSignModal();
    expect(screen.getByText('Jorge Méndez')).toBeInTheDocument();
  });

  it('tiene role="dialog" y aria-modal="true"', () => {
    renderSignModal();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  // ── Tipo de firma por defecto ──────────────────────────────────────────────
  it('selecciona "Firma Electrónica" por defecto', () => {
    renderSignModal();
    const radioElectronic = screen.getAllByRole('radio')[0];
    expect(radioElectronic).toBeChecked();
  });

  it('muestra el checkbox de confirmación cuando el tipo es ELECTRONIC', () => {
    renderSignModal();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  // ── Validación: ELECTRONIC ─────────────────────────────────────────────────
  it('el botón Firmar está deshabilitado si el checkbox no está marcado', () => {
    renderSignModal();
    const btn = screen.getByRole('button', { name: /firmar contrato/i });
    expect(btn).toBeDisabled();
  });

  it('el botón Firmar se habilita al marcar el checkbox de confirmación', async () => {
    renderSignModal();
    await userEvent.click(screen.getByRole('checkbox'));
    const btn = screen.getByRole('button', { name: /firmar contrato/i });
    expect(btn).not.toBeDisabled();
  });

  // ── Cambio de tipo de firma ────────────────────────────────────────────────
  it('muestra el input de hash al seleccionar "Firma Digital"', async () => {
    renderSignModal();
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[1]); // DIGITAL
    expect(screen.getByPlaceholderText(/SHA256/i)).toBeInTheDocument();
  });

  it('el botón Firmar está deshabilitado con DIGITAL y hash vacío', async () => {
    renderSignModal();
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[1]); // DIGITAL
    const btn = screen.getByRole('button', { name: /firmar contrato/i });
    expect(btn).toBeDisabled();
  });

  it('el botón Firmar se habilita con DIGITAL cuando el usuario escribe un hash', async () => {
    renderSignModal();
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[1]); // DIGITAL
    await userEvent.type(screen.getByPlaceholderText(/SHA256/i), 'SHA256:abc123');
    const btn = screen.getByRole('button', { name: /firmar contrato/i });
    expect(btn).not.toBeDisabled();
  });

  it('muestra el input de archivo al seleccionar "Firma Escaneada"', async () => {
    renderSignModal();
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[2]); // HANDWRITTEN_SCAN
    expect(screen.getByLabelText(/Imagen de firma manuscrita/i)).toBeInTheDocument();
  });

  it('al cambiar de tipo se resetea el estado de datos y confirmación', async () => {
    renderSignModal();
    // Marcar checkbox de ELECTRONIC
    await userEvent.click(screen.getByRole('checkbox'));
    // Cambiar a DIGITAL
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[1]);
    // Volver a ELECTRONIC: el checkbox debe estar desmarcado
    await userEvent.click(radios[0]);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  // ── Selector de rol ────────────────────────────────────────────────────────
  it('tiene "Comprador / Inquilino" como rol por defecto', () => {
    renderSignModal();
    const select = screen.getByRole('combobox');
    expect(select.value).toBe('BUYER');
  });

  it('permite cambiar el rol a "Agente"', async () => {
    renderSignModal();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'AGENT');
    expect(select.value).toBe('AGENT');
  });

  // ── Flujo de firma exitosa ───────────────────────────────────────────────
  it('llama a mutateAsync con el payload correcto al firmar electrónicamente', async () => {
    const mutateMock = vi.fn().mockResolvedValue({});
    renderSignModal(makeContract(), { mutateAsync: mutateMock });

    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /firmar contrato/i }));

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
    const { onClose, onSuccess } = renderSignModal(makeContract(), { mutateAsync: mutateMock });

    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /firmar contrato/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  // ── Confirmación cancelada ────────────────────────────────────────────────
  it('NO llama a mutateAsync si el usuario cancela el diálogo de Swal', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });
    const mutateMock = vi.fn();
    renderSignModal(makeContract(), { mutateAsync: mutateMock });

    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /firmar contrato/i }));

    await waitFor(() => expect(mutateMock).not.toHaveBeenCalled());
  });

  // ── Estado pendiente ──────────────────────────────────────────────────────
  it('muestra "Firmando…" en el botón cuando isPending es true', () => {
    renderSignModal(makeContract(), { isPending: true });
    expect(screen.getByRole('button', { name: /Firmando…/i })).toBeInTheDocument();
  });

  it('el botón Cancelar está deshabilitado mientras isPending', () => {
    renderSignModal(makeContract(), { isPending: true });
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDisabled();
  });

  // ── Manejo de errores ─────────────────────────────────────────────────────
  it('muestra un Swal de error cuando sign lanza una excepción', async () => {
    const mutateMock = vi.fn().mockRejectedValue({
      response: { data: { message: 'Contrato ya firmado' } },
    });
    renderSignModal(makeContract(), { mutateAsync: mutateMock });

    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /firmar contrato/i }));

    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: 'error', title: 'Error al firmar' })
      )
    );
  });

  // ── Cerrar modal ──────────────────────────────────────────────────────────
  it('llama a onClose al hacer clic en el botón Cancelar', async () => {
    const { onClose } = renderSignModal();
    await userEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('llama a onClose al hacer clic en el backdrop', async () => {
    const { onClose, container } = renderSignModal();
    await userEvent.click(container.firstChild);
    expect(onClose).toHaveBeenCalled();
  });
});
