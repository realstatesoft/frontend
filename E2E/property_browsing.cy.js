describe('Property Browsing Flow', () => {
  // Nota: Estas pruebas dependen de que existan propiedades cargadas en la base de datos remota.

  it('debe cargar la lista de propiedades desde el servidor', () => {
    cy.visit('/properties');
    
    // Esperamos a que aparezcan las tarjetas de propiedades (PropertyCard)
    // Nos guiamos por el botón "Ver Detalles" que tienen las tarjetas
    cy.contains('Ver Detalles', { timeout: 15000 }).should('be.visible');
    
    // Verificamos que se hayan cargado en la grilla
    cy.get('.row').find('.col-12.col-sm-6').should('have.length.at.least', 1);
  });

  it('debe navegar a los detalles de una propiedad real', () => {
    cy.visit('/properties');
    
    // Esperar a que el botón Ver Detalles esté visible
    cy.contains('Ver Detalles', { timeout: 15000 }).should('be.visible');

    // Hacemos clic en el botón "Ver Detalles" de la primera tarjeta
    cy.contains('Ver Detalles').first().scrollIntoView().click({ force: true });

    // Verificar que la URL cambie al formato de detalle: /properties/:id
    cy.url().should('match', /\/properties\/\d+/);
    
    // Verificamos que se cargue contenido en la página de detalle
    // (Ajustar selector según ShowProperty/PropertyDetail page)
    cy.get('main, .container', { timeout: 10000 }).should('be.visible');
  });
});

