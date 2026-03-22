import { Heart, HeartFill } from "react-bootstrap-icons";

/**
 * FavoriteToggleButton
 * Botón reutilizable para agregar/quitar favoritos en cards de propiedades.
 */
export default function FavoriteToggleButton({
  isFavorite = false,
  loading = false,
  disabled = false,
  ariaLabel,
  onClick,
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      className="position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center rounded-circle border border-1 border-dark bg-white"
      style={{
        width: 36,
        height: 36,
        zIndex: 2,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
      aria-label={ariaLabel ?? (isFavorite ? "Quitar de favoritos" : "Agregar a favoritos")}
      disabled={isDisabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isDisabled || !onClick) return;
        onClick();
      }}
    >
      {isFavorite ? (
        <HeartFill size={18} style={{ color: "#dc3545", opacity: loading ? 0.7 : 1 }} />
      ) : (
        <Heart size={18} style={{ color: "#333", opacity: loading ? 0.7 : 1 }} />
      )}
    </button>
  );
}
