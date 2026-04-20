import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Badge from '../../../components/common/Badge/Badge';

// Mock styles
vi.mock('../../../components/common/Badge/Badge.module.scss', () => ({
  default: {
    badge: 'badge',
    'badge--success': 'badge--success',
    'badge--neutral': 'badge--neutral',
  }
}));

describe('Badge component', () => {
  it('renders children correctly', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies correct variant class', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge.className).toContain('badge');
    expect(badge.className).toContain('badge--success');
  });

  it('defaults to neutral variant if unknown variant provided', () => {
    render(<Badge variant="unknown">Unknown</Badge>);
    const badge = screen.getByText('Unknown');
    expect(badge.className).toContain('badge--neutral');
  });
});
