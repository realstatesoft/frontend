import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../../i18n';
import PropertiesMap from '../../../components/properties/PropertiesMap';

vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: vi.fn(),
      },
    },
    latLngBounds: vi.fn(() => ({})),
  },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div role="dialog">{children}</div>,
  TileLayer: () => null,
  useMap: () => ({
    setView: vi.fn(),
    fitBounds: vi.fn(),
  }),
}));

vi.mock('../../../hooks/usePropertyPriceDisplay', () => ({
  default: vi.fn(() => ({
    formatPrice: (value) => ({
      label: `₲ ${String(value)}`,
      displayValue: `₲ ${String(value)}`,
      approximate: false,
      fallbackToPyg: false,
      currencyCode: 'PYG',
    }),
  })),
}));

function renderMap(properties) {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <PropertiesMap properties={properties} />
      </MemoryRouter>
    </I18nextProvider>
  );
}

describe('PropertiesMap', () => {
  beforeEach(async () => {
    localStorage.clear();
    await initializeI18n();
  });

  it('renderiza textos en inglés cuando ese idioma está activo', async () => {
    await i18n.changeLanguage('en');

    renderMap([
      {
        id: 1,
        title: 'River View Apartment',
        address: '123 Main St',
        propertyType: 'APARTMENT',
        price: 250000,
        bedrooms: 2,
        bathrooms: 1,
        surfaceArea: 95,
        lat: -27.33,
        lng: -55.86,
      },
    ]);

    expect(screen.getByText('Results map')).toBeInTheDocument();
    expect(screen.getByText('Property locations')).toBeInTheDocument();
    expect(screen.getByText('Explore the visible properties on the map with the current filters.')).toBeInTheDocument();
    expect(screen.getByText('1 point')).toBeInTheDocument();

    const popup = screen.getByRole('dialog');
    expect(within(popup).getByText(/2 beds/i)).toBeInTheDocument();
    expect(within(popup).getByText(/1 bath/i)).toBeInTheDocument();
    expect(within(popup).getByText(/95 m²/i)).toBeInTheDocument();
    expect(within(popup).getByRole('link', { name: 'View details' })).toBeInTheDocument();
  });

  it('renderiza textos en portugués cuando ese idioma está activo', async () => {
    await i18n.changeLanguage('pr');

    renderMap([]);

    expect(screen.getByText('Mapa dos resultados')).toBeInTheDocument();
    expect(screen.getByText('Localização dos imóveis')).toBeInTheDocument();
    expect(screen.getByText('Não há imóveis com coordenadas disponíveis para mostrar no mapa com os filtros atuais.')).toBeInTheDocument();
  });
});
