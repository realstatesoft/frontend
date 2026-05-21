describe('User Logout Flow', () => {
  const email = Cypress.env('AGENTE_EMAIL');
  const password = Cypress.env('AGENTE_PASSWORD');

  beforeEach(() => {
    // Iniciar sesión utilizando el comando personalizado cy.login()
    cy.login(email, password);
    cy.url({ timeout: 15000 }).should('not.include', '/login');
  });

  it('debe cerrar sesión correctamente desde el dropdown del navbar', () => {
    // Asegurar que estamos en la página de inicio o cualquier página con Navbar
    cy.visit('/');

    // Clic en el botón del avatar de perfil en el Navbar
    cy.get('.profile-avatar-btn', { timeout: 15000 }).should('be.visible').click();

    // Validar que el dropdown sea visible y tenga la opción de cerrar sesión
    cy.get('.profile-dropdown-menu').should('be.visible');
    cy.get('.profile-dropdown-logout').should('be.visible').click();

    // Tras el cierre de sesión, verificar que el dropdown se cierra y la UI cambia
    cy.get('.profile-avatar-btn', { timeout: 15000 }).should('be.visible').click();
    cy.get('.profile-dropdown-menu').should('be.visible');
    cy.get('.profile-dropdown-menu .profile-dropdown-item')
      .contains(/Iniciar sesión/i)
      .should('be.visible');
  });

  it('debe redirigir al login al intentar acceder a una ruta protegida después de cerrar sesión', () => {
    cy.visit('/');

    // Hacer clic en el avatar y cerrar sesión
    cy.get('.profile-avatar-btn', { timeout: 15000 }).should('be.visible').click();
    cy.get('.profile-dropdown-logout').click();

    // Intentar visitar /profile
    cy.visit('/profile');

    // Verificar que redirige a /login
    cy.url({ timeout: 15000 }).should('include', '/login');
  });
});
