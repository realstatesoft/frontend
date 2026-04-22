import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PropertyFloorPlansViewer from '../../../components/properties/PropertyFloorPlansViewer/PropertyFloorPlansViewer';
import { usePropertyFloorPlans } from '../../../hooks/usePropertyFloorPlans';
import React from 'react';

// Mock del hook
vi.mock('../../../hooks/usePropertyFloorPlans', () => ({
  usePropertyFloorPlans: vi.fn(),
}));

describe('PropertyFloorPlansViewer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra un spinner cuando loading es true', () => {
    usePropertyFloorPlans.mockReturnValue({
      floorPlans: [],
      loading: true,
      error: null,
    });

    render(<PropertyFloorPlansViewer propertyId={123} />);
    
    expect(screen.getByText(/cargando planos/i)).toBeDefined();
    // No debería haber mensajes de error ni empty states
    expect(screen.queryByText(/sin planos disponibles/i)).toBeNull();
  });

  it('muestra el mensaje de error cuando ocurre uno', () => {
    usePropertyFloorPlans.mockReturnValue({
      floorPlans: [],
      loading: false,
      error: 'Error al cargar',
    });

    render(<PropertyFloorPlansViewer propertyId={123} />);

    expect(screen.getByText('Error al cargar')).toBeDefined();
  });

  it('muestra el empty state cuando no hay planos', () => {
    usePropertyFloorPlans.mockReturnValue({
      floorPlans: [],
      loading: false,
      error: null,
    });

    render(<PropertyFloorPlansViewer propertyId={123} />);

    expect(screen.getByText('Sin planos disponibles')).toBeDefined();
    expect(screen.getByText(/Esta propiedad aún no tiene planos de piso cargados/i)).toBeDefined();
  });

  it('renderiza tarjetas de vista previa cuando hay planos', () => {
    const mockPlans = [
      { id: 1, url: 'plano1.pdf', type: 'FLOOR_PLAN', title: 'Planta Alta' },
      { id: 2, url: 'plano2.jpg', type: 'FLOOR_PLAN', title: 'Planta Baja', thumbnailUrl: 'thumb.jpg' },
    ];

    usePropertyFloorPlans.mockReturnValue({
      floorPlans: mockPlans,
      loading: false,
      error: null,
    });

    render(<PropertyFloorPlansViewer propertyId={123} />);

    // Verificar que se renderizan las tarjetas
    expect(screen.getByLabelText(/Ver plano: Planta Alta/i)).toBeDefined();
    expect(screen.getByLabelText(/Ver plano: Planta Baja/i)).toBeDefined();

    // El primer plano es PDF
    expect(screen.getByText('Planta Alta')).toBeDefined();
    
    // El segundo plano es imagen
    expect(screen.getByText('Planta Baja')).toBeDefined();
  });

  it('abre y cierra el lightbox al hacer click en una tarjeta (imagen)', () => {
    const mockPlans = [
      { id: 2, url: 'plano2.jpg', type: 'FLOOR_PLAN', title: 'Planta Baja', thumbnailUrl: 'thumb.jpg' },
    ];

    usePropertyFloorPlans.mockReturnValue({
      floorPlans: mockPlans,
      loading: false,
      error: null,
    });

    render(<PropertyFloorPlansViewer propertyId={123} />);

    // El lightbox no está activo inicialmente
    expect(screen.queryByRole('dialog')).toBeNull();

    // Click en la tarjeta
    const card = screen.getByLabelText(/Ver plano: Planta Baja/i);
    fireEvent.click(card);

    // El lightbox debería abrirse
    const dialog = screen.getByRole('dialog', { name: /Vista del plano/i });
    expect(dialog).toBeDefined();
    
    // El lightbox debe contener la imagen
    const img = within(dialog).getByAltText('Planta Baja');
    expect(img.getAttribute('src')).toBe('plano2.jpg');

    // Cerrar el lightbox
    const closeBtn = screen.getByRole('button', { name: /Cerrar/i });
    fireEvent.click(closeBtn);

    // El lightbox debería estar cerrado
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('abre el lightbox con iframe para PDFs', () => {
    const mockPlans = [
      { id: 1, url: 'https://ejemplo.com/plano.pdf', type: 'FLOOR_PLAN', title: 'PDF Plano' },
    ];

    usePropertyFloorPlans.mockReturnValue({
      floorPlans: mockPlans,
      loading: false,
      error: null,
    });

    render(<PropertyFloorPlansViewer propertyId={123} />);

    // Click en la tarjeta
    const card = screen.getByLabelText(/Ver plano: PDF Plano/i);
    fireEvent.click(card);

    // El lightbox debe contener un iframe para el PDF
    const iframe = screen.getByTitle('PDF Plano');
    expect(iframe).toBeDefined();
    expect(iframe.getAttribute('src')).toBe('https://ejemplo.com/plano.pdf');
  });
});
