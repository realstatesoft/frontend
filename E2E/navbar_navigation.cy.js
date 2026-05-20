describe('Navbar Navigation Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('debe navegar a /properties al hacer clic en "Alquilar"', () => {
    // Clic en "Alquilar" en el Navbar
    cy.get('.navbar .nav-link').contains(/Alquilar/i).click();

    // Valida redirección a /properties
    cy.url().should('include', '/properties');

    // Valida estado del history para ver si tiene Alquiler
    cy.window().its('history.state.usr').should('deep.include', { saleRent: 'Alquiler' });
  });

  it('debe navegar a /property-management al hacer clic en "Vender"', () => {
    // Clic en "Vender" en el Navbar
    cy.get('.navbar .nav-link').contains(/Vender/i).click();

    // Valida redirección a /property-management (o a /login debido a que es una ruta protegida)
    cy.url().should('satisfy', (url) => {
      return url.includes('/property-management') || url.includes('/login');
    });
  });

  it('debe navegar a /agents al hacer clic en "Agentes"', () => {
    // Clic en "Agentes" en el Navbar
    cy.get('.navbar .nav-link').contains(/Agentes/i).click();

    // Valida redirección a /agents
    cy.url().should('include', '/agents');
  });

  it('debe volver al Home al hacer clic en el logo', () => {
    // Vamos primero a otra página
    cy.visit('/properties');
    
    // Clic en el logo del Navbar
    cy.get('.navbar-brand').click();

    // Valida redirección al Home
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('debe abrir el dropdown de perfil y mostrar la opción "Iniciar sesión" si no está autenticado', () => {
    // Clic en el botón del avatar de perfil en el Navbar
    cy.get('.profile-avatar-btn').should('be.visible').click();

    // Validar que el dropdown sea visible y tenga "Iniciar sesión"
    cy.get('.profile-dropdown-menu').should('be.visible');
    cy.get('.profile-dropdown-menu .profile-dropdown-item')
      .contains(/Iniciar sesión/i)
      .should('be.visible');
  });
});
