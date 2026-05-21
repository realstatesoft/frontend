describe('Protected Routes Redirect Flow', () => {
  it('debe redirigir a /login al intentar acceder a /profile sin estar autenticado', () => {
    cy.visit('/profile');
    cy.url({ timeout: 15000 }).should('include', '/login');
  });

  it('debe redirigir a /login al intentar acceder a /properties/me sin estar autenticado', () => {
    cy.visit('/properties/me');
    cy.url({ timeout: 15000 }).should('include', '/login');
  });

  it('debe redirigir a /login al intentar acceder a /preferences sin estar autenticado', () => {
    cy.visit('/preferences');
    cy.url({ timeout: 15000 }).should('include', '/login');
  });
});
