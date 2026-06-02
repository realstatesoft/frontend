import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ConversionFunnelPage from '../../../pages/ConversionFunnel/ConversionFunnelPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('../../../hooks/useFormatters', () => ({
  __esModule: true,
  default: () => ({
    formatCurrency: (val) => `$${val}`,
  }),
}));

vi.mock('../../../hooks/useConversionFunnel', () => ({
  __esModule: true,
  default: () => ({
    summaryQuery: { data: { current: {}, rates: {}, kpis: {}, series: [] }, isPending: false },
    topQuery: { data: [], isPending: false },
  }),
}));

vi.mock('recharts', () => {
  const OriginalRecharts = vi.importActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    LineChart: () => <div>LineChart</div>,
  };
});

describe('ConversionFunnelPage', () => {
  it('should render the funnel page', () => {
    render(
      <BrowserRouter>
        <ConversionFunnelPage />
      </BrowserRouter>
    );
    expect(screen.getAllByText(/title/i).length).toBeGreaterThan(0);
  });
});
