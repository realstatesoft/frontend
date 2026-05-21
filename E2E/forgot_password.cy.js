describe('Forgot Password Flow', () => {
  it('debe renderizar el formulario correctamente', () => {
    cy.visit('/forgot-password');
    cy.get('img[alt="Logo"]').should('be.visible');
    cy.get('h4').contains('Recuperar Contraseña').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    cy.get('a').contains('Regístrate aquí').should('exist');
  });

  it('debe mostrar error de validación con email vacío', () => {
    cy.visit('/forgot-password');
    cy.get('button[type="submit"]').click();
    cy.get('.field-error-msg', { timeout: 5000 })
      .should('be.visible')
      .and('contain', 'obligatorio');
  });

  it('debe mostrar error con email inválido', () => {
    cy.visit('/forgot-password');
    cy.get('input[type="email"]').type('correo-invalido');
    cy.get('button[type="submit"]').click();
    cy.get('.field-error-msg', { timeout: 5000 })
      .should('be.visible')
      .and(($el) => {
        const text = $el.text().toLowerCase();
        expect(text).to.satisfy((t) => t.includes('inválido') || t.includes('invalidemail'));
      });
  });
});
