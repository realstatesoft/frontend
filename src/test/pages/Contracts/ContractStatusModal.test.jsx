import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../../pages/Contracts/ContractsPage.module.scss', () => {
  const proxy = new Proxy({}, { get: (_, key) => key });
  return { default: proxy };
});

import ContractStatusModal from '../../../pages/Contracts/ContractStatusModal';

// ── Datos de prueba ────────────────────────────────────────────────────────────
const makeDraftContract = (overrides = {}) => ({
  id: 3,
  status: 'DRAFT',
  ...overrides,
});

// ── Helper ─────────────────────────────────────────────────────────────────────
function renderStatusModal(contract, extras = {}) {
  const onClose = extras.onClose ?? vi.fn();
  const onConfirm = extras.onConfirm ?? vi.fn();
  const loading = extras.loading ?? false;

  return {
    onClose,
    onConfirm,
    ...render(
      <ContractStatusModal
        contract={contract}
        onClose={onClose}
        onConfirm={onConfirm}
        loading={loading}
      />
    ),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('ContractStatusModal', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Renderizado condicional ────────────────────────────────────────────────
  it('NO renderiza nada cuando contract es null', () => {
    const { container } = render(
      <ContractStatusModal contract={null} onClose={vi.fn()} onConfirm={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza el título "Cambiar estado"', () => {
    renderStatusModal(makeDraftContract());
    expect(screen.getByText('Cambiar estado')).toBeInTheDocument();
  });

  it('tiene role="dialog" y aria-modal="true"', () => {
    renderStatusModal(makeDraftContract());
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  // ── Estado actual ─────────────────────────────────────────────────────────
  it('muestra el badge del estado actual "Borrador" para DRAFT', () => {
    renderStatusModal(makeDraftContract());
    expect(screen.getByText('Borrador')).toBeInTheDocument();
  });

  it('muestra el badge del estado actual "Enviado" para SENT', () => {
    renderStatusModal(makeDraftContract({ status: 'SENT' }));
    expect(screen.getByText('Enviado')).toBeInTheDocument();
  });

  it('muestra "Parcialmente Firmado" para PARTIALLY_SIGNED', () => {
    renderStatusModal(makeDraftContract({ status: 'PARTIALLY_SIGNED' }));
    expect(screen.getByText('Parcialmente Firmado')).toBeInTheDocument();
  });

  // ── Transiciones disponibles ──────────────────────────────────────────────
  it('muestra las opciones de transición para DRAFT (SENT y CANCELLED)', () => {
    renderStatusModal(makeDraftContract({ status: 'DRAFT' }));
    expect(screen.getByText('Enviado')).toBeInTheDocument();
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('muestra las opciones para SENT (PARTIALLY_SIGNED, REJECTED, CANCELLED)', () => {
    renderStatusModal(makeDraftContract({ status: 'SENT' }));
    expect(screen.getByText('Parcialmente Firmado')).toBeInTheDocument();
    expect(screen.getByText('Rechazado')).toBeInTheDocument();
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('muestra mensaje de estado final para SIGNED (sin transiciones)', () => {
    renderStatusModal(makeDraftContract({ status: 'SIGNED' }));
    expect(
      screen.getByText(/Este contrato está en un estado final/i)
    ).toBeInTheDocument();
  });

  it('muestra mensaje de estado final para REJECTED', () => {
    renderStatusModal(makeDraftContract({ status: 'REJECTED' }));
    expect(
      screen.getByText(/Este contrato está en un estado final/i)
    ).toBeInTheDocument();
  });

  it('muestra mensaje de estado final para CANCELLED', () => {
    renderStatusModal(makeDraftContract({ status: 'CANCELLED' }));
    expect(
      screen.getByText(/Este contrato está en un estado final/i)
    ).toBeInTheDocument();
  });

  it('NO muestra el botón "Confirmar cambio" cuando no hay transiciones', () => {
    renderStatusModal(makeDraftContract({ status: 'SIGNED' }));
    expect(
      screen.queryByRole('button', { name: /confirmar cambio/i })
    ).not.toBeInTheDocument();
  });

  // ── Selección de transición ────────────────────────────────────────────────
  it('preselecciona la primera transición disponible (SENT para DRAFT)', () => {
    renderStatusModal(makeDraftContract({ status: 'DRAFT' }));
    const radios = screen.getAllByRole('radio');
    // La primera opción es SENT
    expect(radios[0]).toBeChecked();
  });

  it('permite seleccionar CANCELLED como transición', async () => {
    renderStatusModal(makeDraftContract({ status: 'DRAFT' }));
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[1]); // CANCELLED
    expect(radios[1]).toBeChecked();
    expect(radios[0]).not.toBeChecked();
  });

  // ── Botón Confirmar cambio ────────────────────────────────────────────────
  it('llama a onConfirm con (id, status) al confirmar', async () => {
    const onConfirm = vi.fn();
    renderStatusModal(makeDraftContract({ status: 'DRAFT' }), { onConfirm });
    await userEvent.click(screen.getByRole('button', { name: /confirmar cambio/i }));
    expect(onConfirm).toHaveBeenCalledWith(3, 'SENT');
  });

  it('llama a onConfirm con el estado seleccionado (CANCELLED)', async () => {
    const onConfirm = vi.fn();
    renderStatusModal(makeDraftContract({ status: 'DRAFT' }), { onConfirm });
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[1]); // CANCELLED
    await userEvent.click(screen.getByRole('button', { name: /confirmar cambio/i }));
    expect(onConfirm).toHaveBeenCalledWith(3, 'CANCELLED');
  });

  // ── Estado loading ────────────────────────────────────────────────────────
  it('muestra "Guardando..." en el botón cuando loading es true', () => {
    renderStatusModal(makeDraftContract({ status: 'DRAFT' }), { loading: true });
    expect(screen.getByRole('button', { name: /Guardando.../i })).toBeInTheDocument();
  });

  it('deshabilita el botón Cancelar cuando loading es true', () => {
    renderStatusModal(makeDraftContract({ status: 'DRAFT' }), { loading: true });
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDisabled();
  });

  it('deshabilita el botón Confirmar cuando loading es true', () => {
    renderStatusModal(makeDraftContract({ status: 'DRAFT' }), { loading: true });
    expect(screen.getByRole('button', { name: /Guardando.../i })).toBeDisabled();
  });

  // ── Cerrar modal ──────────────────────────────────────────────────────────
  it('llama a onClose al hacer clic en el botón Cancelar', async () => {
    const { onClose } = renderStatusModal(makeDraftContract({ status: 'DRAFT' }));
    await userEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('llama a onClose al hacer clic en el botón ×', async () => {
    const { onClose } = renderStatusModal(makeDraftContract({ status: 'DRAFT' }));
    await userEvent.click(screen.getByRole('button', { name: /Cerrar/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('llama a onClose al hacer clic en el backdrop', async () => {
    const { onClose, container } = renderStatusModal(makeDraftContract({ status: 'DRAFT' }));
    await userEvent.click(container.firstChild);
    expect(onClose).toHaveBeenCalled();
  });

  // ── Lógica de isValid ──────────────────────────────────────────────────────
  it('el botón Confirmar no llama a onConfirm si no hay transición seleccionada', async () => {
    // Estado final → no hay radios, no hay botón confirmar
    const onConfirm = vi.fn();
    renderStatusModal(makeDraftContract({ status: 'EXPIRED' }), { onConfirm });
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /confirmar cambio/i })).not.toBeInTheDocument();
  });
});
