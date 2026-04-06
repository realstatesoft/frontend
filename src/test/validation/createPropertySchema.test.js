import { describe, it, expect } from 'vitest';
import { createPropertySchema } from '../../validation/createPropertySchema';

describe('createPropertySchema', () => {
  const validData = {
    title: 'Casa en el centro',
    address: 'Av. Corrientes 1234, Buenos Aires',
    price: '350000',
    propertyType: 'HOUSE',
  };

  // Helper: extrae los mensajes de error de un resultado Zod (compatible con v3 y v4)
  const getMessages = (zodError) => {
    const issues = zodError.issues ?? zodError.errors ?? [];
    return issues.map((e) => e.message);
  };

  it('valida correctamente datos válidos', () => {
    const result = createPropertySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe('title', () => {
    it('falla si el título está vacío', () => {
      const result = createPropertySchema.safeParse({ ...validData, title: '' });
      expect(result.success).toBe(false);
      const msgs = getMessages(result.error);
      expect(msgs).toContain('El título es obligatorio');
    });

    it('falla si el título supera 255 caracteres', () => {
      const result = createPropertySchema.safeParse({
        ...validData,
        title: 'a'.repeat(256),
      });
      expect(result.success).toBe(false);
      const msgs = getMessages(result.error);
      expect(msgs).toContain('El título no puede exceder 255 caracteres');
    });

    it('acepta un título con exactamente 255 caracteres', () => {
      const result = createPropertySchema.safeParse({
        ...validData,
        title: 'a'.repeat(255),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('address', () => {
    it('falla si la dirección está vacía', () => {
      const result = createPropertySchema.safeParse({ ...validData, address: '' });
      expect(result.success).toBe(false);
      const msgs = getMessages(result.error);
      expect(msgs).toContain('La dirección es obligatoria');
    });

    it('falla si la dirección supera 500 caracteres', () => {
      const result = createPropertySchema.safeParse({
        ...validData,
        address: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('price', () => {
    it('falla si el precio está vacío', () => {
      const result = createPropertySchema.safeParse({ ...validData, price: '' });
      expect(result.success).toBe(false);
      const msgs = getMessages(result.error);
      expect(msgs).toContain('El precio es obligatorio');
    });

    it('falla si el precio es 0', () => {
      const result = createPropertySchema.safeParse({ ...validData, price: '0' });
      expect(result.success).toBe(false);
      const msgs = getMessages(result.error);
      expect(msgs).toContain('El precio debe ser mayor a 0');
    });

    it('falla si el precio es negativo', () => {
      const result = createPropertySchema.safeParse({ ...validData, price: '-100' });
      expect(result.success).toBe(false);
    });

    it('falla si el precio no es numérico', () => {
      const result = createPropertySchema.safeParse({ ...validData, price: 'abc' });
      expect(result.success).toBe(false);
    });

    it('acepta un precio positivo válido', () => {
      const result = createPropertySchema.safeParse({ ...validData, price: '500000' });
      expect(result.success).toBe(true);
    });
  });

  describe('propertyType', () => {
    it('falla si propertyType está vacío', () => {
      const result = createPropertySchema.safeParse({ ...validData, propertyType: '' });
      expect(result.success).toBe(false);
      const msgs = getMessages(result.error);
      expect(msgs).toContain('El tipo de propiedad es obligatorio');
    });

    it('acepta cualquier string no vacío como propertyType', () => {
      const result = createPropertySchema.safeParse({ ...validData, propertyType: 'APARTMENT' });
      expect(result.success).toBe(true);
    });
  });

  describe('campos opcionales', () => {
    it('acepta datos sin campo category', () => {
      const { category: _cat, ...dataWithoutCategory } = { ...validData };
      const result = createPropertySchema.safeParse(dataWithoutCategory);
      expect(result.success).toBe(true);
    });

    it('acepta datos con geolocation válido', () => {
      const result = createPropertySchema.safeParse({
        ...validData,
        geolocation: { lat: -34.6, lng: -58.4 },
      });
      expect(result.success).toBe(true);
    });

    it('acepta geolocation con valores null', () => {
      const result = createPropertySchema.safeParse({
        ...validData,
        geolocation: { lat: null, lng: null },
      });
      expect(result.success).toBe(true);
    });
  });
});
