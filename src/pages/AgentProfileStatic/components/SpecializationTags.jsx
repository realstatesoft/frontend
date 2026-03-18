export default function SpecializationTags({ tags }) {
  return (
    <div className="d-flex flex-wrap gap-2">
      {tags.map((t) => (
        <span
          key={t}
          className="badge bg-light text-dark border rounded-pill px-3 py-2"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

