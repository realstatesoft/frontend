import { z } from "zod";

/**
 * Esquema de validación para creación de propiedades en el frontend.
 * No intenta duplicar TODAS las reglas del backend, solo las mínimas
 * necesarias para una buena UX antes de enviar.
 */
export const createPropertySchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(255, "El título no puede exceder 255 caracteres"),

  address: z
    .string()
    .min(1, "La dirección es obligatoria")
    .max(500, "La dirección no puede exceder 500 caracteres"),

  price: z
    .string()
    .min(1, "El precio es obligatorio")
    .refine((v) => {
      const n = Number(v);
      return !isNaN(n) && n > 0;
    }, "El precio debe ser mayor a 0"),

  propertyType: z.string().min(1, "El tipo de propiedad es obligatorio"),

  category: z.string().optional(),

  geolocation: z
    .object({
      lat: z.number().nullable().optional(),
      lng: z.number().nullable().optional(),
    })
    .optional(),
});

