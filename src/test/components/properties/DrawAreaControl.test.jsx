import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// ─── Mocks hoisted para que estén disponibles dentro de vi.mock factories ─────
const mockMap = vi.hoisted(() => ({
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  addControl: vi.fn(),
  removeControl: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
}));

const mockDrawnItems = vi.hoisted(() => ({
  clearLayers: vi.fn(),
  addLayer: vi.fn(),
}));

// ─── Mocks de módulos ─────────────────────────────────────────────────────────
vi.mock('leaflet-draw/dist/leaflet.draw.css', () => ({}));
vi.mock('leaflet-draw', () => ({}));

vi.mock('react-leaflet', () => ({
  useMap: () => mockMap,
}));

vi.mock('leaflet', () => {
  const MockDrawControl = vi.fn().mockImplementation(function () { return { _mock: true }; });
  const L = {
    // eslint-disable-next-line object-shorthand
    FeatureGroup: vi.fn().mockImplementation(function () { return mockDrawnItems; }),
    Control: { Draw: MockDrawControl },
    Draw: {
      Event: {
        CREATED: 'draw:created',
        DELETED: 'draw:deleted',
      },
    },
  };
  return { default: L };
});

// Importar después de los mocks
import DrawAreaControl from '../../../components/properties/DrawAreaControl';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Devuelve el handler registrado para un evento en mockMap.on */
function captureHandler(eventName) {
  const call = mockMap.on.mock.calls.find(([ev]) => ev === eventName);
  expect(call, `Handler para '${eventName}' no fue registrado`).toBeTruthy();
  return call[1];
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DrawAreaControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza sin lanzar errores y devuelve null', () => {
    const { container } = render(
      <DrawAreaControl onAreaDrawn={vi.fn()} onAreaCleared={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('agrega el control de dibujo al mapa al montar', () => {
    render(<DrawAreaControl onAreaDrawn={vi.fn()} onAreaCleared={vi.fn()} />);
    expect(mockMap.addControl).toHaveBeenCalledTimes(1);
    expect(mockMap.addLayer).toHaveBeenCalledTimes(1);
  });

  it('registra handlers para draw:created y draw:deleted', () => {
    render(<DrawAreaControl onAreaDrawn={vi.fn()} onAreaCleared={vi.fn()} />);
    const createdCalls = mockMap.on.mock.calls.filter(([ev]) => ev === 'draw:created');
    const deletedCalls = mockMap.on.mock.calls.filter(([ev]) => ev === 'draw:deleted');
    expect(createdCalls).toHaveLength(1);
    expect(deletedCalls).toHaveLength(1);
  });

  it('llama a onAreaDrawn con datos de polígono al dibujar un polígono', () => {
    const onAreaDrawn = vi.fn();
    render(<DrawAreaControl onAreaDrawn={onAreaDrawn} onAreaCleared={vi.fn()} />);

    const handler = captureHandler('draw:created');
    handler({
      layerType: 'polygon',
      layer: {
        getLatLngs: () => [[
          { lat: 1, lng: 2 },
          { lat: 3, lng: 4 },
          { lat: 5, lng: 6 },
        ]],
      },
    });

    expect(onAreaDrawn).toHaveBeenCalledOnce();
    expect(onAreaDrawn).toHaveBeenCalledWith({
      type: 'polygon',
      polygon: [[1, 2], [3, 4], [5, 6]],
    });
  });

  it('llama a onAreaDrawn con datos de círculo al dibujar un círculo', () => {
    const onAreaDrawn = vi.fn();
    render(<DrawAreaControl onAreaDrawn={onAreaDrawn} onAreaCleared={vi.fn()} />);

    const handler = captureHandler('draw:created');
    handler({
      layerType: 'circle',
      layer: {
        getLatLng: () => ({ lat: -25.28, lng: -57.64 }),
        getRadius: () => 500,
      },
    });

    expect(onAreaDrawn).toHaveBeenCalledOnce();
    expect(onAreaDrawn).toHaveBeenCalledWith({
      type: 'circle',
      circleLat: -25.28,
      circleLng: -57.64,
      circleRadiusMeters: 500,
    });
  });

  it('llama a onAreaCleared al eliminar el área dibujada', () => {
    const onAreaCleared = vi.fn();
    render(<DrawAreaControl onAreaDrawn={vi.fn()} onAreaCleared={onAreaCleared} />);

    const handler = captureHandler('draw:deleted');
    handler();

    expect(onAreaCleared).toHaveBeenCalledOnce();
  });

  it('limpia capas anteriores antes de agregar una nueva figura', () => {
    render(<DrawAreaControl onAreaDrawn={vi.fn()} onAreaCleared={vi.fn()} />);

    const handler = captureHandler('draw:created');
    handler({
      layerType: 'circle',
      layer: {
        getLatLng: () => ({ lat: 0, lng: 0 }),
        getRadius: () => 100,
      },
    });

    expect(mockDrawnItems.clearLayers).toHaveBeenCalledTimes(1);
    expect(mockDrawnItems.addLayer).toHaveBeenCalledTimes(1);
  });

  it('limpia handlers y controles al desmontar el componente', () => {
    const { unmount } = render(
      <DrawAreaControl onAreaDrawn={vi.fn()} onAreaCleared={vi.fn()} />
    );
    unmount();

    expect(mockMap.off).toHaveBeenCalledWith('draw:created', expect.any(Function));
    expect(mockMap.off).toHaveBeenCalledWith('draw:deleted', expect.any(Function));
    expect(mockMap.removeControl).toHaveBeenCalledTimes(1);
    expect(mockMap.removeLayer).toHaveBeenCalledTimes(1);
  });
});
