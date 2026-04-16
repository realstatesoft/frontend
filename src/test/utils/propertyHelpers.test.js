import { describe, it, expect } from 'vitest';
import { buildFeaturesFromProperty } from '../../utils/propertyHelpers';

// Helper mock para enums globales
vi.mock('../../constants/propertyEnums', () => ({
  ID_TO_INTERIOR_FEATURE: {
    1: 'Aire Acondicionado',
    2: 'Calefacción',
  },
  ID_TO_EXTERIOR_FEATURE: {
    1: 'Piscina',
    2: 'Jardín',
  }
}));

describe('propertyHelpers', () => {
  describe('buildFeaturesFromProperty', () => {
    it('returns empty array when property is empty or null', () => {
      expect(buildFeaturesFromProperty(null)).toEqual([]);
      expect(buildFeaturesFromProperty({})).toEqual([]);
    });

    it('builds Bedrooms and Bathrooms feature correctly', () => {
      const property = { bedrooms: 3, bathrooms: 2, fullBathrooms: 1 };
      const features = buildFeaturesFromProperty(property);

      expect(features).toContainEqual({
        title: "Dormitorios y baños",
        items: [
          "Dormitorios: 3",
          "Baños: 2",
          "Baños completos: 1"
        ]
      });
    });

    it('builds rooms features correctly with names and mapped features', () => {
      const property = {
        rooms: [
          { name: "Cocina", area: 15, interiorFeatureIds: [1] },
          { area: 20, interiorFeatureIds: [2] } // default name
        ]
      };
      
      const features = buildFeaturesFromProperty(property);
      expect(features).toContainEqual({
        title: "Cocina",
        items: ["Superficie: 15 m²", "Características: Aire Acondicionado"]
      });
      expect(features).toContainEqual({
        title: "Habitación",
        items: ["Superficie: 20 m²", "Características: Calefacción"]
      });
    });

    it('builds exterior features mapping IDs properly', () => {
      const property = { exteriorFeatureIds: [1, 2] };
      const features = buildFeaturesFromProperty(property);
      
      expect(features).toContainEqual({
        title: "Exterior",
        items: ["Piscina, Jardín"]
      });
    });

    it('builds services section', () => {
      const property = {
        waterConnection: 'Red pública',
        electricityInstallation: 'Trifásica',
        sanitaryInstallation: 'Pozo ciego'
      };
      const features = buildFeaturesFromProperty(property);
      
      expect(features).toContainEqual({
        title: "Servicios",
        items: [
          "Agua: Red pública",
          "Electricidad: Trifásica",
          "Sanitario: Pozo ciego"
        ]
      });
    });

    it('builds construction section correctly and safely skips empty ones', () => {
      const property = {
        structureMaterial: 'Hormigón',
        wallsMaterial: 'Ladrillo hueco'
      };
      const features = buildFeaturesFromProperty(property);
      
      expect(features).toContainEqual({
        title: "Construcción",
        items: [
          "Estructura: Hormigón",
          "Paredes: Ladrillo hueco"
        ]
      });
    });

    it('returns a combination of all present sections', () => {
      const property = {
        bedrooms: 1,
        exteriorFeatureIds: [1],
        roofMaterial: 'Teja'
      };
      const features = buildFeaturesFromProperty(property);
      expect(features.length).toBe(3);
    });
  });
});
