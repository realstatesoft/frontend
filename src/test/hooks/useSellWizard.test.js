import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useSellWizard } from '../../../hooks/useSellWizard';

describe('useSellWizard Hook', () => {
  // Mock sessionStorage
  const mockSessionStorage = (() => {
    let store = {};
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    vi.stubGlobal('sessionStorage', mockSessionStorage);
    mockSessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize with default values when no sessionStorage is present', () => {
    const { result } = renderHook(() => useSellWizard());

    expect(result.current.currentStep).toBe(1);
    expect(result.current.progress).toBe(8); // 1/12 * 100 = 8
    expect(result.current.form.propertyType).toBe('HOUSE');
    expect(result.current.form.firstName).toBe('');
  });

  it('should restore from sessionStorage if available', () => {
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'wizardReturnStep') return '5';
      if (key === 'sellWizardForm') {
        return JSON.stringify({ firstName: 'Juan', propertyType: 'APARTMENT' });
      }
      return null;
    });

    const { result } = renderHook(() => useSellWizard());

    expect(result.current.currentStep).toBe(5);
    expect(result.current.form.propertyType).toBe('APARTMENT');
    expect(result.current.form.firstName).toBe('Juan');
  });

  it('should update form state and persist to sessionStorage on modify', () => {
    const { result } = renderHook(() => useSellWizard());

    act(() => {
      result.current.set('firstName', 'Ana');
    });

    expect(result.current.form.firstName).toBe('Ana');
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('sellWizardForm', expect.stringContaining('"firstName":"Ana"'));
  });

  it('should navigate next and previous steps correctly', () => {
    const { result } = renderHook(() => useSellWizard());
    
    // Mock window.scrollTo
    vi.stubGlobal('scrollTo', vi.fn());

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(2);

    act(() => {
      result.current.prevStep();
    });

    expect(result.current.currentStep).toBe(1);

    // Prevent going below 1
    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('should clean up sessionStorage when reset is called', () => {
    const { result } = renderHook(() => useSellWizard());

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentStep).toBe(1);
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('sellWizardForm');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('wizardReturnStep');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('selectedAgentFromSearch');
  });
});
