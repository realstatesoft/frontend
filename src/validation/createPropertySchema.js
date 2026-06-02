import { z } from "zod";

const MAX_PRICE = 9999999999.99;

const defaultMessages = {
  titleRequired: "El título es obligatorio",
  titleTooLong: "El título no puede exceder 255 caracteres",
  addressRequired: "La dirección es obligatoria",
  addressTooLong: "La dirección no puede exceder 500 caracteres",
  priceRequired: "El precio es obligatorio",
  pricePositive: "El precio debe ser mayor a 0",
  priceMaxExceeded: `El precio no puede superar 9.999.999.999,99`,
  propertyTypeRequired: "El tipo de propiedad es obligatorio",
};

/**
 * Esquema de validación para creación de propiedades en el frontend.
 * Recibe un traductor para mantener los mensajes desacoplados del idioma.
 */
export function createPropertySchema(t = (key) => defaultMessages[key] ?? key) {
  return z.object({
    title: z
      .string()
      .min(1, t("titleRequired"))
      .max(255, t("titleTooLong")),

    address: z
      .string()
      .min(1, t("addressRequired"))
      .max(500, t("addressTooLong")),

    price: z
      .string()
      .min(1, t("priceRequired"))
      .refine((v) => {
        const n = Number(v);
        return !isNaN(n) && n > 0;
      }, t("pricePositive"))
      .refine((v) => {
        const n = Number(v);
        return isNaN(n) || n <= MAX_PRICE;
      }, t("priceMaxExceeded")),

    propertyType: z.string().min(1, t("propertyTypeRequired")),

    category: z.string().optional(),

    geolocation: z
      .object({
        lat: z.number().nullable().optional(),
        lng: z.number().nullable().optional(),
      })
      .optional(),
  });
}

export default createPropertySchema;
