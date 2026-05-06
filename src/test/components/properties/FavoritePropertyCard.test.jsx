import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FavoritePropertyCard from '../../../components/properties/FavoritePropertyCard';

const mockUsePropertyPriceDisplay = vi.fn();

vi.mock('../../../hooks/usePropertyPriceDisplay', () => ({
  default: (...args) => mockUsePropertyPriceDisplay(...args),
}));

vi.mock('../../../components/properties/FavoriteToggleButton', () => ({
  default: ({ ariaLabel }) => <button type="button" aria-label={ariaLabel}>fav</button>,
}));

describe('FavoritePropertyCard', () => {
  beforeEach(() => {
    mockUsePropertyPriceDisplay.mockReset();
    mockUsePropertyPriceDisplay.mockReturnValue({
      label: 'Aprox. R$ 2.000,00',
    });
  });

  it('renders an approximate BRL price for a favorite property card', () => {
    render(
      <MemoryRouter>
        <FavoritePropertyCard
          property={{
            id: 2,
            title: 'Casa Favorita',
            status: 'PUBLISHED',
            price: 2520000,
            address: 'Calle 2',
          }}
          onRemoveFavorite={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Aprox. R$ 2.000,00')).toBeInTheDocument();
    expect(mockUsePropertyPriceDisplay).toHaveBeenCalledWith(2520000);
  });
});
