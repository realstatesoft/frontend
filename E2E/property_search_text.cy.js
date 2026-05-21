describe('Property Text Search Flow', () => {
  beforeEach(() => {
    cy.visit('/properties');
    cy.get('.spinner-border', { timeout: 15000 }).should('not.exist');
  });

  it('debe permitir escribir en el campo de búsqueda e interactuar con los resultados', () => {
    // Buscar el input en la barra de filtros
    cy.get('.filter-bar__search input')
      .should('be.visible')
      .type('Asunción'); // Buscamos por una ciudad común en Paraguay
    
    // Esperamos a que los resultados se actualicen (debounce de 200ms + request del servidor)
    cy.get('.spinner-border', { timeout: 15000 }).should('not.exist');

    // Comprobamos que el input contiene el valor correcto
    cy.get('.filter-bar__search input').should('have.value', 'Asunción');
  });

  it('debe mostrar el botón de limpiar filtros cuando se escribe texto y permitir borrar la búsqueda', () => {
    // Escribir en la barra de búsqueda
    cy.get('.filter-bar__search input').type('Departamento');

    // Esperar a que se actualicen los filtros
    cy.get('.spinner-border', { timeout: 15000 }).should('not.exist');

    // Debe mostrarse el botón para limpiar filtros (✕)
    cy.get('.filter-bar__clear').should('be.visible').click();

    // Tras limpiar, el valor del input debe estar vacío
    cy.get('.filter-bar__search input').should('have.value', '');
  });
});
