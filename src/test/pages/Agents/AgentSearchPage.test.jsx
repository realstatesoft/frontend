import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import AgentSearchPage from '../../../pages/Agents/AgentSearchPage';
import agentApi from '../../../services/agents/agentApi';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock agentApi
vi.mock('../../../services/agents/agentApi', () => ({
  default: {
    searchAgents: vi.fn(),
    getAllSpecialties: vi.fn(),
  },
}));

// Mock Navbar and Footer to simplify rendering
vi.mock('../../../components/Landing/Navbar', () => ({
  default: () => <div data-testid="navbar-mock" />,
}));
vi.mock('../../../components/Landing/Footer', () => ({
  default: () => <div data-testid="footer-mock" />,
}));

describe('AgentSearchPage', () => {
  const mockSpecialties = [
    { id: 1, name: 'Rural' },
    { id: 2, name: 'Urban' }
  ];

  const mockAgents = {
    content: [
      { id: 1, userName: 'John Doe', avgRating: 4.5, totalReviews: 10 },
      { id: 2, userName: 'Jane Smith', avgRating: 5.0, totalReviews: 5 }
    ],
    page: {
      totalPages: 1,
      totalElements: 2,
      number: 0
    }
  };

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

    agentApi.getAllSpecialties.mockResolvedValue(mockSpecialties);
    agentApi.searchAgents.mockResolvedValue(mockAgents);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AgentSearchPage />
      </MemoryRouter>
    );
  };

  it('renders correctly and loads agents and specialties on mount', async () => {
    renderComponent();

    // Verify API calls
    expect(agentApi.getAllSpecialties).toHaveBeenCalledTimes(1);
    expect(agentApi.searchAgents).toHaveBeenCalledWith(undefined, { page: 0, size: 10 });

    // Verify agents render
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('behaves in normal mode: shows Contactar buttons', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Contactar')).toHaveLength(2);
    });

    const contactBtns = screen.getAllByText('Contactar');
    fireEvent.click(contactBtns[0]);

    // Should navigate to agent profile
    expect(mockNavigate).toHaveBeenCalledWith('/agents/1');
  });

  it('behaves in wizard mode: shows Seleccionar buttons when wizardSearchMode is in sessionStorage', async () => {
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'wizardSearchMode') return '1'; // Simulate coming from wizard
      return null;
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Seleccionar')).toHaveLength(2);
    });

    const selectBtns = screen.getAllByText('Seleccionar');
    fireEvent.click(selectBtns[1]);

    // Should save to sessionStorage and navigate back to wizard
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'selectedAgentFromSearch', 
      expect.stringContaining('"id":2')
    );
    expect(mockNavigate).toHaveBeenCalledWith('/sell');
  });

  it('triggers search with correct parameters when filtering', async () => {
    renderComponent();

    await waitFor(() => {
       expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Clear previous calls (mount calls)
    agentApi.searchAgents.mockClear();

    // Fill search input
    const searchInput = screen.getByPlaceholderText(/Nombre, empresa, licencia/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    // Assuming there is a select for specialties and minRating.
    // For simplicity, we just trigger the "Buscar" button
    const searchBtn = screen.getByTitle('Buscar');
    fireEvent.click(searchBtn);

    expect(agentApi.searchAgents).toHaveBeenCalledWith('Jane', {
      page: 0,
      size: 10
    });
  });
});
