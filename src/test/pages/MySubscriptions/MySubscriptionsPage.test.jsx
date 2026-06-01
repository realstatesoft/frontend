import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MySubscriptionsPage from '../../../pages/MySubscriptions/MySubscriptionsPage';
import subscriptionApi from '../../../services/subscriptions/subscriptionApi';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock('../../../hooks/useFormatters', () => ({
  __esModule: true,
  default: () => ({
    formatDate: (val) => val,
  }),
}));

vi.mock('../../../components/Landing/Navbar', () => ({
  __esModule: true,
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../../../components/Landing/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('../../../services/subscriptions/subscriptionApi', () => ({
  __esModule: true,
  default: {
    getMyActiveSubscription: vi.fn(),
    getMySubscriptions: vi.fn(),
    cancelSubscription: vi.fn(),
  },
}));

describe('MySubscriptionsPage', () => {
  it('should render and load data', async () => {
    subscriptionApi.getMyActiveSubscription.mockResolvedValue({
      data: { data: { id: 1, status: 'ACTIVE', plan: { name: 'Premium' } } },
    });
    subscriptionApi.getMySubscriptions.mockResolvedValue({
      data: { data: { content: [], totalPages: 0 } },
    });

    render(
      <BrowserRouter>
        <MySubscriptionsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });
  });
});
