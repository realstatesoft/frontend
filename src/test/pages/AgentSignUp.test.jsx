import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../i18n';
import AgentSignUp from '../../pages/AgentSignUp';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
const mockRegister = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
    login: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const renderPage = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <AgentSignUp />
      </MemoryRouter>
    </I18nextProvider>
  );

/**
 * Avanza desde el paso 1 al paso 2 llenando los campos requeridos.
 */
const goToStep2 = async (user) => {
  await user.type(screen.getByPlaceholderText(/Ej: Ayumu/i), 'Juan');
  await user.type(screen.getByPlaceholderText(/Apellido/i), 'Pérez');
  await user.type(screen.getByPlaceholderText(/\+595/i), '0981234567');
  await user.click(screen.getByRole('button', { name: /siguiente paso/i }));
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AgentSignUp', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await initializeI18n();
  });

  // ── Paso 1 — renderizado ───────────────────────────────────────────────────

  describe('paso 1 — datos personales', () => {
    it('muestra el título de registro de agente', () => {
      renderPage();
      expect(screen.getByText(/Regístrate como Agente/i)).toBeInTheDocument();
    });

    it('muestra los campos Nombre, Apellido y Teléfono', () => {
      renderPage();
      expect(screen.getByText(/^Nombre$/i)).toBeInTheDocument();
      expect(screen.getByText(/^Apellido$/i)).toBeInTheDocument();
      expect(screen.getByText(/^Teléfono$/i)).toBeInTheDocument();
    });

    it('el campo Teléfono es requerido (obligatorio)', () => {
      renderPage();
      expect(screen.getByPlaceholderText(/\+595/i)).toBeRequired();
    });

    it('el campo Nombre es requerido', () => {
      renderPage();
      expect(screen.getByPlaceholderText(/Ej: Ayumu/i)).toBeRequired();
    });

    it('el campo Apellido es requerido', () => {
      renderPage();
      expect(screen.getByPlaceholderText(/Apellido/i)).toBeRequired();
    });

    it('muestra el botón "Siguiente paso"', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /siguiente paso/i })).toBeInTheDocument();
    });

    it('muestra el stepper con los pasos "Personales" y "Cuenta"', () => {
      renderPage();
      // Use exact string to avoid matching the subtitle paragraph that also contains "cuenta"
      expect(screen.getByText('Personales')).toBeInTheDocument();
      expect(screen.getByText('Cuenta')).toBeInTheDocument();
    });

    it('no muestra el formulario de cuenta en el paso 1', () => {
      renderPage();
      expect(screen.queryByPlaceholderText(/tu@email/i)).not.toBeInTheDocument();
    });
  });

  // ── Navegación entre pasos ─────────────────────────────────────────────────

  describe('navegación entre pasos', () => {
    it('avanza al paso 2 al enviar el formulario del paso 1', async () => {
      const user = userEvent.setup();
      renderPage();
      await goToStep2(user);

      expect(screen.getByText(/Correo Electrónico/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/tu@email/i)).toBeInTheDocument();
    });

    it('el paso 1 ya no es visible al llegar al paso 2', async () => {
      const user = userEvent.setup();
      renderPage();
      await goToStep2(user);

      expect(screen.queryByPlaceholderText(/Ej: Ayumu/i)).not.toBeInTheDocument();
    });

    it('vuelve al paso 1 al hacer click en "Atrás"', async () => {
      const user = userEvent.setup();
      renderPage();
      await goToStep2(user);

      await user.click(screen.getByRole('button', { name: /atrás/i }));

      expect(screen.getByText(/^Teléfono$/i)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/tu@email/i)).not.toBeInTheDocument();
    });
  });

  // ── Paso 2 — validaciones del lado del cliente ─────────────────────────────

  describe('paso 2 — validaciones', () => {
    it('muestra error cuando las contraseñas no coinciden', async () => {
      const user = userEvent.setup();
      renderPage();
      await goToStep2(user);

      await user.type(screen.getByPlaceholderText(/tu@email/i), 'juan@test.com');
      await user.type(screen.getByPlaceholderText(/^••••••••$/i), 'Password123');
      await user.type(screen.getByPlaceholderText(/Repite tu contraseña/i), 'OtraPassword');
      // Check terms so HTML5 required validation passes; password mismatch check runs first in JS
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /crear cuenta de agente/i }));

      expect(
        await screen.findByText(/Las contraseñas no coinciden/i)
      ).toBeInTheDocument();
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('muestra error cuando no se aceptan los términos', async () => {
      const user = userEvent.setup();
      renderPage();
      await goToStep2(user);

      await user.type(screen.getByPlaceholderText(/tu@email/i), 'juan@test.com');
      await user.type(screen.getByPlaceholderText(/^••••••••$/i), 'Password123');
      await user.type(screen.getByPlaceholderText(/Repite tu contraseña/i), 'Password123');
      // Terms checkbox left unchecked. Use fireEvent.submit to bypass HTML5 required
      // constraint validation so the JS handler runs and sets the error message.
      fireEvent.submit(document.querySelector('form'));

      expect(
        await screen.findByText(/Debes aceptar los términos y condiciones/i)
      ).toBeInTheDocument();
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  // ── Paso 2 — envío del formulario ─────────────────────────────────────────

  describe('paso 2 — envío del formulario', () => {
    const fillAndSubmitStep2 = async (user) => {
      await user.type(screen.getByPlaceholderText(/tu@email/i), 'juan@test.com');
      await user.type(screen.getByPlaceholderText(/^••••••••$/i), 'Password123');
      await user.type(screen.getByPlaceholderText(/Repite tu contraseña/i), 'Password123');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /crear cuenta de agente/i }));
    };

    it('llama a register con role AGENT y los datos del formulario', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({ data: {} });
      renderPage();
      await goToStep2(user);
      await fillAndSubmitStep2(user);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            role: 'AGENT',
            email: 'juan@test.com',
            password: 'Password123',
            phone: '0981234567',
          })
        );
      });
    });

    it('el nombre enviado combina nombre y apellido del paso 1', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({ data: {} });
      renderPage();
      await goToStep2(user);
      await fillAndSubmitStep2(user);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'Juan Pérez' })
        );
      });
    });

    it('navega a /agent/dashboard cuando el backend devuelve tokens', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({
        data: { accessToken: 'tok123', refreshToken: 'ref456', id: 1, email: 'juan@test.com', role: 'AGENT' },
      });
      renderPage();
      await goToStep2(user);
      await fillAndSubmitStep2(user);

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/agent/dashboard')
      );
    });

    it('navega a /login con estado agentRegistered cuando el backend NO devuelve tokens', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({ data: {} });
      renderPage();
      await goToStep2(user);
      await fillAndSubmitStep2(user);

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { agentRegistered: true } })
      );
    });

    it('muestra el error devuelto por el backend en caso de fallo', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValue(new Error('El email ya está registrado'));
      renderPage();
      await goToStep2(user);
      await fillAndSubmitStep2(user);

      expect(
        await screen.findByText(/El email ya está registrado/i)
      ).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('muestra el error genérico de agente cuando el backend no envía mensaje', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValue(new Error());
      renderPage();
      await goToStep2(user);
      await fillAndSubmitStep2(user);

      expect(
        await screen.findByText(/Error al registrar el agente/i)
      ).toBeInTheDocument();
    });

    it('el botón de envío se deshabilita mientras se procesa el registro', async () => {
      const user = userEvent.setup();
      // La promesa nunca resuelve para mantener el estado isSubmitting
      mockRegister.mockReturnValue(new Promise(() => {}));
      renderPage();
      await goToStep2(user);
      await fillAndSubmitStep2(user);

      expect(screen.getByRole('button', { name: /registrando/i })).toBeDisabled();
    });
  });
});
