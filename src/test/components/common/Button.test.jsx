import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../../../components/common/Button/Button';

// Mock styles
vi.mock('../../../components/common/Button/Button.module.scss', () => ({
  default: {
    button: 'button',
    'button--primary': 'button--primary',
    'button--secondary': 'button--secondary',
    'button--sm': 'button--sm',
    'button--lg': 'button--lg',
    'button--full': 'button--full',
  }
}));

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies default primary variant', () => {
    render(<Button>Btn</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('button--primary');
  });

  it('applies specified variant and size', () => {
    render(<Button variant="secondary" size="sm">Btn</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('button--secondary');
    expect(btn.className).toContain('button--sm');
  });

  it('applies fullWidth class when prop is true', () => {
    render(<Button fullWidth>Full</Button>);
    expect(screen.getByRole('button').className).toContain('button--full');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has correct type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('passes additional props to the button element', () => {
    render(<Button data-testid="custom-btn" aria-label="custom">Btn</Button>);
    expect(screen.getByTestId('custom-btn')).toBeInTheDocument();
    expect(screen.getByLabelText('custom')).toBeInTheDocument();
  });
});
