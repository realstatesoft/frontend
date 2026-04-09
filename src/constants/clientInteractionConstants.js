export const INTERACTION_TYPES = ["CALL", "EMAIL", "WHATSAPP", "VISIT", "MEETING", "NOTE"];

export const INTERACTION_TYPE_LABELS = {
  CALL: "Llamada",
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  VISIT: "Visita",
  MEETING: "Reunión",
  NOTE: "Nota",
};

export const INTERACTION_FILTER_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "CALL", label: "Llamada" },
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "VISIT", label: "Visita" },
  { value: "NOTE", label: "Nota" },
  { value: "MEETING", label: "Reunión" },
];

export const INTERACTION_FORM_OPTIONS = INTERACTION_TYPES.map((type) => ({
  value: type,
  label: INTERACTION_TYPE_LABELS[type],
}));

export const INTERACTION_SOURCE_LABELS = {
  MANUAL: "Manual",
  SYSTEM: "Automático",
};

export const INTERACTION_SOURCE_STYLES = {
  MANUAL: {
    backgroundColor: "#E8F5E9",
    color: "#2E7D32",
  },
  SYSTEM: {
    backgroundColor: "#FFF4E5",
    color: "#B45309",
  },
};

export const INTERACTION_TYPE_STYLES = {
  CALL: {
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
  },
  EMAIL: {
    backgroundColor: "#E0F2FE",
    color: "#0369A1",
  },
  WHATSAPP: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
  },
  VISIT: {
    backgroundColor: "#FCE7F3",
    color: "#BE185D",
  },
  MEETING: {
    backgroundColor: "#EDE9FE",
    color: "#6D28D9",
  },
  NOTE: {
    backgroundColor: "#F3F4F6",
    color: "#374151",
  },
};

export const EMPTY_INTERACTION_FORM = {
  type: "NOTE",
  subject: "",
  note: "",
  outcome: "",
  occurredAt: "",
};
