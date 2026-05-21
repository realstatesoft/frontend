describe('User Authentication Flow', () => {
  // Nota: Estas pruebas ahora interactúan con la base de datos real.
  // Se recomienda configurar estas credenciales en cypress.env.json o variables de entorno.

  it('debe mostrar la página de login correctamente', () => {
    cy.visit('/login');
    cy.get('h4.login-title').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('debe mostrar un error con credenciales incorrectas', () => {
    cy.visit('/login');
    
    // Ingresamos datos que sabemos que fallarán en el sistema real
    cy.get('input[name="email"]').type('correo_no_existente_12345@openroof.com');
    cy.get('input[name="password"]').type('PasswordFalso123!');
    cy.get('button[type="submit"]').click();

    // Verificamos que el servidor real (o el frontend tras la respuesta) muestre el error
    // El selector .error-message debe existir según el componente LogIn.jsx
    cy.get('.error-message', { timeout: 10000 }).should('be.visible');
  });

  it('debe iniciar sesión correctamente como ADMIN y redirigir al dashboard de admin', () => {
    const email = Cypress.env('ADMIN_EMAIL'); 
    const password = Cypress.env('ADMIN_PASSWORD');

    // Validar presencia de variables de entorno para evitar errores crípticos
    expect(email, 'Cypress.env("ADMIN_EMAIL") debe estar definido').to.be.a('string').and.not.be.empty;
    expect(password, 'Cypress.env("ADMIN_PASSWORD") debe estar definido').to.be.a('string').and.not.be.empty;

    cy.visit('/login');

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Verificamos la redirección al dashboard de administrador
    cy.url({ timeout: 15000 }).should('include', '/admin/dashboard');
  });

  it('debe iniciar sesión correctamente como AGENTE y redirigir al dashboard de agente', () => {
    const email = Cypress.env('AGENTE_EMAIL'); 
    const password = Cypress.env('AGENTE_PASSWORD');

    // Validar presencia de variables de entorno para evitar errores crípticos
    expect(email, 'Cypress.env("AGENTE_EMAIL") debe estar definido').to.be.a('string').and.not.be.empty;
    expect(password, 'Cypress.env("AGENTE_PASSWORD") debe estar definido').to.be.a('string').and.not.be.empty;

    cy.visit('/login');

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // El agente es redirigido a la home, debemos navegar manualmente al dashboard
    cy.url({ timeout: 15000 }).should('not.include', '/login');
    
    // Abrimos el menú de usuario (usando el selector del Navbar de la home)
    cy.get('.profile-avatar-btn', { timeout: 15000 }).should('be.visible').click();

    // Hacemos clic en "Dashboard"
    cy.contains('.profile-dropdown-item', /Dashboard/i).click();

    // Verificamos la redirección al dashboard de agente
    cy.url({ timeout: 15000 }).should('include', '/agent/dashboard');
  });
});


