import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks/useShowProperty', () => ({
  useShowProperty: vi.fn(),
}));

vi.mock('../../../hooks/usePropertyPermissions', () => ({
  usePropertyPermissions: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options = {}) => {
      if (key === 'views.one') return '1 ha visto esta propiedad';
      if (key === 'views.other') return `${options.count} han visto esta propiedad`;
      return key;
    },
  }),
}));

vi.mock('../../../components/Landing/Navbar', () => ({
  default: () => <nav data-testid="navbar" />,
}));

vi.mock('../../../components/Landing/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

vi.mock('../../../components/commons/ConfirmDialog', () => ({
  default: () => null,
}));

vi.mock('../../../components/Agents/PropertyContactCard', () => ({
  default: () => <div data-testid="contact-card" />,
}));

vi.mock('../../../components/properties/PropertySummaryCard/PropertySummaryCard', () => ({
  default: () => <div data-testid="summary-card" />,
}));

vi.mock('../../../components/properties/ReportPropertyModal', () => ({
  default: () => null,
}));

vi.mock('../../../components/users/ReportUserModal', () => ({
  default: () => null,
}));

vi.mock('../../../components/properties/PropertyStatusBadge', () => ({
  default: () => <span data-testid="status-badge" />,
}));

import ShowProperty from '../../../pages/ShowProperty/ShowProperty';
import { useShowProperty } from '../../../hooks/useShowProperty';
import { usePropertyPermissions } from '../../../hooks/usePropertyPermissions';
import { useAuth } from '../../../hooks/useAuth';

const createShowPropertyHookValue = (overrides = {}) => ({
  property: {
    id: 123,
    title: 'Casa Test',
    description: 'Descripción',
    address: 'Calle 1',
    ownerName: 'Ana',
    media: [{ url: 'https://example.com/property.jpg' }],
    createdAt: '2026-04-01T10:00:00',
    updatedAt: '2026-04-01T10:00:00',
    favoriteCount: 0,
  },
  loading: false,
  actionLoading: false,
  error: null,
  status: { label: 'Publicado' },
  visibility: { label: 'Pública' },
  showConfirm: false,
  confirmData: {},
  hideConfirm: vi.fn(),
  images: ['https://example.com/property.jpg'],
  features: [],
  priceFormatted: '₲ 100.000',
  priceDisplay: {
    formatPrice: (value) => ({
      label: `₲ ${String(value)}`,
      displayValue: `₲ ${String(value)}`,
      approximate: false,
      fallbackToPyg: false,
      currencyCode: 'PYG',
    }),
  },
  priceReferenceText: 'Los precios en moneda extranjera son referenciales y se calculan según la cotización de Cambios Chaco.',
  showPriceReferenceNote: false,
  propertyTypeLabel: 'Casa',
  mapUrl: 'about:blank',
  formatTimeAgo: () => 'hace poco',
  openChangeStatusConfirm: vi.fn(),
  openChangeVisibilityConfirm: vi.fn(),
  openDeleteConfirm: vi.fn(),
  PROPERTY_STATUS_OPTIONS: [],
  PROPERTY_VISIBILITY_OPTIONS: [],
  similarProperties: [],
  loadingSimilar: false,
  copyLink: vi.fn(),
  activeFlagCount: 0,
  viewCount: 7,
  isAuthenticated: false,
  fetchActiveFlagCount: vi.fn(),
  ...overrides,
});

describe('ShowProperty', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    usePropertyPermissions.mockReturnValue({
      canChangeStatus: false,
      canChangeVisibility: false,
      canEdit: false,
      canDelete: false,
      canFeature: false,
      isOwner: false,
      isAdmin: false,
    });

    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    useShowProperty.mockReturnValue(createShowPropertyHookValue());
  });

  it('muestra el overlay de visualizaciones en plural sobre la imagen principal', () => {
    render(
      <MemoryRouter>
        <ShowProperty />
      </MemoryRouter>
    );

    expect(screen.getByText('7 han visto esta propiedad')).toBeInTheDocument();
  });

  it('muestra el overlay de visualizaciones en singular cuando hay una visita', () => {
    useShowProperty.mockReturnValue(createShowPropertyHookValue({ viewCount: 1 }));

    render(
      <MemoryRouter>
        <ShowProperty />
      </MemoryRouter>
    );

    expect(screen.getByText('1 ha visto esta propiedad')).toBeInTheDocument();
  });

  it('oculta el overlay de visualizaciones cuando no hay visitas', () => {
    useShowProperty.mockReturnValue(createShowPropertyHookValue({ viewCount: 0 }));

    render(
      <MemoryRouter>
        <ShowProperty />
      </MemoryRouter>
    );

    expect(screen.queryByText(/ha visto esta propiedad/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/han visto esta propiedad/i)).not.toBeInTheDocument();
  });
});
