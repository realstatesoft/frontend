describe('Login Form Validation Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('debe mostrar errores de validación si se envía el formulario vacío', () => {
    // Intentar hacer submit directo sin completar campos
    cy.get('button[type="submit"]').click();

    // Deben mostrarse los mensajes de error en los campos requeridos
    cy.get('.field-error-msg').should('have.length', 2);
  });

  it('debe mostrar un error si el formato del correo es inválido', () => {
    // Escribir correo sin formato correcto
    cy.get('input[name="email"]').type('correo-invalido-sin-arroba');
    cy.get('input[name="password"]').type('123456');

    // Intentar submit
    cy.get('button[type="submit"]').click();

    // Debe mostrarse el error de formato en el campo de correo
    cy.get('.field-error-msg').should('contain', 'Email' || 'inválido');
  });

  it('debe alternar la visibilidad de la contraseña al hacer clic en el ícono del ojo', () => {
    // Por defecto el tipo de input es password
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');

    // Escribir algo de texto
    cy.get('input[name="password"]').type('MiPasswordSecreto123');

    // Hacer clic en el toggle del input (que tiene rol de botón)
    cy.get('.password-group [role="button"]').click();

    // El tipo de input debe cambiar a text para mostrar la contraseña
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');

    // Hacer clic de nuevo para ocultarla
    cy.get('.password-group [role="button"]').click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
  });

  it('debe mostrar los botones de redes sociales e hipervínculos de registro/recuperación', () => {
    // Botón de Google y Facebook
    cy.get('.social-button').should('have.length', 2);
    cy.get('.social-button').contains('Google').should('be.visible');
    cy.get('.social-button').contains('Facebook').should('be.visible');

    // Enlace de "¿Olvidaste tu contraseña?"
    cy.get('a.forgot-link').should('have.attr', 'href', '/forgot-password');

    // Enlace para registrarse
    cy.get('.login-subtitle a').should('have.attr', 'href', '/signup');
  });
});
