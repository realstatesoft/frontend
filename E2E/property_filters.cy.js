describe('Property Filters Flow', () => {
  beforeEach(() => {
    cy.visit('/properties');
    // Esperamos a que termine de cargar el loading inicial
    cy.get('.spinner-border', { timeout: 15000 }).should('not.exist');
  });

  it('debe filtrar por tipo de propiedad correctamente', () => {
    // Seleccionamos tipo "Departamento" en el select oculto de Tipo
    cy.get('select[aria-label="Tipo"]').select('Departamento', { force: true });

    // Esperar a que se aplique el filtro (el loading aparece y desaparece)
    cy.get('.spinner-border', { timeout: 15000 }).should('not.exist');

    // Validar que la URL incluya la actualización o que los resultados cambien
    // Opcional: validar que el label de la píldora cambie a "Departamento"
    cy.get('.filter-pill').contains('Departamento').should('be.visible');
  });

  it('debe filtrar por categoría Venta/Alquiler correctamente', () => {
    // Seleccionamos categoría "Alquiler" en el select de Operación
    cy.get('select[aria-label="Operación"]').select('Alquiler', { force: true });

    cy.get('.spinner-border', { timeout: 15000 }).should('not.exist');

    // Validar que el label de la píldora cambie a "Alquiler"
    cy.get('.filter-pill').contains('Alquiler').should('be.visible');
  });

  it('debe limpiar todos los filtros correctamente', () => {
    // Aplicamos un par de filtros primero
    cy.get('select[aria-label="Operación"]').select('Venta', { force: true });
    cy.get('select[aria-label="Tipo"]').select('Casa', { force: true });

    cy.get('.spinner-border', { timeout: 15000 }).should('not.exist');

    // Hacemos clic en el botón de limpiar filtros (el botón con la clase ✕)
    cy.get('button.filter-bar__clear').should('be.visible').click();

    cy.get('.spinner-border', { timeout: 15000 }).should('not.exist');

    // Validar que vuelvan a su estado original/por defecto
    cy.get('.filter-pill').contains('Operación').should('be.visible');
    cy.get('.filter-pill').contains('Tipo').should('be.visible');
  });
});
