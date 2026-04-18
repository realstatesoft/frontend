import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import AdminDocumentsPage from '../../pages/Admin/AdminDocumentsPage';
import api from '../../services/api';
import Swal from 'sweetalert2';

// ── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  }
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn()
  }
}));

// ── Datos de prueba ─────────────────────────────────────────────────────────

const mockDocuments = [
  {
    id: 101,
    userId: 1,
    userName: "Ana Perez",
    userEmail: "ana@example.com",
    documentType: "ID_FRONT",
    documentStatus: "APPROVED",
    size: 102400,
    createdAt: "2024-03-01T10:00:00Z"
  },
  {
    id: 102,
    userId: 1,
    userName: "Ana Perez",
    userEmail: "ana@example.com",
    documentType: "ID_BACK",
    documentStatus: "APPROVED",
    size: 102400,
    createdAt: "2024-03-01T10:01:00Z"
  },
  {
    id: 103,
    userId: 1,
    userName: "Ana Perez",
    userEmail: "ana@example.com",
    documentType: "SELFIE",
    documentStatus: "PENDING",
    size: 204800,
    createdAt: "2024-03-01T10:02:00Z"
  },
  {
    id: 201,
    userId: 2,
    userName: "Carlos Lopez",
    userEmail: "carlos@example.com",
    documentType: "PROOF_OF_ADDRESS",
    documentStatus: "REJECTED",
    notes: "No se ve la dirección",
    size: 500000,
    createdAt: "2024-03-02T11:00:00Z"
  }
];

// Ana tiene 2 aprobados, 1 pendiente, 1 faltante -> Estado: En revisión
// Carlos tiene 1 rechazado, 3 faltantes -> Estado: Incompleto

describe('AdminDocumentsPage KYC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { success: true, data: { content: [], last: true } } });
  });

  it('renderiza la cabecera y el estado vacío correctamente', async () => {
    render(<AdminDocumentsPage />);
    
    expect(screen.getByText('Verificación de Identidad (KYC)')).toBeInTheDocument();
    
    // Debería verse el estado de carga primero
    expect(document.querySelector('.spinner-border')).toBeInTheDocument();
    
    // Luego el empty state
    await waitFor(() => {
      expect(screen.getByText('No hay solicitudes que coincidan.')).toBeInTheDocument();
    });
  });

  it('agrupa documentos por usuario y calcula el estado general', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: { content: mockDocuments, last: true } } });
    render(<AdminDocumentsPage />);

    // Esperar a que rendericen las tarjetas de usuario
    await waitFor(() => {
      expect(screen.getByText('Ana Perez')).toBeInTheDocument();
      expect(screen.getByText('Carlos Lopez')).toBeInTheDocument();
    });

    // Ana: 2 approved, 1 pending, 1 missing
    // -> Su estado global es "En revisión" (hasPending = true)
    // Carlos: 1 rejected, 0 pending, 0 approved
    // -> Su estado global es "Incompleto"

    // Comprobar que existen los textos en pantalla
    expect(screen.getAllByText(/En revisión/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Incompleto/i).length).toBeGreaterThan(0);

    // Comprobar estadísticas en la parte superior
    const statsContainer = document.querySelector('.kyc-stats');
    const { getByText } = within(statsContainer);
    
    // Total users: 2
    const totalLabel = getByText('Solicitudes totales');
    expect(within(totalLabel.parentElement).getByText('2')).toBeInTheDocument();
    
    const pendingLabel = getByText('En revisión');
    expect(within(pendingLabel.parentElement).getByText('1')).toBeInTheDocument();
    
    const verifiedLabel = getByText('Verificados');
    expect(within(verifiedLabel.parentElement).getByText('0')).toBeInTheDocument();
  });

  it('abre el modal de perfil de usuario correctamente', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: { content: mockDocuments, last: true } } });
    render(<AdminDocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Ana Perez')).toBeInTheDocument();
    });

    // Hacer click en el botón del perfil de Ana
    const btn = screen.getAllByText('Revisar perfil')[0];
    fireEvent.click(btn);

    // Debe abrirse el modal (verificamos que el título/texto esté en el DOM Modal)
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Revisión de Solicitud/i)).toBeInTheDocument();
    
    // Verify specific documents are shown inside the modal
    expect(within(dialog).getByText('Cédula — Frente')).toBeInTheDocument();
    
    // Ana tiene ID_FRONT como Aprobado y SELFIE como Pendiente
    // Debería haber botones Aprobar / Rechazar para SELFIE
    expect(screen.getByText('Aprobar')).toBeInTheDocument();
    expect(screen.getByText('Rechazar')).toBeInTheDocument();
  });

  it('filtra correctamente por estado', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: { content: mockDocuments, last: true } } });
    render(<AdminDocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Ana Perez')).toBeInTheDocument();
      expect(screen.getByText('Carlos Lopez')).toBeInTheDocument();
    });

    // Cambiar filtro a "Con docs pendientes"
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'PENDING' } });

    // Solo Ana debe estar visible
    expect(screen.getByText('Ana Perez')).toBeInTheDocument();
    expect(screen.queryByText('Carlos Lopez')).not.toBeInTheDocument();

    // Cambiar filtro a "Con rechazos"
    fireEvent.change(select, { target: { value: 'REJECTED' } });

    // Solo Carlos debe estar visible
    expect(screen.queryByText('Ana Perez')).not.toBeInTheDocument();
    expect(screen.getByText('Carlos Lopez')).toBeInTheDocument();
  });

  it('aprueba un documento pendiente', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: { content: mockDocuments, last: true } } }) // first load
           .mockResolvedValueOnce({ data: { success: true, data: { content: mockDocuments, last: true } } }); // reload after approve
           
    api.patch.mockResolvedValueOnce({});

    render(<AdminDocumentsPage />);

    await waitFor(() => screen.getByText('Ana Perez'));

    // Abrir Perfil
    fireEvent.click(screen.getAllByText('Revisar perfil')[0]);
    
    // Click en Aprobar
    const approveBtn = screen.getByText('Aprobar');
    fireEvent.click(approveBtn);

    // Debería llamar a API patch
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/users/documents/103/status', {
        documentStatus: 'APPROVED'
      });
      // Verifica que SweetAlert de éxito también se mostró
      expect(Swal.fire).toHaveBeenCalledWith(
        'Aprobado ✅',
        'El documento fue verificado.',
        'success'
      );
    });
  });
});
