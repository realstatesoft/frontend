import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatPercentage,
} from "../../utils/formatters";
import { formatPrice, parsePriceInput } from "../../utils/priceFormat";

describe("formatCurrency", () => {
  it("formats a number as currency", () => {
    const result = formatCurrency(1500000);
    expect(result).toContain("1");
    expect(result).toContain("500");
  });

  it("returns $0 when the value is null", () => {
    expect(formatCurrency(null)).toBe("$0");
  });

  it("returns $0 when the value is undefined", () => {
    expect(formatCurrency(undefined)).toBe("$0");
  });

  it("formats 0 correctly", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });
});

describe("formatDate", () => {
  it("returns an empty string for falsy values", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });

  it("formats a valid ISO date", () => {
    const result = formatDate("2024-06-15T00:00:00Z");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});

describe("formatDateTime", () => {
  it("returns an empty string for falsy values", () => {
    expect(formatDateTime("")).toBe("");
  });

  it("formats a valid ISO datetime", () => {
    const result = formatDateTime("2024-06-15T10:30:00Z");
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(8);
  });
});

describe("formatTime", () => {
  it("returns an empty string for falsy values", () => {
    expect(formatTime("")).toBe("");
    expect(formatTime(null)).toBe("");
  });

  it("formats only the time portion of an ISO datetime", () => {
    const result = formatTime("2024-06-15T14:30:00Z");
    expect(result).toBeTruthy();
  });
});

describe("formatPercentage", () => {
  it('returns "0%" for nullish values', () => {
    expect(formatPercentage(null)).toBe("0%");
    expect(formatPercentage(undefined)).toBe("0%");
  });

  it('includes a "+" sign for positive values', () => {
    expect(formatPercentage(5.5)).toBe("+5.5%");
  });

  it('does not include a "+" sign for negative values', () => {
    expect(formatPercentage(-3.2)).toBe("-3.2%");
  });

  it("formats 0 correctly", () => {
    expect(formatPercentage(0)).toBe("+0.0%");
  });
});

describe("formatPrice", () => {
  it("returns an empty string for null or undefined", () => {
    expect(formatPrice(null)).toBe("");
    expect(formatPrice(undefined)).toBe("");
  });

  it("returns an empty string for an empty string", () => {
    expect(formatPrice("")).toBe("");
  });

  it("formats a number with dot thousands separators", () => {
    expect(formatPrice(350000000)).toBe("350.000.000");
  });

  it("formats a small number without separators", () => {
    expect(formatPrice(500)).toBe("500");
  });

  it("formats numeric strings correctly", () => {
    expect(formatPrice("1000000")).toBe("1.000.000");
  });

  it("preserves already formatted integer values", () => {
    expect(formatPrice("1.000.000")).toBe("1.000.000");
  });

  it("preserves decimals when the input represents a valid amount", () => {
    expect(formatPrice("1200.50")).toBe("1.200,50");
  });

  it('formats the value 0 as "0"', () => {
    expect(formatPrice(0)).toBe("0");
  });
});

describe("parsePriceInput", () => {
  it("returns an empty string for nullish or empty values", () => {
    expect(parsePriceInput(null)).toBe("");
    expect(parsePriceInput("")).toBe("");
    expect(parsePriceInput(undefined)).toBe("");
  });

  it("extracts integer digits from formatted values", () => {
    expect(parsePriceInput("350.000.000")).toBe("350000000");
  });

  it("keeps plain integer values unchanged", () => {
    expect(parsePriceInput("123456")).toBe("123456");
  });

  it("removes spaces and non-numeric symbols from integer inputs", () => {
    expect(parsePriceInput("$ 1,500,000")).toBe("1500000");
  });

  it("normalizes decimals using a dot as the internal separator", () => {
    expect(parsePriceInput("$ 1,200.50")).toBe("1200.50");
    expect(parsePriceInput("1.200,50")).toBe("1200.50");
  });
});
