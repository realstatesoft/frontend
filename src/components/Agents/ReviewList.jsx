/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button, Dropdown, Spinner } from "react-bootstrap";
import {
  HandThumbsUp,
  ThreeDotsVertical,
  PencilSquare,
  Trash,
} from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import StarRating from "../common/StarRating";
import ReviewForm from "./ReviewForm";
import agentReviewsService from "../../services/agentReviewsService";
import useAgentReviews from "../../hooks/useAgentReviews";

// ── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#4f6af5", "#e55a4e", "#4caf50", "#ff9800",
  "#9c27b0", "#00bcd4", "#795548", "#607d8b",
];

function getAvatarColor(name = "") {
  return AVATAR_COLORS[(name.charCodeAt(0) || 65) % AVATAR_COLORS.length];
}

function formatDate(dateStr, t, lang) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return t("reviewList.relativeToday");
  if (diffDays === 1) return t("reviewList.relativeYesterday");
  if (diffDays < 7) return t("reviewList.relativeDaysAgo", { count: diffDays });
  const locale = lang === "en" ? "en-US" : lang === "pr" ? "pt-BR" : "es-PY";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

// ── ReviewItem ────────────────────────────────────────────────────────────────

function ReviewItem({ review, onEdit, onDelete, t, lang }) {
  const {
    reviewerName = "",
    rating = 0,
    title = "",
    comment = "",
    createdAt,
    isOwn = false,
    isVerified = false,
    helpfulCount,
    propertyType,
    propertyAddress,
    propertyTitle,
  } = review;

  const initial = reviewerName.charAt(0).toUpperCase() || "?";
  const avatarBg = getAvatarColor(reviewerName);
  const dateLabel = formatDate(createdAt, t, lang);
  const hasProperty = propertyType || propertyAddress || propertyTitle;

  return (
    <div
      className="bg-white rounded-3 p-4 mb-3"
      style={{ border: "1px solid #e8ecf0" }}
    >
      {/* ── Header: avatar + name + 3-dot menu ── */}
      <div className="d-flex align-items-start justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          {/* Avatar */}
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            aria-hidden="true"
            style={{
              width: 42,
              height: 42,
              backgroundColor: avatarBg,
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            {initial}
          </div>

          {/* Name + verified badge */}
          <div>
            <span className="fw-semibold me-2" style={{ fontSize: "0.95rem" }}>
              {reviewerName}
            </span>
            {isVerified && (
              <span
                className="badge rounded-pill"
                style={{
                  backgroundColor: "#e8f0fe",
                  color: "#1a4b9b",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                }}
              >
                ✓ {t("reviewList.verified")}
              </span>
            )}
          </div>
        </div>

        {/* 3-dot menu — only for own review */}
        {isOwn && (
          <Dropdown align="end">
            <Dropdown.Toggle
              as="button"
              className="btn btn-sm btn-link text-muted p-0 border-0"
              style={{ boxShadow: "none", lineHeight: 1 }}
              aria-label="Opciones de reseña"
            >
              <ThreeDotsVertical size={18} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => onEdit(review)}>
                <PencilSquare className="me-2" size={14} />
                {t("reviewList.editButton")}
              </Dropdown.Item>
              <Dropdown.Item className="text-danger" onClick={() => onDelete(review)}>
                <Trash className="me-2" size={14} />
                {t("reviewList.deleteButton")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>

      {/* ── Stars + date ── */}
      <div className="d-flex align-items-center gap-2 mb-2">
        <StarRating value={rating} size="sm" readonly />
        {dateLabel && (
          <span className="text-muted" style={{ fontSize: "0.82rem" }}>
            {dateLabel}
          </span>
        )}
      </div>

      {/* ── Title ── */}
      {title && (
        <p className="fw-semibold mb-1" style={{ fontSize: "0.95rem" }}>
          {title}
        </p>
      )}

      {/* ── Comment ── */}
      <p
        className="text-muted mb-2"
        style={{ fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-line" }}
      >
        {comment}
      </p>

      {/* ── Property badge ── */}
      {hasProperty && (
        <div
          className="d-flex align-items-center flex-wrap gap-2 mb-2"
          style={{ fontSize: "0.82rem" }}
        >
          {propertyType && (
            <span
              className="badge rounded-pill"
              style={{
                backgroundColor: "#f0f4ff",
                color: "#4f6af5",
                fontSize: "0.78rem",
                fontWeight: 500,
              }}
            >
              {propertyType}
            </span>
          )}
          {(propertyAddress || propertyTitle) && (
            <span className="text-muted">
              • {propertyAddress || propertyTitle}
            </span>
          )}
        </div>
      )}

      {/* ── Helpful count (display only) ── */}
      {helpfulCount != null && (
        <div className="mt-2">
          <span
            className="d-inline-flex align-items-center gap-1 text-muted"
            style={{
              fontSize: "0.82rem",
              padding: "3px 10px",
              border: "1px solid #e0e0e0",
              borderRadius: 20,
            }}
          >
            <HandThumbsUp size={13} />
            {t("reviewList.helpful")} ({helpfulCount})
          </span>
        </div>
      )}
    </div>
  );
}

// ── Sort options ──────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "createdAt,desc", labelKey: "reviewList.sortNewest" },
  { value: "createdAt,asc",  labelKey: "reviewList.sortOldest" },
  { value: "rating,desc",    labelKey: "reviewList.sortHighest" },
  { value: "rating,asc",     labelKey: "reviewList.sortLowest" },
];

// ── ReviewList ────────────────────────────────────────────────────────────────

/**
 * ReviewList
 *
 * Lista paginada de reseñas de un agente con soporte para editar y eliminar
 * la reseña propia.
 *
 * Props:
 *   agentId             {number|string}  — ID del agente
 *   onSavedOwnReview    {function}       — (savedReview) => void  — callback tras editar reseña propia
 *   onDeletedOwnReview  {function}       — () => void             — callback tras eliminar reseña propia
 */
export default function ReviewList({ agentId, onSavedOwnReview, onDeletedOwnReview }) {
  const { t, i18n } = useTranslation("agents");
  const queryClient = useQueryClient();

  const [sort, setSort] = useState("createdAt,desc");
  const [editingReview, setEditingReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useAgentReviews(agentId, { sort });

  // Flatten pages into a single array
  const allReviews = data?.pages.flatMap((page) => page?.content ?? []) ?? [];

  const firstPageData = data?.pages[0];
  const totalCount = firstPageData?.totalElements ?? allReviews.length;

  const activeSortLabel = t(
    SORT_OPTIONS.find((o) => o.value === sort)?.labelKey ?? "reviewList.sortNewest"
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowEditModal(true);
  };

  const handleDelete = async (review) => {
    const result = await Swal.fire({
      title: t("reviewList.deleteConfirmTitle"),
      text: t("reviewList.deleteConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: t("reviewList.deleteConfirmYes"),
      cancelButtonText: t("reviewList.deleteConfirmNo"),
    });

    if (!result.isConfirmed) return;

    try {
      await agentReviewsService.deleteReview(agentId, review.id);
      queryClient.invalidateQueries({ queryKey: ["agent-reviews", agentId] });
      queryClient.invalidateQueries({ queryKey: ["agent-review-summary", agentId] });
      queryClient.invalidateQueries({ queryKey: ["agents", agentId] });
      queryClient.invalidateQueries({ queryKey: ["my-agent-review", agentId] });
      if (review.isOwn) onDeletedOwnReview?.();
      Swal.fire({
        icon: "success",
        title: t("reviewList.deleteSuccess"),
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: t("reviewList.deleteError"),
      });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="mt-4">
      {/* Section header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="fw-bold mb-0">
          {t("reviewList.reviewsCount", { count: totalCount })}
        </h4>

        {/* Sort dropdown — only visible when there are reviews */}
        {allReviews.length > 1 && (
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="outline-secondary"
              size="sm"
              style={{ borderRadius: 20, fontSize: "0.85rem" }}
            >
              {t("reviewList.sortLabel")}: {activeSortLabel}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {SORT_OPTIONS.map((opt) => (
                <Dropdown.Item
                  key={opt.value}
                  active={sort === opt.value}
                  onClick={() => setSort(opt.value)}
                >
                  {t(opt.labelKey)}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="text-muted mt-2 mb-0" style={{ fontSize: "0.9rem" }}>
            {t("reviewList.loading")}
          </p>
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="text-center py-4">
          <p className="text-muted">{t("reviewList.loadError")}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && allReviews.length === 0 && (
        <div className="text-center py-5">
          <div
            aria-hidden="true"
            style={{ fontSize: 60, lineHeight: 1, color: "#dde2ec" }}
          >
            ★
          </div>
          <h5 className="mt-3 fw-semibold" style={{ color: "#6c757d" }}>
            {t("reviewList.emptyTitle")}
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
            {t("reviewList.emptyText")}
          </p>
        </div>
      )}

      {/* Review cards */}
      {allReviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          onEdit={handleEdit}
          onDelete={handleDelete}
          t={t}
          lang={i18n.language}
        />
      ))}

      {/* Load more button */}
      {hasNextPage && (
        <div className="text-center mt-2 pb-2">
          <Button
            variant="outline-primary"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            style={{ borderRadius: 20, paddingInline: 28, fontSize: "0.9rem" }}
          >
            {isFetchingNextPage ? (
              <Spinner animation="border" size="sm" />
            ) : (
              t("reviewList.loadMore")
            )}
          </Button>
        </div>
      )}

      {/* Edit modal — opened from ReviewItem 3-dot menu */}
      {editingReview && (
        <ReviewForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setEditingReview(null);
          }}
          agentId={agentId}
          agentName=""
          existingReview={editingReview}
          agentProperties={[]}
          onSaved={(savedReview) => {
            setShowEditModal(false);
            setEditingReview(null);
            if (editingReview.isOwn) onSavedOwnReview?.(savedReview);
          }}
        />
      )}
    </div>
  );
}
