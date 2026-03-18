export default function StarRating({ value, max = 5 }) {
  const filled = Math.max(0, Math.min(max, Math.round(value)));
  return (
    <span className="d-inline-flex align-items-center gap-1">
      {Array.from({ length: max }).map((_, idx) => {
        const starNum = idx + 1;
        const isFilled = starNum <= filled;
        return (
          <span
            key={starNum}
            aria-hidden="true"
            style={{ color: isFilled ? "#FFC107" : "#D0D5DD" }}
          >
            ★
          </span>
        );
      })}
    </span>
  );
}

