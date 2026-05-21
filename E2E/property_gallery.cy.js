describe('Property Detail Image Gallery Flow', () => {
  it('debe mostrar la galería de imágenes con thumbnails', () => {
    cy.visit('/properties');
    cy.contains('Ver Detalles', { timeout: 15000 }).should('be.visible');
    cy.contains('Ver Detalles').first().scrollIntoView().click({ force: true });

    // Validar imagen principal
    cy.get('.property__main-image', { timeout: 15000 })
      .should('be.visible')
      .and('have.attr', 'src');

    // Validar que existen miniaturas y sean visibles
    cy.get('.property__thumb-image').should('have.length.at.least', 1).first().should('be.visible');
  });

  it('debe permitir interactuar con las miniaturas de la galería', () => {
    cy.visit('/properties');
    cy.contains('Ver Detalles', { timeout: 15000 }).should('be.visible');
    cy.contains('Ver Detalles').first().scrollIntoView().click({ force: true });

    cy.get('.property__main-image', { timeout: 15000 }).should('be.visible');

    // Clicar en la primera miniatura y validar que no rompa la navegación
    cy.get('.property__thumb-image').first().should('be.visible').click({ force: true });

    // Validar que la miniatura clickeada sigue existiendo y visible (sin crash de la página)
    cy.get('.property__thumb-image').first().should('be.visible');
  });
});
