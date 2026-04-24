import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../i18n';
import { CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY } from '../../store/useCurrencyStore';
import useCurrencyStore from '../../store/useCurrencyStore';
import CurrencySelector from '../../components/common/CurrencySelector';

function renderSelector() {
  return render(
    <I18nextProvider i18n={i18n}>
      <CurrencySelector />
    </I18nextProvider>
  );
}

describe('CurrencySelector', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem(CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY);
    useCurrencyStore.setState({ selectedCurrency: DEFAULT_CURRENCY });
    await initializeI18n();
  });

  it('shows the active currency and updates persistence when the user changes it', async () => {
    const user = userEvent.setup();
    renderSelector();

    const trigger = screen.getByRole('button', { name: /currency/i });
    expect(trigger).toHaveTextContent('₲');
    expect(trigger).toHaveTextContent('PYG');

    await user.click(trigger);
    await user.click(screen.getByRole('menuitemradio', { name: /usd/i }));

    await waitFor(() => {
      expect(localStorage.getItem(CURRENCY_STORAGE_KEY)).toBe('USD');
    });
    await waitFor(() => {
      expect(useCurrencyStore.getState().selectedCurrency).toBe('USD');
    });

    await waitFor(() => {
      expect(trigger).toHaveTextContent('$');
      expect(trigger).toHaveTextContent('USD');
    });
  });

  it('renders the three supported currencies in an accessible menu', async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(screen.getByRole('button', { name: /currency/i }));

    expect(screen.getByRole('menu', { name: /currency/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: /pyg/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: /usd/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: /brl/i })).toBeInTheDocument();
  });
});
