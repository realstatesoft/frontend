describe('404 Not Found Page Flow', () => {
  it('debe renderizar la página 404 en una ruta inexistente', () => {
    // Visitamos una ruta inexistente
    cy.visit('/alguna-ruta-que-no-existe-12345', { failOnStatusCode: false });

    // Validar el 404 visible
    cy.get('h1.display-1').should('be.visible').and('contain', '404');
    cy.get('h2').should('be.visible').and('contain', 'Página no encontrada');
    cy.get('p').should('be.visible').and('contain', 'La página o el cliente que buscas no existe');
    cy.get('a.btn').should('be.visible').and('contain', 'Volver al inicio');
  });

  it('debe volver al Home desde la página 404', () => {
    cy.visit('/alguna-ruta-que-no-existe-12345', { failOnStatusCode: false });

    // Hacemos clic en el botón de volver al inicio
    cy.get('a.btn').contains('Volver al inicio').click();

    // Verificamos redirección al Home
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
