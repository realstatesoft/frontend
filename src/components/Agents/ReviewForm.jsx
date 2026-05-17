/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import StarRating from "../common/StarRating";
import agentReviewsService from "../../services/agents/agentReviewsService";
import { createReviewSchema } from "../../validation/reviewSchema";

/**
 * ReviewForm
 *
 * Modal para crear o editar una reseña de agente.
 *
 * Props:
 *   show        {boolean}         — controla visibilidad del modal
 *   onHide      {function}        — callback para cerrar
 *   agentId     {number|string}   — ID del agente
 *   agentName   {string}          — Nombre del agente (para el subtítulo)
 *   existingReview {object|null}  — Si existe, abre en modo edición con datos pre-rellenados
 *                                   { id, rating, title, comment, propertyId? }
 *   agentProperties {Array}       — Lista de propiedades del agente con las que el usuario interactuó
 *                                   [{ id, title }] — si vacío, no muestra el selector
 */
export default function ReviewForm({
  show,
  onHide,
  agentId,
  agentName = "",
  existingReview = null,
  agentProperties = [],
  onSaved,
}) {
  const { t } = useTranslation("agents");
  const queryClient = useQueryClient();

  const isEditMode = Boolean(existingReview);

  const [rating, setRating] = useState(null);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [propertyId, setPropertyId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Pre-rellenar campos en modo edición
  useEffect(() => {
    if (show) {
      if (existingReview) {
        setRating(existingReview.rating ?? null);
        setTitle(existingReview.title ?? "");
        setComment(existingReview.comment ?? "");
        setPropertyId(existingReview.propertyId ?? null);
      } else {
        setRating(null);
        setTitle("");
        setComment("");
        setPropertyId(null);
      }
      setFieldErrors({});
    }
  }, [show, existingReview]);

  const validate = () => {
    const schema = createReviewSchema((key) => t(key));
    const result = schema.safeParse({
      rating: rating ?? undefined,
      title: title.trim(),
      comment: comment.trim(),
      propertyId,
    });

    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const errors = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    });
    setFieldErrors(errors);
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      rating,
      title: title.trim(),
      comment: comment.trim(),
      ...(propertyId ? { propertyId } : {}),
    };

    setSubmitting(true);
    try {
      let savedReview;
      if (isEditMode) {
        const res = await agentReviewsService.updateReview(agentId, existingReview.id, payload);
        savedReview = res?.data?.data ?? res?.data ?? { ...existingReview, ...payload };
      } else {
        const res = await agentReviewsService.createReview(agentId, payload);
        savedReview = res?.data?.data ?? res?.data ?? payload;
      }

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["reviews", agentId] });
      queryClient.invalidateQueries({ queryKey: ["summary", agentId] });

      onHide();
      onSaved?.(savedReview);

      Swal.fire({
        icon: "success",
        title: t("review.successTitle"),
        text: t("review.successText"),
        timer: 2500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: t("review.errorTitle"),
        text: t("review.errorText"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const showPropertySelector = agentProperties.length > 0;

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <div>
          <Modal.Title className="fw-bold" style={{ fontSize: "1.2rem" }}>
            {isEditMode ? t("review.modalTitleEdit") : t("review.modalTitleCreate")}
          </Modal.Title>
          {agentName && (
            <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
              {t("review.modalSubtitle", { name: agentName })}
            </p>
          )}
        </div>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit} noValidate>
          {/* ── Rating ── */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              {t("review.ratingLabel")} <span className="text-danger">*</span>
            </Form.Label>
            <div>
              <StarRating
                value={rating}
                size="lg"
                readonly={false}
                onChange={(val) => {
                  setRating(val);
                  if (fieldErrors.rating) {
                    setFieldErrors((prev) => ({ ...prev, rating: undefined }));
                  }
                }}
              />
            </div>
            {fieldErrors.rating && (
              <div className="text-danger mt-1" style={{ fontSize: "0.82rem" }}>
                {fieldErrors.rating}
              </div>
            )}
          </Form.Group>

          {/* ── Title ── */}
          <Form.Group className="mb-1">
            <Form.Label className="fw-semibold">
              {t("review.titleLabel")} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={t("review.titlePlaceholder")}
              value={title}
              maxLength={100}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) {
                  setFieldErrors((prev) => ({ ...prev, title: undefined }));
                }
              }}
              isInvalid={Boolean(fieldErrors.title)}
            />
            <div className="d-flex justify-content-between">
              <Form.Text className="text-muted">{t("review.titleHint")}</Form.Text>
              <Form.Text className="text-muted">{title.length}/100</Form.Text>
            </div>
            {fieldErrors.title && (
              <Form.Control.Feedback type="invalid">
                {fieldErrors.title}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {/* ── Comment ── */}
          <Form.Group className="mb-1 mt-3">
            <Form.Label className="fw-semibold">
              {t("review.commentLabel")} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder={t("review.commentPlaceholder")}
              value={comment}
              maxLength={1000}
              onChange={(e) => {
                setComment(e.target.value);
                if (fieldErrors.comment) {
                  setFieldErrors((prev) => ({ ...prev, comment: undefined }));
                }
              }}
              isInvalid={Boolean(fieldErrors.comment)}
            />
            <div className="d-flex justify-content-between">
              <Form.Text className="text-muted">{t("review.commentHint")}</Form.Text>
              <Form.Text className="text-muted">{comment.length}/1000</Form.Text>
            </div>
            {fieldErrors.comment && (
              <Form.Control.Feedback type="invalid">
                {fieldErrors.comment}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {/* ── Property selector (optional) ── */}
          {showPropertySelector && (
            <Form.Group className="mb-3 mt-3">
              <Form.Label className="fw-semibold">
                {t("review.propertyLabel")}{" "}
                <span className="text-muted fw-normal">{t("review.propertyOptional")}</span>
              </Form.Label>
              <Form.Select
                value={propertyId ?? ""}
                onChange={(e) =>
                  setPropertyId(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">{t("review.propertyPlaceholder")}</option>
                {agentProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">{t("review.propertyHint")}</Form.Text>
            </Form.Group>
          )}

          {/* ── Guidelines ── */}
          <div
            className="rounded p-3 mt-3"
            style={{ backgroundColor: "#eef3fb", border: "1px solid #cfe2ff" }}
          >
            <p className="fw-semibold mb-2" style={{ color: "#1a4b9b", fontSize: "0.9rem" }}>
              {t("review.guidelinesTitle")}
            </p>
            <ul className="mb-0 ps-3" style={{ fontSize: "0.85rem", color: "#1a4b9b" }}>
              <li>{t("review.guidelineHonest")}</li>
              <li>{t("review.guidelinePersonal")}</li>
              <li>{t("review.guidelineRespect")}</li>
              <li>{t("review.guidelinePrivacy")}</li>
            </ul>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={submitting}>
          {t("review.cancelButton")}
        </Button>
        <Button
          variant="dark"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ minWidth: 160 }}
        >
          {submitting ? (
            <Spinner animation="border" size="sm" />
          ) : isEditMode ? (
            t("review.updateButton")
          ) : (
            t("review.submitButton")
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
