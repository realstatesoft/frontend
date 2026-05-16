import { z } from "zod";

/**
 * Schema de validación para el formulario de reseña de agente.
 * Recibe un traductor para mantener los mensajes desacoplados del idioma.
 */
export function createReviewSchema(t = (key) => key) {
  return z.object({
    rating: z
      .number({ required_error: t("review.validation.ratingRequired") })
      .int()
      .min(1, t("review.validation.ratingRequired"))
      .max(5, t("review.validation.ratingRequired")),

    title: z
      .string()
      .min(10, t("review.validation.titleMin"))
      .max(100, t("review.validation.titleMax")),

    comment: z
      .string()
      .min(10, t("review.validation.commentMin"))
      .max(1000, t("review.validation.commentMax")),

    propertyId: z.number().nullable().optional(),
  });
}

export default createReviewSchema;
