import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

/**
 * Pagination
 * Props:
 *   currentPage  — página actual (1-indexed)
 *   totalPages   — total de páginas
 *   onPageChange — callback(page)
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const getRange = () => {
        const delta = 2;
        const range = [];
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);

        if (left > 1) {
            range.push(1);
            if (left > 2) range.push("...");
        }
        for (let i = left; i <= right; i++) range.push(i);
        if (right < totalPages) {
            if (right < totalPages - 1) range.push("...");
            range.push(totalPages);
        }
        return range;
    };

    const btnBase = {
        minWidth: "38px",
        height: "38px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        border: "1.5px solid #e2e8f0",
        background: "#fff",
        color: "#334155",
        fontSize: "0.875rem",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.18s ease",
        padding: "0 10px",
    };

    const btnActive = {
        ...btnBase,
        background: "#2563eb",
        borderColor: "#2563eb",
        color: "#fff",
    };

    const btnDisabled = {
        ...btnBase,
        opacity: 0.35,
        cursor: "not-allowed",
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "2rem 0 3rem",
            }}
        >
            {/* Anterior */}
            <button
                style={currentPage === 1 ? btnDisabled : btnBase}
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                title="Página anterior"
            >
                <ChevronLeft size={16} />
            </button>

            {/* Páginas */}
            {getRange().map((item, idx) =>
                item === "..." ? (
                    <span
                        key={`ellipsis-${idx}`}
                        style={{ ...btnBase, border: "none", background: "transparent", cursor: "default" }}
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        style={item === currentPage ? btnActive : btnBase}
                        onClick={() => onPageChange(item)}
                        onMouseEnter={(e) => {
                            if (item !== currentPage)
                                Object.assign(e.currentTarget.style, {
                                    background: "#f1f5f9",
                                    borderColor: "#94a3b8",
                                });
                        }}
                        onMouseLeave={(e) => {
                            if (item !== currentPage)
                                Object.assign(e.currentTarget.style, {
                                    background: "#fff",
                                    borderColor: "#e2e8f0",
                                });
                        }}
                    >
                        {item}
                    </button>
                )
            )}

            {/* Siguiente */}
            <button
                style={currentPage === totalPages ? btnDisabled : btnBase}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                title="Página siguiente"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
