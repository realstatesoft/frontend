import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../i18n';
import AdminLayout from '../../components/layout/AdminLayout/AdminLayout';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../../hooks/useMessagesData', () => ({
  useConversations: vi.fn(() => ({ data: { data: [] } })),
}));
vi.mock('../../store/useUIStore', () => ({
  default: vi.fn(() => ({ sidebarCollapsed: false, toggleSidebar: vi.fn(), darkMode: false, toggleDarkMode: vi.fn() })),
}));

import { useAuth } from '../../hooks/useAuth';

describe('AdminLayout', () => {
  beforeEach(async () => {
    localStorage.clear();
    await initializeI18n();
    useAuth.mockReturnValue({ user: { role: 'ADMIN', email: 'admin@example.com' } });
  });

  it('muestra el selector de idioma en el topbar autenticado y los labels traducidos del sidebar', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<div>Contenido</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );

    expect(screen.getByRole('button', { name: /idioma|language/i })).toBeInTheDocument();
    expect(screen.getByText(/panel/i)).toBeInTheDocument();
    expect(screen.getByText(/aprobación de propiedades/i)).toBeInTheDocument();
    expect(screen.getByText(/plantillas de contrato/i)).toBeInTheDocument();
  });
});
