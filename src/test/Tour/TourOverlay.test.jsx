import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../i18n';
import TourOverlay from '../../components/common/Tour/TourOverlay';
import useTourStore from '../../store/useTourStore';

const CENTER_STEPS = [
  { id: 'welcome', target: null, title: 'Bienvenido', content: 'Hola mundo', placement: 'center' },
  { id: 'step2', target: null, title: 'Paso 2', content: 'Segundo paso', placement: 'center' },
];

const TARGET_STEPS = [
  { id: 'sidebar', target: '[data-tour="sidebar"]', title: 'Sidebar', content: 'El menú', placement: 'right' },
];

beforeEach(async () => {
  act(() => {
    useTourStore.setState({ isActive: false, currentStep: 0, steps: [], tourId: null });
  });
  await initializeI18n();
});

describe('TourOverlay — sin target (centro)', () => {
  it('renders nothing when tour is not active', () => {
    const { container } = render(<I18nextProvider i18n={i18n}><TourOverlay /></I18nextProvider>);
    expect(container.firstChild).toBeNull();
  });

  it('renders tooltip when tour is active', () => {
    act(() => useTourStore.getState().startTour('agent', CENTER_STEPS));
    render(<I18nextProvider i18n={i18n}><TourOverlay /></I18nextProvider>);
    expect(screen.getByText('Bienvenido')).toBeInTheDocument();
    expect(screen.getByText('Hola mundo')).toBeInTheDocument();
  });

  it('advances to next step on "Siguiente" click', () => {
    act(() => useTourStore.getState().startTour('agent', CENTER_STEPS));
    render(<I18nextProvider i18n={i18n}><TourOverlay /></I18nextProvider>);
    fireEvent.click(screen.getByText('Siguiente'));
    expect(screen.getByText('Paso 2')).toBeInTheDocument();
  });

  it('ends tour on "Omitir" click', () => {
    act(() => useTourStore.getState().startTour('agent', CENTER_STEPS));
    render(<I18nextProvider i18n={i18n}><TourOverlay /></I18nextProvider>);
    fireEvent.click(screen.getByText('Omitir'));
    expect(useTourStore.getState().isActive).toBe(false);
  });

  it('shows "Finalizar" on last step', () => {
    act(() => useTourStore.getState().startTour('agent', CENTER_STEPS));
    act(() => useTourStore.getState().nextStep());
    render(<I18nextProvider i18n={i18n}><TourOverlay /></I18nextProvider>);
    expect(screen.getByText('Finalizar')).toBeInTheDocument();
  });

  it('does not render a highlight div when step has no target', () => {
    act(() => useTourStore.getState().startTour('agent', CENTER_STEPS));
    const { container } = render(<I18nextProvider i18n={i18n}><TourOverlay /></I18nextProvider>);
    expect(document.body.querySelector('[class*="highlight"]')).toBeNull();
  });
});

describe('TourOverlay — con target (highlight)', () => {
  beforeEach(() => {
    const el = document.createElement('div');
    el.setAttribute('data-tour', 'sidebar');
    el.style.width = '200px';
    el.style.height = '500px';
    document.body.appendChild(el);
    return () => el.remove();
  });

  it('renders a highlight div when target element exists', () => {
    act(() => useTourStore.getState().startTour('agent', TARGET_STEPS));
    render(<I18nextProvider i18n={i18n}><TourOverlay /></I18nextProvider>);
    const highlight = document.body.querySelector('[class*="highlight"]');
    expect(highlight).not.toBeNull();
  });

  it('renders transparent backdrop (not solid) when highlight is active', () => {
    act(() => useTourStore.getState().startTour('agent', TARGET_STEPS));
    render(<I18nextProvider i18n={i18n}><TourOverlay /></I18nextProvider>);
    expect(document.body.querySelector('[class*="backdrop--transparent"]')).not.toBeNull();
    expect(document.body.querySelector('[class*="backdrop"]:not([class*="transparent"])')).toBeNull();
  });
});