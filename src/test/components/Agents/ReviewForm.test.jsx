import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import agentReviewsService from "../../../services/agentReviewsService";
import ReviewForm from "../../../components/Agents/ReviewForm";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

vi.mock("../../../services/agentReviewsService", () => ({
  default: {
    createReview: vi.fn(),
    updateReview: vi.fn(),
    deleteReview: vi.fn(),
  },
}));

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

describe("ReviewForm", () => {
  const defaultProps = {
    show: true,
    onHide: vi.fn(),
    agentId: 1,
    agentName: "Test Agent",
    existingReview: null,
    agentProperties: [],
    onSaved: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza correctamente", () => {
    render(<ReviewForm {...defaultProps} />);

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("review.titlePlaceholder")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("review.commentPlaceholder")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "review.submitButton" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "review.cancelButton" })
    ).toBeInTheDocument();
  });

  it("seleccionar 4 estrellas marca la cuarta estrella como checked", () => {
    render(<ReviewForm {...defaultProps} />);

    const fourthStar = screen.getByRole("radio", { name: "4 starRating.starPlural" });
    fireEvent.click(fourthStar);

    expect(fourthStar).toHaveAttribute("aria-checked", "true");
  });

  it("submit sin rating muestra error de validacion", () => {
    render(<ReviewForm {...defaultProps} />);

    const submitBtn = screen.getByRole("button", { name: "review.submitButton" });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText("review.validation.ratingRequired")
    ).toBeInTheDocument();
    expect(agentReviewsService.createReview).not.toHaveBeenCalled();
  });

  it("submit con datos validos llama createReview con el payload correcto", () => {
    agentReviewsService.createReview.mockResolvedValue({
      id: 99,
      rating: 4,
      title: "Excelente servicio",
      comment: "Muy buen agente, recomendado ampliamente",
    });

    render(<ReviewForm {...defaultProps} />);

    fireEvent.click(screen.getByRole("radio", { name: "4 starRating.starPlural" }));

    fireEvent.change(screen.getByPlaceholderText("review.titlePlaceholder"), {
      target: { value: "Excelente servicio" },
    });

    fireEvent.change(screen.getByPlaceholderText("review.commentPlaceholder"), {
      target: { value: "Muy buen agente, recomendado ampliamente" },
    });

    fireEvent.click(screen.getByRole("button", { name: "review.submitButton" }));

    expect(agentReviewsService.createReview).toHaveBeenCalledTimes(1);
    expect(agentReviewsService.createReview).toHaveBeenCalledWith(1, {
      rating: 4,
      title: "Excelente servicio",
      comment: "Muy buen agente, recomendado ampliamente",
    });
  });

  it("modo edicion pre-rellena los campos existentes", () => {
    const existingReview = {
      id: 5,
      rating: 3,
      title: "Titulo existente que es largo",
      comment: "Comentario existente que es largo",
      propertyId: null,
    };

    render(
      <ReviewForm
        {...defaultProps}
        existingReview={existingReview}
      />
    );

    const thirdStar = screen.getByRole("radio", { name: "3 starRating.starPlural" });
    expect(thirdStar).toHaveAttribute("aria-checked", "true");

    expect(screen.getByDisplayValue("Titulo existente que es largo")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Comentario existente que es largo")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "review.updateButton" })
    ).toBeInTheDocument();
  });

  it("cerrar modal sin enviar no llama al service", () => {
    render(<ReviewForm {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "review.cancelButton" }));

    expect(defaultProps.onHide).toHaveBeenCalled();
    expect(agentReviewsService.createReview).not.toHaveBeenCalled();
    expect(agentReviewsService.updateReview).not.toHaveBeenCalled();
  });
});
