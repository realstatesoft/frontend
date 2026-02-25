/** Opciones para selects del formulario de crear propiedad */

export const ELECTRICITY_OPTIONS = ["Trifásica", "Monofásica"];
export const WATER_OPTIONS = ["Agua corriente", "Pozo", "Cisterna"];
export const SANITARY_OPTIONS = ["Red pública", "Cámara séptica"];
export const STRUCTURE_OPTIONS = ["Hormigón", "Madera", "Mixto"];
export const WALLS_OPTIONS = ["Ladrillo", "Bloque", "Yeso"];
export const FLOOR_OPTIONS = ["Azulejos", "Madera", "Cemento", "Porcelanato"];
export const ROOF_OPTIONS = ["Tejas", "Losa", "Chapa"];
export const FLOOR_LEVEL_OPTIONS = ["Planta baja", "Primera", "Segunda"];
export const DIMENSION_OPTIONS = ["3 x 3 mts.", "4 x 4 mts.", "5 x 5 mts.", "6 x 6 mts.", "8 x 8 mts."];

export const getInitialRoom = (index) => ({
  name: `Dormitorio ${index + 1}`,
  floor: "Planta baja",
  dimensions: "6 x 6 mts.",
  features: [],
});

export const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200&q=70",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&q=70",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=70",
  "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=200&q=70",
];

/** ownerId temporal hasta tener autenticación */
export const DEFAULT_OWNER_ID = 1;
