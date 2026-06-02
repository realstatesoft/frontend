import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import useAgentReviews from "../../../hooks/useAgentReviews";
import ReviewList from "../../../components/Agents/ReviewList";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "es" },
  }),
}));

vi.mock("../../../hooks/useAgentReviews", () => ({
  default: vi.fn(),
  useAgentReviews: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) },
}));

const makeReview = (overrides = {}) => ({
  id: 1,
  reviewerName: "John Doe",
  rating: 4,
  title: "Great agent",
  comment: "Very professional and helpful.",
  createdAt: "2024-01-15T00:00:00Z",
  isOwn: false,
  isVerified: false,
  helpfulCount: 5,
  propertyType: null,
  propertyAddress: null,
  propertyTitle: null,
  ...overrides,
});

describe("ReviewList", () => {
  const fetchNextPage = vi.fn();

  const mockUseAgentReviews = (overrides = {}) => {
    const defaults = {
      data: { pages: [] },
      fetchNextPage,
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    };
    useAgentReviews.mockReturnValue({ ...defaults, ...overrides });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAgentReviews();
  });

  it("renderiza lista de reviews", () => {
    mockUseAgentReviews({
      data: {
        pages: [
          {
            content: [
              makeReview({ id: 1, reviewerName: "Alice", rating: 5, comment: "Increible agente" }),
              makeReview({ id: 2, reviewerName: "Bob", rating: 4, comment: "Muy recomendado" }),
            ],
            totalElements: 2,
          },
        ],
      },
    });

    render(<ReviewList agentId={1} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Increible agente")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Muy recomendado")).toBeInTheDocument();
    expect(screen.getByText("reviewList.reviewsCount")).toBeInTheDocument();
  });

  it("muestra estado vacio cuando no hay reviews", () => {
    mockUseAgentReviews({
      data: {
        pages: [
          {
            content: [],
            totalElements: 0,
          },
        ],
      },
    });

    render(<ReviewList agentId={1} />);

    expect(screen.getByText("reviewList.emptyTitle")).toBeInTheDocument();
    expect(screen.getByText("reviewList.emptyText")).toBeInTheDocument();
  });

  it("boton editar solo visible en review propia", () => {
    mockUseAgentReviews({
      data: {
        pages: [
          {
            content: [
              makeReview({ id: 1, reviewerName: "Alice", isOwn: true }),
              makeReview({ id: 2, reviewerName: "Bob", isOwn: false }),
            ],
            totalElements: 2,
          },
        ],
      },
    });

    render(<ReviewList agentId={1} />);

    const menuButtons = screen.getAllByLabelText("Opciones de reseña");
    expect(menuButtons).toHaveLength(1);
  });

  it("paginacion carga mas reviews al hacer click", () => {
    mockUseAgentReviews({
      data: {
        pages: [
          {
            content: [
              makeReview({ id: 1, reviewerName: "Alice" }),
            ],
            totalElements: 5,
          },
        ],
      },
      hasNextPage: true,
    });

    render(<ReviewList agentId={1} />);

    const loadMoreBtn = screen.getByRole("button", { name: "reviewList.loadMore" });
    expect(loadMoreBtn).toBeInTheDocument();

    fireEvent.click(loadMoreBtn);
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
