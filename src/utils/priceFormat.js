const THOUSANDS_SEP = ".";
const DECIMAL_SEP = ",";

function getNormalizedPriceParts(input) {
  if (input == null || input === "") return null;

  const sanitized = String(input).trim().replace(/[^\d.,]/g, "");
  if (!sanitized) return null;

  const lastDot = sanitized.lastIndexOf(".");
  const lastComma = sanitized.lastIndexOf(",");
  const hasDot = lastDot !== -1;
  const hasComma = lastComma !== -1;

  let decimalIndex = -1;

  if (hasDot && hasComma) {
    decimalIndex = Math.max(lastDot, lastComma);
  } else if (hasDot || hasComma) {
    const separator = hasDot ? "." : ",";
    const separatorIndex = hasDot ? lastDot : lastComma;
    const occurrences = sanitized.split(separator).length - 1;
    const fractionalDigits = sanitized.slice(separatorIndex + 1).replace(/\D/g, "");

    if (occurrences === 1 && fractionalDigits.length > 0 && fractionalDigits.length <= 2) {
      decimalIndex = separatorIndex;
    }
  }

  const integerPartRaw =
    decimalIndex >= 0 ? sanitized.slice(0, decimalIndex) : sanitized;
  const decimalPartRaw =
    decimalIndex >= 0 ? sanitized.slice(decimalIndex + 1) : "";

  const integerDigits = integerPartRaw.replace(/\D/g, "");
  const decimalDigits = decimalPartRaw.replace(/\D/g, "").slice(0, 2);

  if (!integerDigits && !decimalDigits) return null;

  return {
    integer: integerDigits.replace(/^0+/, "") || "0",
    decimal: decimalDigits,
  };
}

function formatThousands(integerDigits) {
  const parts = [];

  for (let i = integerDigits.length; i > 0; i -= 3) {
    parts.unshift(integerDigits.slice(Math.max(0, i - 3), i));
  }

  return parts.join(THOUSANDS_SEP);
}

export function formatPrice(value) {
  const parts = getNormalizedPriceParts(value);
  if (!parts) return "";

  const integerFormatted = formatThousands(parts.integer);
  return parts.decimal
    ? `${integerFormatted}${DECIMAL_SEP}${parts.decimal}`
    : integerFormatted;
}

export function parsePriceInput(input) {
  const parts = getNormalizedPriceParts(input);
  if (!parts) return "";

  return parts.decimal ? `${parts.integer}.${parts.decimal}` : parts.integer;
}
