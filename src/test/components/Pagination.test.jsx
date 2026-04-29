import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../i18n';
import Pagination from '../../components/properties/Pagination';

function renderPagination() {
  return render(
    <I18nextProvider i18n={i18n}>
      <Pagination currentPage={2} totalPages={4} onPageChange={() => {}} />
    </I18nextProvider>
  );
}

describe('Pagination', () => {
  beforeEach(async () => {
    await initializeI18n();
  });

  it('usa los textos traducidos para navegación', () => {
    renderPagination();
    expect(screen.getByTitle('Anterior')).toBeInTheDocument();
    expect(screen.getByTitle('Siguiente')).toBeInTheDocument();
  });
});
