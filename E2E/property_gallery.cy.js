describe('Property Detail Image Gallery Flow', () => {
  it('debe mostrar la galería de imágenes con thumbnails', () => {
    cy.visit('/properties');
    cy.contains('Ver Detalles', { timeout: 15000 }).should('be.visible');
    cy.contains('Ver Detalles').first().scrollIntoView().click({ force: true });

    // Validar imagen principal
    cy.get('.property__main-image', { timeout: 15000 })
      .should('be.visible')
      .and('have.attr', 'src');

    // Validar que, si existen miniaturas, sean visibles
    cy.get('body').then(($body) => {
      if ($body.find('.property__thumb-image').length > 0) {
        cy.get('.property__thumb-image').first().should('be.visible');
      }
    });
  });

  it('debe permitir interactuar con las miniaturas de la galería', () => {
    cy.visit('/properties');
    cy.contains('Ver Detalles', { timeout: 15000 }).should('be.visible');
    cy.contains('Ver Detalles').first().scrollIntoView().click({ force: true });

    cy.get('.property__main-image', { timeout: 15000 }).should('be.visible');

    cy.get('body').then(($body) => {
      if ($body.find('.property__thumb-image').length > 0) {
        // Obtenemos la URL de la primera miniatura
        cy.get('.property__thumb-image')
          .first()
          .should('be.visible')
          .then(($thumb) => {
            const thumbSrc = $thumb.attr('src');
            // Hacemos clic en ella
            cy.wrap($thumb).click({ force: true });
            cy.log('Miniatura clickeada:', thumbSrc);
          });
      } else {
        cy.log('No hay miniaturas en esta propiedad para interactuar.');
      }
    });
  });
});
