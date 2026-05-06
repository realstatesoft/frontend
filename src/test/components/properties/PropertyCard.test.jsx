import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../../i18n';
import PropertyCard from '../../../components/properties/PropertyCard';

const mockUsePropertyPriceDisplay = vi.fn();

vi.mock('../../../hooks/usePropertyPriceDisplay', () => ({
  default: (...args) => mockUsePropertyPriceDisplay(...args),
}));

vi.mock('../../../components/properties/FavoriteToggleButton', () => ({
  default: ({ ariaLabel }) => <button type="button" aria-label={ariaLabel}>fav</button>,
}));

describe('PropertyCard', () => {
  beforeEach(async () => {
    mockUsePropertyPriceDisplay.mockReset();
    mockUsePropertyPriceDisplay.mockReturnValue({
      label: 'Aprox. US$ 1,000.00',
    });
    await initializeI18n();
  });

  it('renders an approximate USD price for a property card', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <PropertyCard
            property={{
              id: 1,
              title: 'Casa Test',
              status: 'PUBLISHED',
              propertyType: 'HOUSE',
              price: 6360000,
              address: 'Calle 1',
            }}
            onToggleFavorite={vi.fn()}
          />
        </MemoryRouter>
      </I18nextProvider>
    );

    expect(screen.getByText('Aprox. US$ 1,000.00')).toBeInTheDocument();
    expect(mockUsePropertyPriceDisplay).toHaveBeenCalledWith(6360000);
  });
});
