import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RentConfigPage from './RentConfigPage';
import rentService from '../../../services/rentService';

vi.mock('../../../services/rentService', () => ({
  default: {
    getRentConfig: vi.fn(),
    updateRentConfig: vi.fn(),
  },
}));

describe('RentConfigPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('preserves a stored zero commission instead of replacing it with the default', async () => {
    rentService.getRentConfig.mockResolvedValue({
      data: { depositMonths: 0, commissionPercent: 0 },
    });

    render(<RentConfigPage />);

    const depositInput = await screen.findByLabelText(/Meses de depósito/i);
    const commissionInput = screen.getByLabelText(/Porcentaje de comisión/i);

    expect(depositInput).toHaveValue('0');
    expect(commissionInput).toHaveValue('0');
  });

  it('rejects non-finite / out-of-range input without calling the API', async () => {
    rentService.getRentConfig.mockResolvedValue({
      data: { depositMonths: 2, commissionPercent: 50 },
    });
    const user = userEvent.setup();

    render(<RentConfigPage />);

    const depositInput = await screen.findByLabelText(/Meses de depósito/i);
    await user.clear(depositInput);
    await user.type(depositInput, '99');

    await user.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    expect(rentService.updateRentConfig).not.toHaveBeenCalled();
  });

  it('clears the success message when the user edits a field', async () => {
    rentService.getRentConfig.mockResolvedValue({
      data: { depositMonths: 2, commissionPercent: 50 },
    });
    rentService.updateRentConfig.mockResolvedValue({ data: {} });
    const user = userEvent.setup();

    render(<RentConfigPage />);

    await user.click(await screen.findByRole('button', { name: /Guardar cambios/i }));
    expect(await screen.findByText(/guardada exitosamente/i)).toBeInTheDocument();

    const depositInput = screen.getByLabelText(/Meses de depósito/i);
    await user.clear(depositInput);
    await user.type(depositInput, '3');

    await waitFor(() => {
      expect(screen.queryByText(/guardada exitosamente/i)).not.toBeInTheDocument();
    });
  });
});