import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import StarRating from "../../../components/common/StarRating";

// Mock react-i18next so tests don't need the full i18n setup
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      const map = {
        "starRating.label": `${opts?.value} de 5 estrellas`,
        "starRating.labelWithCount": `${opts?.value} de 5 estrellas, ${opts?.count} reseñas`,
        "starRating.noRating": "Sin calificación",
        "starRating.starSingular": "estrella",
        "starRating.starPlural": "estrellas",
        "starRating.groupLabel": "Calificación",
      };
      return map[key] ?? key;
    },
  }),
}));

/** Returns all SVG elements inside the container (one per star). */
const getStars = (container) => container.querySelectorAll("svg");

/** A star is "filled" when its fill attribute is not "none". */
const isFilled = (svg) => svg.getAttribute("fill") !== "none";

// ---------------------------------------------------------------------------
// Display mode (readonly=true)
// ---------------------------------------------------------------------------

describe("StarRating — modo display (readonly)", () => {
  it("renderiza 5 estrellas siempre", () => {
    const { container } = render(<StarRating value={3} />);
    expect(getStars(container)).toHaveLength(5);
  });

  it("rellena las primeras N estrellas según value redondeado", () => {
    const { container } = render(<StarRating value={3} />);
    const stars = getStars(container);
    expect(isFilled(stars[0])).toBe(true);
    expect(isFilled(stars[1])).toBe(true);
    expect(isFilled(stars[2])).toBe(true);
    expect(isFilled(stars[3])).toBe(false);
    expect(isFilled(stars[4])).toBe(false);
  });

  it("redondea value decimal (3.6 → 4 estrellas rellenas)", () => {
    const { container } = render(<StarRating value={3.6} />);
    const stars = getStars(container);
    const filled = Array.from(stars).filter(isFilled);
    expect(filled).toHaveLength(4);
  });

  it("cuando value es null no rellena ninguna estrella", () => {
    const { container } = render(<StarRating value={null} />);
    const stars = getStars(container);
    Array.from(stars).forEach((s) => expect(isFilled(s)).toBe(false));
  });

  it("cuando value es NaN no rellena ninguna estrella", () => {
    const { container } = render(<StarRating value={NaN} />);
    const stars = getStars(container);
    Array.from(stars).forEach((s) => expect(isFilled(s)).toBe(false));
  });

  it("cuando value es 0 (fuera de rango) no rellena ninguna estrella", () => {
    const { container } = render(<StarRating value={0} />);
    const stars = getStars(container);
    Array.from(stars).forEach((s) => expect(isFilled(s)).toBe(false));
  });

  it("cuando value es 6 (fuera de rango) no rellena ninguna estrella", () => {
    const { container } = render(<StarRating value={6} />);
    const stars = getStars(container);
    Array.from(stars).forEach((s) => expect(isFilled(s)).toBe(false));
  });

  it("tiene aria-label descriptivo con la calificación", () => {
    render(<StarRating value={4} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "4 de 5 estrellas"
    );
  });

  it("aria-label indica Sin calificación cuando value es null", () => {
    render(<StarRating value={null} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "Sin calificación"
    );
  });

  it("muestra el conteo cuando showCount=true", () => {
    render(<StarRating value={4} showCount count={42} />);
    expect(screen.getByText("(42)")).toBeInTheDocument();
  });

  it("no muestra conteo cuando showCount=false (default)", () => {
    render(<StarRating value={4} count={42} />);
    expect(screen.queryByText("(42)")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Input mode (readonly=false)
// ---------------------------------------------------------------------------

describe("StarRating — modo input (readonly=false)", () => {
  it("renderiza 5 botones con role=radio dentro de un radiogroup", () => {
    render(<StarRating readonly={false} value={null} onChange={vi.fn()} />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("cada botón tiene aria-label con el número de estrellas", () => {
    render(<StarRating readonly={false} value={null} onChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: "1 estrella" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "2 estrellas" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "5 estrellas" })).toBeInTheDocument();
  });

  it("llama onChange con el valor correcto al hacer click", () => {
    const onChange = vi.fn();
    render(<StarRating readonly={false} value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "3 estrellas" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("aria-checked es true solo en la estrella con el valor actual", () => {
    render(<StarRating readonly={false} value={2} onChange={vi.fn()} />);
    const radios = screen.getAllByRole("radio");
    expect(radios[1]).toHaveAttribute("aria-checked", "true");   // índice 1 → valor 2
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
    expect(radios[2]).toHaveAttribute("aria-checked", "false");
  });

  it("aplica hover highlight al pasar el mouse sobre una estrella", () => {
    const { container } = render(
      <StarRating readonly={false} value={null} onChange={vi.fn()} />
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.mouseEnter(radios[2]); // hover sobre la 3ª estrella
    const stars = getStars(container);
    // estrellas 0,1,2 deben estar iluminadas (hovered)
    expect(isFilled(stars[0])).toBe(true);
    expect(isFilled(stars[1])).toBe(true);
    expect(isFilled(stars[2])).toBe(true);
    expect(isFilled(stars[3])).toBe(false);
  });

  it("quita el hover al salir del contenedor", () => {
    const { container } = render(
      <StarRating readonly={false} value={null} onChange={vi.fn()} />
    );
    const radiogroup = screen.getByRole("radiogroup");
    fireEvent.mouseEnter(screen.getAllByRole("radio")[4]);
    fireEvent.mouseLeave(radiogroup);
    const stars = getStars(container);
    Array.from(stars).forEach((s) => expect(isFilled(s)).toBe(false));
  });
});

// ---------------------------------------------------------------------------
// Readonly mode — non-interactive
// ---------------------------------------------------------------------------

describe("StarRating — modo readonly no interactivo", () => {
  it("no renderiza botones ni responde a clicks", () => {
    const onChange = vi.fn();
    const { container } = render(
      <StarRating value={3} readonly onChange={onChange} />
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(0);

    const stars = getStars(container);
    expect(stars).toHaveLength(5);
    fireEvent.click(stars[0]);
    fireEvent.click(stars[2]);
    fireEvent.click(stars[4]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("tiene role=img en lugar de radiogroup en modo readonly", () => {
    render(<StarRating value={3} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });
});
