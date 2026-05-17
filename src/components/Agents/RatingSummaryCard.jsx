/* eslint-disable react/prop-types */
import React from "react";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import StarRating from "../common/StarRating";
import useAgentReviewSummary from "../../hooks/useAgentReviewSummary";
import "./RatingSummaryCard.scss";

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveDistribution(data) {
  if (!data) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  const raw =
    data.ratingDistribution ??
    data.distribution ??
    null;

  if (raw && typeof raw === "object") {
    return {
      5: raw["5"] ?? raw[5] ?? 0,
      4: raw["4"] ?? raw[4] ?? 0,
      3: raw["3"] ?? raw[3] ?? 0,
      2: raw["2"] ?? raw[2] ?? 0,
      1: raw["1"] ?? raw[1] ?? 0,
    };
  }

  return {
    5: data.fiveStars  ?? data.fiveStar  ?? 0,
    4: data.fourStars  ?? data.fourStar  ?? 0,
    3: data.threeStars ?? data.threeStar ?? 0,
    2: data.twoStars   ?? data.twoStar   ?? 0,
    1: data.oneStars   ?? data.oneStar   ?? 0,
  };
}

function getQualityLabel(avg, t) {
  if (avg >= 4.5) return t("ratingSummary.excellent");
  if (avg >= 4.0) return t("ratingSummary.veryGood");
  if (avg >= 3.0) return t("ratingSummary.good");
  if (avg >= 2.0) return t("ratingSummary.fair");
  return t("ratingSummary.poor");
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RatingSummaryCard({ agentId }) {
  const { t } = useTranslation("agents");
  const { data, isLoading, isError } = useAgentReviewSummary(agentId);

  // Loading state
  if (isLoading) {
    return (
      <div className="rating-summary-card">
        <p className="rating-summary-card__title">{t("ratingSummary.title")}</p>
        <div className="d-flex justify-content-center py-3">
          <Spinner animation="border" size="sm" />
        </div>
      </div>
    );
  }

  // Error or no data
  if (isError || !data) return null;

  // Normalize response — axios wraps body in .data, backend wraps payload in .data again
  // chain: axiosResponse.data.data = { avgRating, totalReviews, distribution }
  const summary = data?.data?.data ?? data?.data ?? data;

  const avgRating = summary?.avgRating ?? summary?.averageRating ?? 0;
  const totalReviews = summary?.totalReviews ?? summary?.total ?? 0;
  const dist = resolveDistribution(summary);

  // Empty state
  if (totalReviews === 0) {
    return (
      <div className="rating-summary-card">
        <p className="rating-summary-card__title">{t("ratingSummary.title")}</p>
        <div className="rating-summary-card__empty">
          <span className="rating-summary-card__empty-icon">★</span>
          <p className="rating-summary-card__empty-title">
            {t("ratingSummary.noRatings")}
          </p>
          <p className="rating-summary-card__empty-text">
            {t("ratingSummary.noRatingsText")}
          </p>
        </div>
      </div>
    );
  }

  // Stats
  const fiveStarPct = Math.round((dist[5] / totalReviews) * 100);
  const fourPlusPct = Math.round(((dist[5] + dist[4]) / totalReviews) * 100);
  const qualityLabel = getQualityLabel(avgRating, t);

  return (
    <div className="rating-summary-card">
      <p className="rating-summary-card__title">{t("ratingSummary.title")}</p>

      {/* ── Score + bars ── */}
      <div className="rating-summary-card__body">

        {/* Left: big average + stars + count */}
        <div className="rating-summary-card__left">
          <span className="rating-summary-card__average">
            {Number(avgRating).toFixed(1)}
          </span>
          <div className="rating-summary-card__stars">
            <StarRating value={avgRating} readonly size="sm" />
          </div>
          <span className="rating-summary-card__count">
            {t("ratingSummary.reviewsCount", { count: totalReviews })}
          </span>
        </div>

        {/* Right: distribution bars 5 → 1 */}
        <div className="rating-summary-card__bars">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = dist[star];
            const pct = totalReviews > 0
              ? Math.round((count / totalReviews) * 100)
              : 0;
            return (
              <div key={star} className="rating-summary-card__bar-row">
                <span className="rating-summary-card__bar-label">
                  {star} <span>★</span>
                </span>
                <div className="rating-summary-card__bar-track">
                  <div
                    className="rating-summary-card__bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="rating-summary-card__bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer stats ── */}
      <hr className="rating-summary-card__divider" />
      <div className="rating-summary-card__footer">
        <div className="rating-summary-card__stat">
          <span className="rating-summary-card__stat-value rating-summary-card__stat-value--green">
            {fiveStarPct}%
          </span>
          <span className="rating-summary-card__stat-label">
            {t("ratingSummary.fiveStarsPercent")}
          </span>
        </div>

        <div className="rating-summary-card__stat-divider" />

        <div className="rating-summary-card__stat">
          <span className="rating-summary-card__stat-value rating-summary-card__stat-value--blue">
            {fourPlusPct}%
          </span>
          <span className="rating-summary-card__stat-label">
            {t("ratingSummary.fourPlusPercent")}
          </span>
        </div>

        <div className="rating-summary-card__stat-divider" />

        <div className="rating-summary-card__stat">
          <span className="rating-summary-card__stat-value rating-summary-card__stat-value--dark">
            {qualityLabel}
          </span>
          <span className="rating-summary-card__stat-label">
            {t("ratingSummary.ratingLabel")}
          </span>
        </div>
      </div>
    </div>
  );
}
