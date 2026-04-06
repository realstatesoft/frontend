import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../hooks/useAuth');
import { useAuth } from '../../hooks/useAuth';
import { usePropertyPermissions } from '../../hooks/usePropertyPermissions';

const mockProperty = {
  id: 10,
  ownerId: 1,
  propertyAssignments: [],
};

describe('usePropertyPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('visitante no autenticado', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ isAuthenticated: false, user: null });
    });

    it('retorna todos los permisos en false excepto canShare', () => {
      const { result } = renderHook(() => usePropertyPermissions(mockProperty));
      expect(result.current.canChangeStatus).toBe(false);
      expect(result.current.canChangeVisibility).toBe(false);
      expect(result.current.canEdit).toBe(false);
      expect(result.current.canDelete).toBe(false);
      expect(result.current.canFeature).toBe(false);
      expect(result.current.canShare).toBe(true);
      expect(result.current.isOwner).toBe(false);
      expect(result.current.isAdmin).toBe(false);
    });
  });

  describe('propietario (OWNER)', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { userId: 1, role: 'USER' },
      });
    });

    it('puede editar su propia propiedad', () => {
      const { result } = renderHook(() => usePropertyPermissions(mockProperty));
      expect(result.current.isOwner).toBe(true);
      expect(result.current.canEdit).toBe(true);
    });

    it('puede eliminar su propia propiedad', () => {
      const { result } = renderHook(() => usePropertyPermissions(mockProperty));
      expect(result.current.canDelete).toBe(true);
    });

    it('NO puede cambiar el estado de revisión (solo ADMIN)', () => {
      const { result } = renderHook(() => usePropertyPermissions(mockProperty));
      expect(result.current.canChangeStatus).toBe(false);
    });

    it('puede cambiar visibilidad', () => {
      const { result } = renderHook(() => usePropertyPermissions(mockProperty));
      expect(result.current.canChangeVisibility).toBe(true);
    });
  });

  describe('administrador (ADMIN)', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { userId: 99, role: 'ADMIN' },
      });
    });

    it('puede cambiar el estado de revisión', () => {
      const { result } = renderHook(() => usePropertyPermissions(mockProperty));
      expect(result.current.canChangeStatus).toBe(true);
      expect(result.current.isAdmin).toBe(true);
    });

    it('puede eliminar cualquier propiedad', () => {
      const { result } = renderHook(() => usePropertyPermissions(mockProperty));
      expect(result.current.canDelete).toBe(true);
    });

    it('puede editar cualquier propiedad aunque no sea el dueño', () => {
      const { result } = renderHook(() => usePropertyPermissions(mockProperty));
      expect(result.current.canEdit).toBe(true);
      expect(result.current.isOwner).toBe(false);
    });
  });

  describe('usuario autenticado sin ser dueño ni admin', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { userId: 55, role: 'USER' },
      });
    });

    it('no puede editar ni eliminar propiedades ajenas', () => {
      const { result } = renderHook(() => usePropertyPermissions(mockProperty));
      expect(result.current.canEdit).toBe(false);
      expect(result.current.canDelete).toBe(false);
    });

    it('puede compartir siempre', () => {
      const { result } = renderHook(() => usePropertyPermissions(mockProperty));
      expect(result.current.canShare).toBe(true);
    });
  });

  describe('agente asignado (hasAssignment)', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { userId: 77, role: 'AGENT' },
      });
    });

    it('puede editar si está en propertyAssignments', () => {
      const propertyWithAssignment = {
        ...mockProperty,
        propertyAssignments: [{ userId: 77, propertyId: 10 }],
      };
      const { result } = renderHook(() => usePropertyPermissions(propertyWithAssignment));
      expect(result.current.canEdit).toBe(true);
    });

    it('NO puede eliminar aunque esté asignado', () => {
      const propertyWithAssignment = {
        ...mockProperty,
        propertyAssignments: [{ userId: 77, propertyId: 10 }],
      };
      const { result } = renderHook(() => usePropertyPermissions(propertyWithAssignment));
      expect(result.current.canDelete).toBe(false);
    });
  });
});
