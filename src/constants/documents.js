export const KYC_REQUIRED_TYPES = [
  {
    value: "ID_FRONT",
    label: "Cédula de Identidad — Frente",
    description: "Fotografiá el frente de tu CI. Tu nombre, número y foto deben ser claramente visibles.",
    tip: "Buena iluminación, sin reflejos ni bordes cortados.",
    accept: "Foto o PDF",
  },
  {
    value: "ID_BACK",
    label: "Cédula de Identidad — Reverso",
    description: "Fotografiá el dorso de tu CI. El código de barras debe ser legible.",
    tip: "Evitá sombras sobre el código de barras.",
    accept: "Foto o PDF",
  },
  {
    value: "SELFIE",
    label: "Foto de tu rostro (Selfie)",
    description: "Subí una foto reciente de tu cara mirando de frente. Sin anteojos de sol ni accesorios que cubran el rostro.",
    tip: "Fondo claro y buena iluminación. Sosté la cámara a la altura de los ojos.",
    accept: "Solo foto (JPG, PNG)",
  },
  {
    value: "PROOF_OF_ADDRESS",
    label: "Comprobante de Domicilio",
    description: "Subí una factura de servicios (luz, agua, gas) o un certificado de residencia con fecha de los últimos 3 meses.",
    tip: "Tu nombre completo, dirección y fecha deben ser legibles.",
    accept: "Foto o PDF",
  },
];

export const KYC_REQUIRED = KYC_REQUIRED_TYPES.map(k => k.value);

export const DOC_LABELS = {
  ID_FRONT: "Cédula — Frente",
  ID_BACK: "Cédula — Reverso",
  SELFIE: "Foto de Rostro",
  PROOF_OF_ADDRESS: "Comprobante de Domicilio",
  PROOF_OF_INCOME: "Comprobante de Ingresos",
  TAX_RETURN: "Declaración de Impuestos",
  BANK_STATEMENT: "Extracto Bancario",
  OTHER: "Otro",
  ID: "Cédula (legacy)"
};
