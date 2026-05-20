describe('User Registration Flow', () => {
  // Generar datos únicos para el registro
  const timestamp = new Date().getTime();
  const testEmail = `cypress_user_${timestamp}@openroof.com`;
  const validPassword = 'TestPassword123!';

  it('debe mostrar el formulario de registro con el stepper en Paso 1', () => {
    cy.visit('/signup');

    // Validar que estamos en la página
    cy.get('.signup-title').should('contain', 'Crea');

    // Validar Stepper (Paso 1 activo)
    cy.get('.signup-stepper__step--active').should('contain', 'Personales');

    // Validar campos del Paso 1
    cy.get('input[name="nombre"]').should('be.visible');
    cy.get('input[name="apellido"]').should('be.visible');
    cy.get('input[name="phone"]').should('be.visible');
  });

  it('debe avanzar del paso 1 al paso 2 correctamente', () => {
    cy.visit('/signup');

    // Llenar datos paso 1
    cy.get('input[name="nombre"]').type('Cypress');
    cy.get('input[name="apellido"]').type('Test');
    cy.get('input[name="phone"]').type('+1234567890');

    // Avanzar
    cy.get('button.signup-btn[type="submit"]').contains(/Siguiente/i).click();

    // Validar campos del Paso 2
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="confirmPassword"]').should('be.visible');
    cy.get('#terminos').should('exist');
  });

  it('debe mostrar error si las contraseñas no coinciden', () => {
    cy.visit('/signup');

    // Paso 1
    cy.get('input[name="nombre"]').type('Cypress');
    cy.get('input[name="apellido"]').type('Test');
    cy.get('button.signup-btn[type="submit"]').click();

    // Paso 2
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('OtraPassword!');
    cy.get('#terminos').check({ force: true });

    cy.get('button.signup-btn[type="submit"]').contains(/Crear cuenta/i).click();

    // Error
    cy.get('.error-message').should('be.visible');
  });

  it('debe mostrar error con email ya registrado', () => {
    cy.visit('/signup');

    // Paso 1
    cy.get('input[name="nombre"]').type('Admin');
    cy.get('input[name="apellido"]').type('User');
    cy.get('button.signup-btn[type="submit"]').click();

    // Paso 2 (Usando un email que probablemente exista)
    const existingEmail = Cypress.env('ADMIN_EMAIL');
    cy.get('input[name="email"]').type(existingEmail);
    cy.get('input[name="password"]').type(validPassword);
    cy.get('input[name="confirmPassword"]').type(validPassword);
    cy.get('#terminos').check({ force: true });

    cy.get('button.signup-btn[type="submit"]').contains(/Crear cuenta/i).click();

    // Validamos que se muestre error porque el email ya existe
    cy.get('.error-message', { timeout: 15000 }).should('be.visible');
  });
});
