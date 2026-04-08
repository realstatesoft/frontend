import { describe, it, expect, beforeEach } from 'vitest';
import useUIStore from '../../store/useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Resetear el store a su estado inicial antes de cada test
    useUIStore.setState({ sidebarCollapsed: false, darkMode: false });
  });

  describe('sidebarCollapsed', () => {
    it('inicia con sidebarCollapsed en false', () => {
      const { sidebarCollapsed } = useUIStore.getState();
      expect(sidebarCollapsed).toBe(false);
    });

    it('toggleSidebar cambia sidebarCollapsed a true', () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    });

    it('toggleSidebar alterna correctamente (true → false)', () => {
      useUIStore.getState().toggleSidebar(); // false → true
      useUIStore.getState().toggleSidebar(); // true → false
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });

    it('setSidebarCollapsed establece el valor directamente', () => {
      useUIStore.getState().setSidebarCollapsed(true);
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);
      useUIStore.getState().setSidebarCollapsed(false);
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });
  });

  describe('darkMode', () => {
    it('inicia con darkMode en false', () => {
      expect(useUIStore.getState().darkMode).toBe(false);
    });

    it('toggleDarkMode activa el modo oscuro', () => {
      useUIStore.getState().toggleDarkMode();
      expect(useUIStore.getState().darkMode).toBe(true);
    });

    it('toggleDarkMode alterna correctamente (true → false)', () => {
      useUIStore.getState().toggleDarkMode(); // false → true
      useUIStore.getState().toggleDarkMode(); // true → false
      expect(useUIStore.getState().darkMode).toBe(false);
    });

    it('toggleDarkMode establece el atributo data-theme en el documento', () => {
      useUIStore.getState().toggleDarkMode(); // activar dark
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      useUIStore.getState().toggleDarkMode(); // desactivar dark
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});
