import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../i18n';
import { LANGUAGE_STORAGE_KEY } from '../../i18n/constants';
import LanguageSelector from '../../components/common/LanguageSelector';

function renderSelector() {
  return render(
    <I18nextProvider i18n={i18n}>
      <LanguageSelector />
    </I18nextProvider>
  );
}

describe('LanguageSelector', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'es');
    await initializeI18n();
  });

  it('shows the active language and updates persistence when the user changes it', async () => {
    const user = userEvent.setup();
    renderSelector();

    const trigger = screen.getByRole('button', { name: /idioma|language/i });
    expect(trigger).toHaveTextContent('🇪🇸');
    expect(trigger).toHaveTextContent('ES');

    await user.click(trigger);
    await user.click(screen.getByRole('menuitemradio', { name: /english/i }));

    await waitFor(() => {
      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    });
    await waitFor(() => {
      expect(i18n.language).toBe('en');
    });

    await waitFor(() => {
      expect(trigger).toHaveTextContent('🇺🇸');
      expect(trigger).toHaveTextContent('EN');
    });
  });

  it('renders the Spanish option and keeps the menu accessible', async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(screen.getByRole('button', { name: /idioma|language/i }));

    const menu = screen.getByRole('menu', { name: /idioma|language/i });
    expect(within(menu).getByRole('menuitemradio', { name: /español/i })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitemradio', { name: /english/i })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitemradio', { name: /portugu/i })).toBeInTheDocument();
  });
});
