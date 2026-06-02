import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminSettingsPage from '../../../pages/Admin/Settings/AdminSettingsPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, def) => def || key,
  }),
}));

vi.mock('../../../services/settingsService', () => ({
  __esModule: true,
  default: {
    getAdminSettings: vi.fn().mockResolvedValue({
      data: {
        commissions: {},
        reservations: {},
        properties: {},
        system: { defaultCurrency: 'PYG' }
      }
    }),
    updateAdminCommissions: vi.fn(),
  },
}));

describe('AdminSettingsPage', () => {
  it('should render the settings page without crashing', async () => {
    render(<AdminSettingsPage />);
    await waitFor(() => {
      expect(screen.getByText(/settings.system.title/i)).toBeInTheDocument();
    });
  });
});
