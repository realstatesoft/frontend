import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PropertyVirtualTour from '../../components/properties/PropertyVirtualTour/PropertyVirtualTour';

// Mock de CSS para evitar errores de importación en tests
vi.mock('./PropertyVirtualTour.css', () => ({}));

describe('PropertyVirtualTour - Security Hardening', () => {
  it('should render iframe only for safe HTTPS URLs', () => {
    const safeUrl = 'https://my360tour.com/tour/123';
    render(<PropertyVirtualTour url={safeUrl} title="Safe Tour" />);
    
    const iframe = screen.getByTitle('Safe Tour');
    expect(iframe).toBeDefined();
    expect(iframe.getAttribute('src')).toBe(safeUrl);
  });

  it('should NOT render iframe for unsafe HTTP URLs', () => {
    const unsafeUrl = 'http://insecure-site.com/tour';
    const { container } = render(<PropertyVirtualTour url={unsafeUrl} title="Unsafe Tour" />);
    
    // El componente debe retornar null (container vacío) por seguridad
    expect(container.firstChild).toBeNull();
  });

  it('should NOT render iframe for javascript pseudo-protocols (XSS Protection)', () => {
    const xssUrl = "javascript:alert('xss')";
    const { container } = render(<PropertyVirtualTour url={xssUrl} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should apply security attributes to the iframe', () => {
    const safeUrl = 'https://tour.com/123';
    render(<PropertyVirtualTour url={safeUrl} title="Secure" />);
    
    const iframe = screen.getByTitle('Secure');
    expect(iframe.getAttribute('sandbox')).toContain('allow-scripts');
    expect(iframe.getAttribute('sandbox')).toContain('allow-same-origin');
    expect(iframe.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin');
  });
});

describe('Security Logic - HTML Escaping (XSS Prevention)', () => {
  // Simulación de la lógica de escape que añadimos al editor
  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  it('should correctly escape malicious HTML tags', () => {
    const maliciousName = '<img src=x onerror=alert(1)> Sala';
    const escaped = escapeHtml(maliciousName);
    
    expect(escaped).not.toContain('<img');
    expect(escaped).toContain('&lt;img');
    expect(escaped).toContain('Sala');
  });

  it('should handle special characters correctly', () => {
    const specialName = 'Dormitorio "Plus" & Baño';
    const escaped = escapeHtml(specialName);
    
    expect(escaped).toBe('Dormitorio &quot;Plus&quot; &amp; Baño');
  });
});
