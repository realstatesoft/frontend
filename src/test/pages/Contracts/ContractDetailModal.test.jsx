import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../../hooks/useContracts', () => ({
  useContractSignatures: vi.fn(),
}));

// Mock de estilos CSS Modules (devuelve el nombre de la clase como string)
vi.mock('../../../pages/Contracts/ContractsPage.module.scss', () => {
  const proxy = new Proxy({}, { get: (_, key) => key });
  return { default: proxy };
});

import { useContractSignatures } from '../../../hooks/useContracts';
import ContractDetailModal from '../../../pages/Contracts/ContractDetailModal';

// ── Datos de prueba ────────────────────────────────────────────────────────────
const makeContract = (overrides = {}) => ({
  id: 42,
  contractType: 'SALE',
  status: 'SENT',
  propertyTitle: 'Departamento Centro',
  sellerName: 'Ana García',
  sellerEmail: 'ana@example.com',
  buyerName: 'Carlos López',
  buyerEmail: 'carlos@example.com',
  listingAgentName: 'Pedro Ruiz',
  buyerAgentName: null,
  amount: 500000,
  commissionPct: 3,
  totalCommissionAmount: 15000,
  listingAgentCommissionPct: 2,
  listingAgentCommissionAmount: 10000,
  buyerAgentCommissionPct: 1,
  buyerAgentCommissionAmount: 5000,
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  createdAt: '2025-01-01T00:00:00Z',
  terms: 'El pago se realizará en cuotas mensuales.',
  ...overrides,
});

const makeSig = (overrides = {}) => ({
  signatureId: 1,
  signerId: 10,
  signerName: 'Ana García',
  role: 'SELLER',
  signed: true,
  signatureType: 'ELECTRONIC',
  signedAt: '2025-01-05T10:00:00Z',
  ...overrides,
});

