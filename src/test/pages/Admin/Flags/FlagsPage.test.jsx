import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import FlagsPage from '../../../../pages/Admin/Flags/FlagsPage';
import propertyFlagsApi from '../../../../services/propertyFlagsApi';
import propertyService from '../../../../services/propertyService';

vi.mock('../../../../services/propertyFlagsApi', () => ({
  default: {
    getAllFlags: vi.fn(),
    resolveFlag: vi.fn(),
  },
}));

vi.mock('../../../../services/propertyService', () => ({
  default: {
    getById: vi.fn(),
  },
}));

vi.mock('../../../../components/users/SuspendUserModal', () => ({
  default: () => null,
}));

const flags = [
  {
    id: 1,
    propertyId: 101,
    flagType: 'FRAUD',
    reason: 'Posible estafa con el anuncio',
    reportedByUsername: 'reporter@test.com',
    createdAt: '2026-04-22T12:00:00Z',
    resolvedAt: null,
  },
  {
    id: 2,
    propertyId: 202,
    flagType: 'SPAM',
    reason: 'Contenido repetido',
    reportedByUsername: 'user2@test.com',
    createdAt: '2026-04-20T12:00:00Z',
    resolvedAt: '2026-04-21T10:00:00Z',
    resolutionNotes: 'Resuelto por revisión manual',
  },
];

describe('FlagsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderPage() {
    return render(
      <MemoryRouter>
        <FlagsPage />
      </MemoryRouter>
    );
  }

  it('renders active flags, opens detail and resolves a flag', async () => {
    propertyFlagsApi.getAllFlags.mockImplementation(({ status } = {}) => {
      const payload =
        status === 'RESOLVED' ? [flags[1]] : status === 'ALL' ? flags : [flags[0]];
      return Promise.resolve({ success: true, data: payload });
    });
    propertyService.getById.mockResolvedValue({
      success: true,
      data: { id: 101, title: 'Casa moderna' },
    });
    propertyFlagsApi.resolveFlag.mockResolvedValue({
      success: true,
      data: flags[0],
    });

    renderPage();

    expect(await screen.findByText('Posible estafa con el anuncio')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ver detalle/i }));
    expect(await screen.findByText(/detalle del reporte #1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Casa moderna/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /marcar como resuelto/i }));
    expect(await screen.findByText(/marcar como resuelto/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Se revisó el contenido/i), {
      target: { value: 'Se revisó y se cerró el caso' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirmar resolución/i }));

    await waitFor(() => {
      expect(propertyFlagsApi.resolveFlag).toHaveBeenCalledWith(1, {
        resolutionNotes: 'Se revisó y se cerró el caso',
      });
    });

    await waitFor(() => {
      expect(screen.queryByText('#1')).not.toBeInTheDocument();
    });
  });

  it('filters by type and status', async () => {
    propertyFlagsApi.getAllFlags.mockImplementation(({ status } = {}) => {
      if (status === 'RESOLVED') return Promise.resolve({ success: true, data: [flags[1]] });
      if (status === 'ALL') return Promise.resolve({ success: true, data: flags });
      return Promise.resolve({ success: true, data: [flags[0]] });
    });

    renderPage();

    expect(await screen.findByText('Posible estafa con el anuncio')).toBeInTheDocument();

    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'ALL' },
    });

    expect(await screen.findByText('Contenido repetido')).toBeInTheDocument();

    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'SPAM' },
    });

    await waitFor(() => {
      expect(screen.queryByText('Posible estafa con el anuncio')).not.toBeInTheDocument();
      expect(screen.getByText('Contenido repetido')).toBeInTheDocument();
    });

    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'RESOLVED' },
    });

    expect(await screen.findByText('Contenido repetido')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Posible estafa con el anuncio')).not.toBeInTheDocument();
    });
  });
});
