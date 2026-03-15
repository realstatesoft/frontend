/** Opciones para selects del formulario de crear propiedad */

export const ELECTRICITY_OPTIONS = ["Trifásica", "Monofásica"];
export const WATER_OPTIONS = ["Agua corriente", "Pozo", "Cisterna"];
export const SANITARY_OPTIONS = ["Red pública", "Cámara séptica"];
export const STRUCTURE_OPTIONS = ["Hormigón", "Madera", "Mixto"];
export const WALLS_OPTIONS = ["Ladrillo", "Bloque", "Yeso"];
export const FLOOR_OPTIONS = ["Azulejos", "Madera", "Cemento", "Porcelanato"];
export const ROOF_OPTIONS = ["Tejas", "Losa", "Chapa"];
export const FLOOR_LEVEL_OPTIONS = [
  "Planta baja",
  "Primera",
  "Segunda",
  "Tercera",
  "Cuarta",
  "Quinta",
  "Sexta",
  "Séptima",
  "Octava",
  "Novena",
  "Décima",
];

/** Opciones de planta válidas según la cantidad de plantas declarada (1–10) */
export const getFloorOptionsForCount = (count) => {
  const n = Math.min(Math.max(parseInt(count, 10) || 1, 1), 10);
  return FLOOR_LEVEL_OPTIONS.slice(0, n);
};

/** Índice de la planta (0 = Planta baja, 1 = Primera, etc.) */
export const getFloorIndex = (floorLabel) =>
  Math.max(0, FLOOR_LEVEL_OPTIONS.indexOf(floorLabel));
export const DIMENSION_OPTIONS = ["3 x 3 mts.", "4 x 4 mts.", "5 x 5 mts.", "6 x 6 mts.", "8 x 8 mts."];

export const getInitialRoom = (index) => ({
  name: `Dormitorio ${index + 1}`,
  floor: "Planta baja",
  dimensions: "6 x 6 mts.",
  features: [],
});

export const getInitialBedroom = (index) => ({
  name: `Dormitorio ${index + 1}`,
  floor: "Planta baja",
  dimensions: "6 x 6 mts.",
  features: [],
});

export const getInitialHalfBathroom = (index) => ({
  name: `Medio baño ${index + 1}`,
  floor: "Planta baja",
  dimensions: "3 x 3 mts.",
  features: [],
});

export const getInitialFullBathroom = (index) => ({
  name: `Baño completo ${index + 1}`,
  floor: "Planta baja",
  dimensions: "4 x 4 mts.",
  features: [],
});

export const getInitialExtraRoom = (index) => ({
  name: `Habitación ${index + 1}`,
  floor: "Planta baja",
  dimensions: "4 x 4 mts.",
  features: [],
});

/** Construye el array de rooms: [dormitorios..., mediosBaños..., bañosCompletos..., extras...] */
export const buildRoomsFromCounts = (bedrooms, halfBathrooms, fullBathrooms, extraRooms = []) => {
  const b = Math.max(0, parseInt(bedrooms, 10) || 0);
  const h = Math.max(0, parseInt(halfBathrooms, 10) || 0);
  const f = Math.max(0, parseInt(fullBathrooms, 10) || 0);
  const bedroomsArr = Array.from({ length: b }, (_, i) => getInitialBedroom(i));
  const halfBathsArr = Array.from({ length: h }, (_, i) => getInitialHalfBathroom(i));
  const fullBathsArr = Array.from({ length: f }, (_, i) => getInitialFullBathroom(i));
  return [...bedroomsArr, ...halfBathsArr, ...fullBathsArr, ...extraRooms];
};

export const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200&q=70",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&q=70",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=70",
  "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=200&q=70",
];
