import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Card from '../../../components/common/Card/Card';

// Mock styles
vi.mock('../../../components/common/Card/Card.module.scss', () => ({
  default: {
    card: 'card',
    'card--md': 'card--md',
    'card--lg': 'card--lg',
    'card--hoverable': 'card--hoverable',
    card__header: 'card__header',
    card__title: 'card__title',
    card__subtitle: 'card__subtitle',
  }
}));

describe('Card component', () => {
  it('renders children correctly', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders title and subtitle', () => {
    render(<Card title="My Title" subtitle="My Subtitle">Content</Card>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Subtitle')).toBeInTheDocument();
  });

  it('renders headerRight content', () => {
    render(<Card headerRight={<span>Right side</span>}>Content</Card>);
    expect(screen.getByText('Right side')).toBeInTheDocument();
  });

  it('applies hoverable class when prop is true', () => {
    render(<Card hoverable>Content</Card>);
    const cardDiv = screen.getByText('Content');
    expect(cardDiv.className).toContain('card--hoverable');
  });

  it('applies specified padding class', () => {
    render(<Card padding="lg">Content</Card>);
    const cardDiv = screen.getByText('Content');
    expect(cardDiv.className).toContain('card--lg');
  });

  it('does not render header if no title or headerRight is provided', () => {
    const { container } = render(<Card>Just content</Card>);
    expect(container.querySelector('.card__header')).toBeNull();
  });

  it('applies additional className', () => {
    render(<Card className="custom-class">Content</Card>);
    const cardDiv = screen.getByText('Content');
    expect(cardDiv.className).toContain('custom-class');
  });
});
