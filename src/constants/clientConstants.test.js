import { describe, it, expect } from 'vitest';
import * as clientConstants from './clientConstants';

describe('clientConstants', () => {
  it('has exports defined', () => {
    expect(clientConstants.CLIENT_PRIORITY_LABELS).toBeDefined();
    expect(clientConstants.CLIENT_STATUS_LABELS).toBeDefined();
    expect(clientConstants.FIGMA_COLORS).toBeDefined();
  });
});
