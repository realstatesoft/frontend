import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import StepSelectAgent from '../../../../pages/sell/steps/StepSelectAgent';
import { getSuggestedAgents } from '../../../../services/agents/agentApi';
import { createLeadFromWizard } from '../../../../services/leads/leadApi';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock sweetalert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true })
  }
}));

// Mock APIs
vi.mock('../../../../services/agents/agentApi', () => ({
  getSuggestedAgents: vi.fn()
}));
vi.mock('../../../../services/leads/leadApi', () => ({
  createLeadFromWizard: vi.fn(),
  default: {
    createLeadFromWizard: vi.fn()
  }
}));

describe('StepSelectAgent', () => {
  const mockSet = vi.fn();
  const mockOnFinish = vi.fn();
  const mockPrevStep = vi.fn();
  
  const mockForm = {
    propertyType: 'HOUSE',
    category: 'SALE',
    selectedAgentId: null,
  };

  const mockAgents = [
    { id: 1, userName: 'Agent 1', avgRating: 4.5, totalReviews: 10 },
    { id: 2, userName: 'Agent 2', avgRating: 5.0, totalReviews: 5 }
  ];

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
    
    getSuggestedAgents.mockResolvedValue(mockAgents);
    createLeadFromWizard.mockResolvedValue({ success: true });
    
    // Fix scrollTo
    vi.stubGlobal('scrollTo', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderComponent = (formProps = {}) => {
    return render(
      <MemoryRouter>
        <StepSelectAgent 
          form={{ ...mockForm, ...formProps }} 
          set={mockSet} 
          prevStep={mockPrevStep} 
          onFinish={mockOnFinish} 
        />
      </MemoryRouter>
    );
  };

  it('loads suggested agents and displays them', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Agent 1')).toBeInTheDocument();
      expect(screen.getByText('Agent 2')).toBeInTheDocument();
    });
    
    expect(getSuggestedAgents).toHaveBeenCalledWith({
      propertyType: 'HOUSE',
      category: 'SALE',
      limit: 6,
    });
  });

  it('handles selecting an agent', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Agent 1')).toBeInTheDocument();
    });

    const contactBtns = screen.getAllByText('Contactar');
    fireEvent.click(contactBtns[0]);

    // Should call set with selected agent
    expect(mockSet).toHaveBeenCalledWith('selectedAgentId', 1);
  });

  it('submits form, clears sessionStorage caches, and triggers Swal on finish', async () => {
    renderComponent({ selectedAgentId: 1 });

    await waitFor(() => {
       expect(screen.getByText('Agent 1')).toBeInTheDocument();
    });

    const finishBtn = screen.getByText(/Finalizar/);
    fireEvent.click(finishBtn);

    await waitFor(() => {
      expect(createLeadFromWizard).toHaveBeenCalled();
    });

    // Check for sessionStorage clearance logic
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('sellWizardForm');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('wizardReturnStep');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('selectedAgentFromSearch');

    expect(Swal.fire).toHaveBeenCalled();
    expect(mockOnFinish).toHaveBeenCalled();
  });

  it('prioritizes agent from sessionStorage if available', async () => {
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'selectedAgentFromSearch') {
        return JSON.stringify({ id: 99, name: 'Saved Agent', avatarUrl: null });
      }
      return null;
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Saved Agent')).toBeInTheDocument();
    });

    expect(mockSet).toHaveBeenCalledWith('selectedAgentId', 99);
  });
});
