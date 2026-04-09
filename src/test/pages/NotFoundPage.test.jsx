import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../../pages/NotFoundPage';

// ── Mocks ──────────────────────────────────────────────────────────────────────
// clientConstants exporta FIGMA_COLORS; lo mockeamos con valores simples
// para evitar dependencias ajenas al componente bajo test.
vi.mock('../../constants/clientConstants', () => ({
  FIGMA_COLORS: {
    deepDark: '#000000',
  },
}));

// ── Helper ────────────────────────────────────────────────────────────────────
const renderNotFound = () =>
  render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  );

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('NotFoundPage (404)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderiza sin errores (smoke test)', () => {
    expect(() => renderNotFound()).not.toThrow();
  });

  it('muestra el código de error 404', () => {
    renderNotFound();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('muestra el título "Página no encontrada"', () => {
    renderNotFound();
    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument();
  });

  it('muestra el mensaje descriptivo sobre permisos', () => {
    renderNotFound();
    expect(
      screen.getByText(/no existe, no está disponible o no tienes permisos/i)
    ).toBeInTheDocument();
  });

  it('contiene el botón "Volver al inicio" que apunta a /', () => {
    renderNotFound();
    // react-bootstrap `Button as={Link}` renderiza un <a role="button">, no role="link"
    const btn = screen.getByRole('button', { name: /volver al inicio/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('href', '/');
  });
});
