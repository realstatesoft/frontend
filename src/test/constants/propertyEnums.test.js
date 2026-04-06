import { describe, it, expect } from 'vitest';
import {
  PROPERTY_TYPE,
  CATEGORY,
  CONSTRUCTION_STATUS,
  AVAILABILITY,
  VISIBILITY,
  PROPERTY_TYPE_LABELS,
  CATEGORY_LABELS,
  PROPERTY_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_VISIBILITY_OPTIONS,
} from '../../constants/propertyEnums';

describe('propertyEnums', () => {
  describe('PROPERTY_TYPE', () => {
    it('contiene los tipos de propiedad esperados', () => {
      expect(PROPERTY_TYPE.Casa).toBe('HOUSE');
      expect(PROPERTY_TYPE.Departamento).toBe('APARTMENT');
      expect(PROPERTY_TYPE.Terreno).toBe('LAND');
      expect(PROPERTY_TYPE.Local).toBe('OFFICE');
      expect(PROPERTY_TYPE.Depósito).toBe('WAREHOUSE');
      expect(PROPERTY_TYPE.Campo).toBe('FARM');
    });

    it('tiene exactamente 6 tipos de propiedad', () => {
      expect(Object.keys(PROPERTY_TYPE)).toHaveLength(6);
    });
  });

  describe('CATEGORY', () => {
    it('mapea Venta a SALE', () => {
      expect(CATEGORY.Venta).toBe('SALE');
    });

    it('mapea Alquiler a RENT', () => {
      expect(CATEGORY.Alquiler).toBe('RENT');
    });

    it('mapea "Venta o Alquiler" a SALE_OR_RENT', () => {
      expect(CATEGORY['Venta o Alquiler']).toBe('SALE_OR_RENT');
    });
  });

  describe('PROPERTY_TYPE_LABELS (mapa inverso)', () => {
    it('convierte HOUSE → Casa', () => {
      expect(PROPERTY_TYPE_LABELS['HOUSE']).toBe('Casa');
    });

    it('convierte APARTMENT → Departamento', () => {
      expect(PROPERTY_TYPE_LABELS['APARTMENT']).toBe('Departamento');
    });

    it('es el inverso exacto de PROPERTY_TYPE', () => {
      Object.entries(PROPERTY_TYPE).forEach(([label, value]) => {
        expect(PROPERTY_TYPE_LABELS[value]).toBe(label);
      });
    });
  });

  describe('CATEGORY_LABELS (mapa inverso)', () => {
    it('convierte SALE → Venta', () => {
      expect(CATEGORY_LABELS['SALE']).toBe('Venta');
    });

    it('convierte RENT → Alquiler', () => {
      expect(CATEGORY_LABELS['RENT']).toBe('Alquiler');
    });
  });

  describe('PROPERTY_TYPE_OPTIONS', () => {
    it('es un array de strings', () => {
      expect(Array.isArray(PROPERTY_TYPE_OPTIONS)).toBe(true);
      PROPERTY_TYPE_OPTIONS.forEach((opt) => expect(typeof opt).toBe('string'));
    });

    it('contiene "Casa"', () => {
      expect(PROPERTY_TYPE_OPTIONS).toContain('Casa');
    });
  });

  describe('CATEGORY_OPTIONS', () => {
    it('contiene todas las categorías disponibles', () => {
      expect(CATEGORY_OPTIONS).toContain('Venta');
      expect(CATEGORY_OPTIONS).toContain('Alquiler');
      expect(CATEGORY_OPTIONS).toContain('Venta o Alquiler');
    });
  });

  describe('CONSTRUCTION_STATUS', () => {
    it('define los estados de construcción correctamente', () => {
      expect(CONSTRUCTION_STATUS.Nueva).toBe('NEW');
      expect(CONSTRUCTION_STATUS.Usada).toBe('USED');
      expect(CONSTRUCTION_STATUS['En construcción']).toBe('UNDER_CONSTRUCTION');
      expect(CONSTRUCTION_STATUS['A refaccionar']).toBe('TO_RENOVATE');
    });
  });

  describe('AVAILABILITY', () => {
    it('define las disponibilidades esperadas', () => {
      expect(AVAILABILITY.Inmediata).toBe('IMMEDIATE');
      expect(AVAILABILITY['En 30 días']).toBe('IN_30_DAYS');
      expect(AVAILABILITY['A negociar']).toBe('TO_NEGOTIATE');
    });
  });

  describe('VISIBILITY', () => {
    it('define las visibilidades correctamente', () => {
      expect(VISIBILITY.Pública).toBe('PUBLIC');
      expect(VISIBILITY.Privada).toBe('PRIVATE');
      expect(VISIBILITY.Oculto).toBe('HIDDEN');
    });
  });

  describe('PROPERTY_STATUS_OPTIONS', () => {
    it('es un array de objetos { value, label }', () => {
      expect(Array.isArray(PROPERTY_STATUS_OPTIONS)).toBe(true);
      PROPERTY_STATUS_OPTIONS.forEach((opt) => {
        expect(opt).toHaveProperty('value');
        expect(opt).toHaveProperty('label');
      });
    });

    it('contiene el estado PUBLISHED', () => {
      const published = PROPERTY_STATUS_OPTIONS.find((o) => o.value === 'PUBLISHED');
      expect(published).toBeDefined();
      expect(published.label).toBe('Publicado');
    });
  });

  describe('PROPERTY_VISIBILITY_OPTIONS', () => {
    it('contiene las 3 opciones de visibilidad', () => {
      expect(PROPERTY_VISIBILITY_OPTIONS).toHaveLength(3);
    });

    it('contiene la opción PUBLIC', () => {
      const pub = PROPERTY_VISIBILITY_OPTIONS.find((o) => o.value === 'PUBLIC');
      expect(pub).toBeDefined();
      expect(pub.label).toBe('Público');
    });
  });
});
