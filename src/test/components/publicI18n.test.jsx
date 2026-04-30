import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../i18n';
import HeroSection from '../../components/Landing/HeroSection';

function renderHero() {
  return render(
    <I18nextProvider i18n={i18n}>
      <HeroSection />
    </I18nextProvider>
  );
}

describe('Public i18n surface', () => {
  beforeEach(async () => {
    localStorage.clear();
    await initializeI18n();
  });

  it('changes public content when the language changes', async () => {
    renderHero();

    expect(
      screen.getByRole('heading', { name: /la forma más inteligente de comprar, vender o alquilar/i })
    ).toBeInTheDocument();

    await i18n.changeLanguage('en');

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /the smartest way to buy, sell, or rent/i })
      ).toBeInTheDocument();
    });
  });
});
