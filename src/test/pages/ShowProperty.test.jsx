import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../../hooks/useShowProperty', () => ({
  useShowProperty: vi.fn(),
}));

vi.mock('../../hooks/usePropertyPermissions', () => ({
  usePropertyPermissions: vi.fn(),
}));

vi.mock('../../components/Landing/Navbar', () => ({
  default: () => <nav data-testid="navbar" />,
}));

vi.mock('../../components/Landing/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

vi.mock('../../components/commons/ConfirmDialog', () => ({
  default: () => <div data-testid="confirm-dialog" />,
}));

vi.mock('../../components/Agents/PropertyContactCard', () => ({
  default: () => <aside data-testid="contact-card" />,
}));

vi.mock('../../components/properties/PropertySummaryCard/PropertySummaryCard', () => ({
  default: () => <div data-testid="summary-card" />,
}));

vi.mock('../../components/properties/ReportPropertyModal', () => ({
  default: () => <div data-testid="report-property-modal" />,
}));

vi.mock('../../components/users/ReportUserModal', () => ({
  default: () => <div data-testid="report-user-modal" />,
}));

vi.mock('../../components/properties/PropertyStatusBadge', () => ({
  default: () => <span data-testid="status-badge" />,
}));

vi.mock('../../components/properties/PropertyModel3DViewer/PropertyModel3DViewer', () => ({
  default: () => <div data-testid="model-viewer" />,
}));

vi.mock('../../components/properties/PropertyVirtualTour/PropertyVirtualTour', () => ({
  default: () => <div data-testid="virtual-tour" />,
}));

vi.mock('../../components/properties/Property360Tour/Property360Tour', () => ({
  default: () => <div data-testid="tour360" />,
}));

import { useShowProperty } from '../../hooks/useShowProperty';
import { usePropertyPermissions } from '../../hooks/usePropertyPermissions';
import ShowProperty from '../../pages/ShowProperty/ShowProperty';

describe('ShowProperty', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useShowProperty.mockReturnValue({
      property: {
        id: 10,
        title: 'Casa principal',
        description: 'Descripción',
        media: [],
        createdAt: null,
        updatedAt: null,
        ownerName: null,
      },
      loading: false,
      actionLoading: false,
      error: null,
      status: { value: 'PUBLISHED', label: 'Publicado' },
      visibility: { value: 'PUBLIC', label: 'Pública' },
      showConfirm: false,
      confirmData: {},
      hideConfirm: vi.fn(),
      images: ['/main.jpg', '/thumb-1.jpg'],
      features: [],
      priceFormatted: '₲ 100.000',
      propertyTypeLabel: 'Casa',
      mapUrl: 'about:blank',
      formatTimeAgo: vi.fn(() => 'hace poco'),
      openChangeStatusConfirm: vi.fn(),
      openChangeVisibilityConfirm: vi.fn(),
      openDeleteConfirm: vi.fn(),
      PROPERTY_STATUS_OPTIONS: [],
      PROPERTY_VISIBILITY_OPTIONS: [],
      similarProperties: [],
      loadingSimilar: false,
      copyLink: vi.fn(),
      activeFlagCount: 0,
      isAuthenticated: false,
      fetchActiveFlagCount: vi.fn(),
      viewCount: 8,
    });

    usePropertyPermissions.mockReturnValue({
      canChangeStatus: false,
      canChangeVisibility: false,
      canEdit: false,
      canDelete: false,
      canFeature: false,
      isOwner: false,
      isAdmin: false,
      canShare: true,
    });
  });

  it('muestra el badge de visualizaciones sobre la imagen principal', () => {
    render(
      <MemoryRouter initialEntries={['/properties/10']}>
        <Routes>
          <Route path="/properties/:id" element={<ShowProperty />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('8 han visto esta propiedad')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
