/* eslint-disable react/prop-types */
import { useState } from "react";
import { useTranslation } from "react-i18next";

const SIZE_MAP = {
  sm: 14,
  md: 20,
  lg: 28,
};

/**
 * Clamps value to [1-5]. Returns null for null/undefined, NaN, or out-of-range.
 */
function clampValue(val) {
  if (val == null) return null;
  const n = Number(val);
  if (isNaN(n) || n < 1 || n > 5) return null;
  return n;
}

function StarIcon({ filled, hovered, size }) {
  const px = SIZE_MAP[size] ?? SIZE_MAP.md;
  const color = filled || hovered ? "#f0ad4e" : "none";
  const stroke = filled || hovered ? "#f0ad4e" : "#adb5bd";

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill={color}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/**
 * StarRating — componente reutilizable de estrellas.
 *
 * Modo display  (readonly=true, default):
 *   Props: value (1-5 | null), size ('sm'|'md'|'lg'), showCount (bool), count (number)
 *
 * Modo input (readonly=false):
 *   Props: value (1-5 | null), onChange(newValue: number), size ('sm'|'md'|'lg')
 */
export default function StarRating({
  value = null,
  size = "md",
  readonly = true,
  // display-only props
  showCount = false,
  count = 0,
  // input-only props
  onChange,
}) {
  const { t } = useTranslation("common");
  const [hoverIndex, setHoverIndex] = useState(null);

  const numericValue = clampValue(value);

  if (readonly) {
    const ariaLabel = numericValue != null
      ? showCount
        ? t("starRating.labelWithCount", { value: numericValue, count })
        : t("starRating.label", { value: numericValue })
      : t("starRating.noRating");

    return (
      <div
        role="img"
        aria-label={ariaLabel}
        style={{ display: "inline-flex", alignItems: "center", gap: 2 }}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon
            key={i}
            size={size}
            filled={numericValue != null && i < Math.round(numericValue)}
            hovered={false}
          />
        ))}
        {showCount && count != null && (
          <span
            style={{
              marginLeft: 4,
              fontSize: SIZE_MAP[size] ?? SIZE_MAP.md,
              color: "#555",
              lineHeight: 1,
            }}
          >
            ({count})
          </span>
        )}
      </div>
    );
  }

  // Input mode
  const activeIndex = hoverIndex ?? (numericValue != null ? numericValue - 1 : -1);

  return (
    <div
      role="radiogroup"
      aria-label={t("starRating.groupLabel")}
      style={{ display: "inline-flex", alignItems: "center", gap: 2 }}
      onMouseLeave={() => setHoverIndex(null)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        const starLabel = starValue === 1
          ? `${starValue} ${t("starRating.starSingular")}`
          : `${starValue} ${t("starRating.starPlural")}`;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={numericValue === starValue}
            aria-label={starLabel}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => setHoverIndex(i)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              lineHeight: 0,
            }}
          >
            <StarIcon
              size={size}
              filled={i <= activeIndex && hoverIndex === null}
              hovered={i <= activeIndex && hoverIndex !== null}
            />
          </button>
        );
      })}
    </div>
  );
}
