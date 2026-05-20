describe('Agent Registration Flow', () => {
  const timestamp = new Date().getTime();
  const testEmail = `cypress_agent_${timestamp}@openroof.com`;

  it('debe renderizar el formulario de registro de agente', () => {
    cy.visit('/signup/agent');
    
    // Validar título de registro de agente
    cy.get('.signup-title').should('contain', 'Agente');
    
    // Validar que el Stepper del paso 1 esté activo
    cy.get('.signup-stepper__step--active').should('be.visible');
    
    // Validar campos del Paso 1
    cy.get('input[name="nombre"]').should('be.visible');
    cy.get('input[name="apellido"]').should('be.visible');
    cy.get('input[name="phone"]').should('be.visible');
  });

  it('debe avanzar del paso 1 al paso 2 correctamente', () => {
    cy.visit('/signup/agent');

    // Llenar datos del paso 1
    cy.get('input[name="nombre"]').type('Agente');
    cy.get('input[name="apellido"]').type('Cypress');
    cy.get('input[name="phone"]').type('1234567890');
    
    // Avanzar al paso 2
    cy.get('button.signup-btn[type="submit"]').contains(/Siguiente/i).click();

    // Validar campos del Paso 2
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="confirmPassword"]').should('be.visible');
    cy.get('#terminos').should('exist');
  });

  it('debe mostrar error con contraseñas que no coinciden', () => {
    cy.visit('/signup/agent');

    // Llenar paso 1
    cy.get('input[name="nombre"]').type('Agente');
    cy.get('input[name="apellido"]').type('Cypress');
    cy.get('input[name="phone"]').type('1234567890');
    cy.get('button.signup-btn[type="submit"]').contains(/Siguiente/i).click();

    // Llenar paso 2 con contraseñas distintas
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('OtraPassword!');
    cy.get('#terminos').check({ force: true });
    
    // Intentar registrar
    cy.get('button.signup-btn[type="submit"]').click();

    // Validar que se muestre el mensaje de error por discrepancia de contraseñas
    cy.get('.error-message').should('be.visible');
  });
});
