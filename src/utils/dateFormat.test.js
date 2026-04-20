import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatTimeAgo, formatDateTime, toDateTimeLocalInput } from "./dateFormat";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2023-10-25T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("dateFormat utils", () => {
  describe("formatTimeAgo", () => {
    it("returns empty string if no date is provided", () => {
      expect(formatTimeAgo(null)).toBe("");
    });

    it('returns "hace un momento" for very recent dates', () => {
      const now = new Date().toISOString();
      expect(formatTimeAgo(now)).toBe("hace un momento");
    });

    it('returns "hace X minutos"', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString();
      expect(formatTimeAgo(fiveMinutesAgo)).toBe("hace 5 minutos");
    });

    it('returns "hace X horas"', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
      expect(formatTimeAgo(twoHoursAgo)).toBe("hace 2 horas");
    });

    it('returns "hace X días"', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
      expect(formatTimeAgo(threeDaysAgo)).toBe("hace 3 días");
    });

    it("returns a locale date string for old dates", () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 86400000);
      const result = formatTimeAgo(tenDaysAgo.toISOString());
      expect(result).toBe(tenDaysAgo.toLocaleDateString());
    });
  });

  describe("formatDateTime", () => {
    it("returns empty string for null input", () => {
      expect(formatDateTime(null)).toBe("");
    });

    it("returns empty string for invalid dates", () => {
      expect(formatDateTime("invalid-date")).toBe("");
    });

    it("formats date correctly for es-PY by default", () => {
      const formatted = formatDateTime("2023-10-25T15:30:00Z");
      expect(formatted).toContain("2023");
      expect(formatted).toMatch(/\d{1,2}[:.\s]\d{2}/);
    });
  });

  describe("toDateTimeLocalInput", () => {
    it("returns empty string for null input", () => {
      expect(toDateTimeLocalInput(null)).toBe("");
    });

    it("returns empty string for invalid dates", () => {
      expect(toDateTimeLocalInput("invalid-date")).toBe("");
    });

    it("converts ISO to YYYY-MM-DDTHH:mm format", () => {
      expect(toDateTimeLocalInput("2023-05-10T09:45:00")).toBe("2023-05-10T09:45");
    });

    it("pads single digits with zero", () => {
      expect(toDateTimeLocalInput("2023-01-02T03:04:00")).toBe("2023-01-02T03:04");
    });
  });
});
