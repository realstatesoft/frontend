describe('Navbar Authenticated User Flow', () => {
  const email = Cypress.env('AGENTE_EMAIL');
  const password = Cypress.env('AGENTE_PASSWORD');

  beforeEach(() => {
    // Iniciar sesión utilizando cy.login()
    cy.login(email, password);
    cy.url({ timeout: 15000 }).should('not.include', '/login');
  });

  it('debe abrir el dropdown de perfil y mostrar opciones de agente', () => {
    cy.visit('/');

    // Clic en el botón del avatar de perfil
    cy.get('.profile-avatar-btn').should('be.visible').click();

    // Validar menú dropdown visible
    cy.get('.profile-dropdown-menu').should('be.visible');

    // Validar opciones comunes del usuario autenticado
    cy.get('.profile-dropdown-menu a[href="/profile"]').should('be.visible');
    cy.get('.profile-dropdown-menu a[href="/properties/me"]').should('be.visible');
    cy.get('.profile-dropdown-menu a[href="/properties/favorites"]').should('be.visible');
    cy.get('.profile-dropdown-menu a[href="/preferences"]').should('be.visible');

    // Validar opciones específicas de Agente
    cy.get('.profile-dropdown-menu a[href="/agent/dashboard"]').should('be.visible');
    cy.get('.profile-dropdown-menu a[href="/agent/agenda"]').should('be.visible');
  });

  it('debe navegar a /profile desde el dropdown de perfil', () => {
    cy.visit('/');
    cy.get('.profile-avatar-btn').should('be.visible').click();
    cy.get('.profile-dropdown-menu a[href="/profile"]').click();
    cy.url({ timeout: 15000 }).should('include', '/profile');
  });

  it('debe navegar a /properties/me desde el dropdown de perfil', () => {
    cy.visit('/');
    cy.get('.profile-avatar-btn').should('be.visible').click();
    cy.get('.profile-dropdown-menu a[href="/properties/me"]').click();
    cy.url({ timeout: 15000 }).should('include', '/properties/me');
  });

  it('debe navegar al dashboard del agente desde el dropdown de perfil', () => {
    cy.visit('/');
    cy.get('.profile-avatar-btn').should('be.visible').click();
    cy.get('.profile-dropdown-menu a[href="/agent/dashboard"]').click();
    cy.url({ timeout: 15000 }).should('include', '/agent/dashboard');
  });
});
