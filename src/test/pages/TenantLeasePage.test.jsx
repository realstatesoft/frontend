import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import TenantLeasePage from '../../pages/TenantDashboard/TenantLeasePage';
import { useTenantLease } from '../../hooks/useTenantDashboard';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../hooks/useTenantDashboard', () => ({
  useTenantLease: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../hooks/useFormatters', () => ({
  default: () => ({
    formatCurrency: (amount, currency = 'USD') => {
      const value = amount ?? 0;
      return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency,
        minimumFractionDigits: currency === 'PYG' ? 0 : 2,
        maximumFractionDigits: currency === 'PYG' ? 0 : 2,
      }).format(value);
    },
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue, vars) => {
      if (typeof defaultValue === 'string' && vars) {
        let result = defaultValue;
        Object.entries(vars).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, v);
        });
        return result;
      }
      return defaultValue || key;
    },
  }),
}));

vi.mock('../../pages/TenantDashboard/TenantLeasePage.module.scss', () => {
  const proxy = new Proxy({}, { get: (_, key) => key });
  return { default: proxy };
});

// ── Helpers ────────────────────────────────────────────────────────────────────
const today = new Date();
const futureDate = (days) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};
const pastDate = (days) => {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const makeLease = (overrides = {}) => ({
  id: 101,
  propertyAddress: 'Av. Libertador 1234, Santiago',
  propertyTitle: 'Departamento Las Condes',
  startDate: pastDate(180),
  endDate: futureDate(180),
  monthlyRent: 1500,
  currency: 'USD',
  status: 'ACTIVE',
  landlord: {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+56912345678',
  },
  documents: [
    {
      id: 1,
      fileName: 'Contrato_Arrendamiento_L101.pdf',
      fileUrl: 'https://example.com/lease.pdf',
      fileType: 'pdf',
      fileSize: 204800,
    },
  ],
  ...overrides,
});

function renderPage(leasesData = [makeLease()], options = { isLoading: false, error: null }) {
  useTenantLease.mockReturnValue({
    data: options.error ? null : leasesData,
    isLoading: options.isLoading,
    error: options.error,
  });

  return render(
    <MemoryRouter>
      <TenantLeasePage />
    </MemoryRouter>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('TenantLeasePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra spinner mientras carga', () => {
    renderPage([], { isLoading: true });
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('muestra mensaje de error cuando hay error en la consulta', () => {
    renderPage([], { error: { response: { data: { message: 'Error de red' } } } });
    expect(screen.getByText(/Error de red/)).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay contratos activos', () => {
    renderPage([], {});
    expect(screen.getByText(/No tienes contratos activos/)).toBeInTheDocument();
  });

  it('renderiza el título de la página', () => {
    renderPage();
    expect(screen.getByText('Mis Contratos')).toBeInTheDocument();
  });

  it('muestra información de cada contrato en la lista', () => {
    renderPage([
      makeLease({ id: 101, propertyTitle: 'Departamento A' }),
      makeLease({ id: 102, propertyTitle: 'Departamento B' }),
    ]);
    const titles = screen.getAllByRole('heading', { level: 2 });
    expect(titles.some((el) => el.textContent === 'Departamento A')).toBe(true);
    expect(titles.some((el) => el.textContent === 'Departamento B')).toBe(true);
  });

  it('muestra badge "Activo" cuando el status es ACTIVE', () => {
    renderPage();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('muestra el período del contrato', () => {
    renderPage();
    expect(screen.getByText(/Período del Contrato/)).toBeInTheDocument();
  });

  it('muestra la renta mensual formateada', () => {
    renderPage();
    expect(screen.getByText(/1\.500/)).toBeInTheDocument();
  });

  it('muestra el nombre del documento del contrato', () => {
    renderPage();
    expect(screen.getByText('Contrato_Arrendamiento_L101.pdf')).toBeInTheDocument();
  });

  it('muestra botón de descarga de PDF habilitado', () => {
    renderPage();
    const btn = screen.getByRole('button', { name: /Descargar PDF/ });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it('muestra botón de descarga de PDF habilitado aunque no haya fileUrl en documents', () => {
    renderPage([
      makeLease({
        documents: [{ id: 1, fileName: 'lease.pdf', fileUrl: null }],
      }),
    ]);
    const btn = screen.getByRole('button', { name: /Descargar PDF/ });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it('navega a detalle al hacer clic en Ver Detalles', async () => {
    renderPage([makeLease({ id: 202 })]);
    const btn = screen.getByRole('button', { name: /Ver Detalles/ });
    await userEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith('/tenant/lease/202');
  });

  it('muestra banner de aviso cuando el contrato expira en menos de 60 días', () => {
    renderPage([makeLease({ endDate: futureDate(30) })]);
    expect(screen.getByText('Tu contrato está por expirar')).toBeInTheDocument();
    expect(screen.getByText(/Tu contrato vence en \d+ días/)).toBeInTheDocument();
  });

  it('NO muestra banner de expiración cuando faltan más de 60 días', () => {
    renderPage([makeLease({ endDate: futureDate(120) })]);
    expect(screen.queryByText('Tu contrato está por expirar')).not.toBeInTheDocument();
  });
});