// ── Helper ─────────────────────────────────────────────────────────────────────
function renderModal(contract = makeContract(), onClose = vi.fn()) {
  return render(<ContractDetailModal contract={contract} onClose={onClose} />);
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('ContractDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto: cargando firmas
    useContractSignatures.mockReturnValue({ data: undefined, isLoading: true });
  });

  // ── Renderizado condicional ────────────────────────────────────────────────
  it('NO renderiza nada si contract es null', () => {
    useContractSignatures.mockReturnValue({ data: undefined, isLoading: false });
    const { container } = render(<ContractDetailModal contract={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza el ID del contrato en el título del modal', () => {
    renderModal();
    expect(screen.getByText(/Detalle del Contrato #42/i)).toBeInTheDocument();
  });

  // ── Sección Propiedad ──────────────────────────────────────────────────────
  it('muestra el título de la propiedad', () => {
    renderModal();
    expect(screen.getByText('Departamento Centro')).toBeInTheDocument();
  });

  it('muestra el tipo de contrato "Venta"', () => {
    renderModal();
    expect(screen.getByText('Venta')).toBeInTheDocument();
  });

  it('muestra el estado del contrato "Enviado"', () => {
    renderModal();
    expect(screen.getByText('Enviado')).toBeInTheDocument();
  });

  // ── Sección Partes ─────────────────────────────────────────────────────────
  it('muestra el nombre y email del vendedor', () => {
    renderModal();
    expect(screen.getByText(/Ana García.*ana@example\.com/)).toBeInTheDocument();
  });

  it('muestra el nombre y email del comprador', () => {
    renderModal();
    expect(screen.getByText(/Carlos López.*carlos@example\.com/)).toBeInTheDocument();
  });

  it('muestra el nombre del agente listador', () => {
    renderModal();
    expect(screen.getByText('Pedro Ruiz')).toBeInTheDocument();
  });

  it('muestra "Sin agente del comprador" cuando buyerAgentName es null', () => {
    renderModal();
    expect(screen.getByText('Sin agente del comprador')).toBeInTheDocument();
  });

  // ── Sección Montos ─────────────────────────────────────────────────────────
  it('muestra la comisión total en porcentaje', () => {
    renderModal();
    expect(screen.getByText('3%')).toBeInTheDocument();
  });

  // ── Sección Términos ───────────────────────────────────────────────────────
  it('muestra los términos del contrato cuando existen', () => {
    renderModal();
    expect(screen.getByText('El pago se realizará en cuotas mensuales.')).toBeInTheDocument();
  });

  it('NO muestra la sección de términos cuando el campo es falsy', () => {
    renderModal(makeContract({ terms: '' }));
    expect(screen.queryByText(/términos/i)).not.toBeInTheDocument();
  });

  // ── Panel de firmas: loading ──────────────────────────────────────────────
  it('muestra "Cargando firmas…" mientras loadingSigs es true', () => {
    useContractSignatures.mockReturnValue({ data: undefined, isLoading: true });
    renderModal();
    expect(screen.getByText('Cargando firmas…')).toBeInTheDocument();
  });

  // ── Panel de firmas: vacío ────────────────────────────────────────────────
  it('muestra mensaje de "No hay firmas registradas" cuando el array está vacío', () => {
    useContractSignatures.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });
    renderModal();
    expect(screen.getByText(/No hay firmas registradas/i)).toBeInTheDocument();
  });

  // ── Panel de firmas: con datos ────────────────────────────────────────────
  it('muestra el nombre del firmante cuando hay firmas', () => {
    useContractSignatures.mockReturnValue({
      data: { data: [makeSig()] },
      isLoading: false,
    });
    renderModal();
    expect(screen.getByText('Ana García')).toBeInTheDocument();
  });

  it('muestra el rol "Vendedor / Propietario" para SELLER en el panel de firmas', () => {
    useContractSignatures.mockReturnValue({
      data: { data: [makeSig({ role: 'SELLER' })] },
      isLoading: false,
    });
    renderModal();
    // "Vendedor / Propietario" aparece en la etiqueta de fila Y en el rol de firma;
    // verificamos que existe en el DOM (varias coincidencias son válidas)
    const matches = screen.getAllByText('Vendedor / Propietario');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    // El rol en el panel de firmas tiene clase sign__role
    const roleSpan = matches.find((el) => el.classList.contains('sign__role'));
    expect(roleSpan).toBeTruthy();
  });

  it('muestra icono de firmado para firmas completadas', () => {
    useContractSignatures.mockReturnValue({
      data: { data: [makeSig({ signed: true })] },
      isLoading: false,
    });
    renderModal();
    expect(screen.getByLabelText('Firmado')).toBeInTheDocument();
  });

  it('muestra icono de pendiente para firmas pendientes', () => {
    useContractSignatures.mockReturnValue({
      data: { data: [makeSig({ signed: false })] },
      isLoading: false,
    });
    renderModal();
    expect(screen.getByLabelText('Pendiente')).toBeInTheDocument();
  });

  it('muestra "Pendiente de firma" para firmas sin completar', () => {
    useContractSignatures.mockReturnValue({
      data: { data: [makeSig({ signed: false, signedAt: null })] },
      isLoading: false,
    });
    renderModal();
    expect(screen.getByText('Pendiente de firma')).toBeInTheDocument();
  });

  // ── Progreso de firmas ────────────────────────────────────────────────────
  it('muestra el conteo correcto de firmas (1 de 2 han firmado)', () => {
    useContractSignatures.mockReturnValue({
      data: {
        data: [
          makeSig({ signatureId: 1, signed: true }),
          makeSig({ signatureId: 2, signed: false }),
        ],
      },
      isLoading: false,
    });
    renderModal();
    expect(screen.getByText(/1 de 2 partes han firmado/i)).toBeInTheDocument();
  });

  it('el título de la sección muestra (1/2) con firmas parciales', () => {
    useContractSignatures.mockReturnValue({
      data: {
        data: [
          makeSig({ signatureId: 1, signed: true }),
          makeSig({ signatureId: 2, signed: false }),
        ],
      },
      isLoading: false,
    });
    renderModal();
    expect(screen.getByText('Estado de firmas (1/2)')).toBeInTheDocument();
  });

  it('el tipo de firma "Electrónica" se muestra en el item de firma', () => {
    useContractSignatures.mockReturnValue({
      data: { data: [makeSig({ signatureType: 'ELECTRONIC' })] },
      isLoading: false,
    });
    renderModal();
    expect(screen.getByText('Electrónica')).toBeInTheDocument();
  });

  // ── Botón cerrar ──────────────────────────────────────────────────────────
  it('llama a onClose al hacer clic en el botón Cerrar del footer', async () => {
    useContractSignatures.mockReturnValue({ data: { data: [] }, isLoading: false });
    const onClose = vi.fn();
    renderModal(makeContract(), onClose);
    // Hay dos botones con texto "Cerrar": el × (aria-label) y el del footer
    const btns = screen.getAllByRole('button', { name: /Cerrar/i });
    // El del footer es el último
    await userEvent.click(btns[btns.length - 1]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('llama a onClose al hacer clic en el botón × del header', async () => {
    useContractSignatures.mockReturnValue({ data: { data: [] }, isLoading: false });
    const onClose = vi.fn();
    renderModal(makeContract(), onClose);
    // El botón × tiene aria-label="Cerrar" y está primero
    const btns = screen.getAllByRole('button', { name: /Cerrar/i });
    await userEvent.click(btns[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('llama a onClose al hacer clic en el backdrop', async () => {
    useContractSignatures.mockReturnValue({ data: { data: [] }, isLoading: false });
    const onClose = vi.fn();
    const { container } = renderModal(makeContract(), onClose);
    // El backdrop es el primer div del modal
    await userEvent.click(container.firstChild);
    expect(onClose).toHaveBeenCalled();
  });

  it('tiene role="dialog" y aria-modal="true"', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
