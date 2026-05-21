describe('Sell Wizard Step-by-Step Flow', () => {
  const email = Cypress.env('AGENTE_EMAIL');
  const password = Cypress.env('AGENTE_PASSWORD');

  beforeEach(() => {
    cy.login(email, password);
    cy.url({ timeout: 15000 }).should('not.include', '/login');
    cy.visit('/sell');
  });

  it('debe completar los pasos 1, 2, 3 y permitir navegar de regreso con el botón Atrás', () => {
    // --- Paso 1 ---
    cy.get('.sell-wizard__progress-info').should('contain', 'Paso 1 de 12');
    cy.get('.sell-wizard__grid').contains('Casa').click();
    cy.get('input.sell-wizard__input').type('Avenida Santa Teresa 456');
    cy.get('.leaflet-container').click();
    cy.get('button.sell-wizard__btn--next').contains('Continuar').click();

    // --- Paso 2 ---
    cy.get('.sell-wizard__progress-info', { timeout: 10000 }).should('contain', 'Paso 2 de 12');
    cy.get('.sell-wizard__title').should('contain', 'Antes de empezar');
    
    // Seleccionar opción
    cy.get('.sell-wizard__option').contains('Ninguna de estas aplica').click();
    cy.get('button.sell-wizard__btn--next').contains('Continuar').click();

    // --- Paso 3 ---
    cy.get('.sell-wizard__progress-info', { timeout: 10000 }).should('contain', 'Paso 3 de 12');
    cy.get('.sell-wizard__title').should('contain', '¿Cuándo te gustaría');
    
    // Seleccionar opción
    cy.get('.sell-wizard__card').contains('Lo antes posible').click();
    cy.get('button.sell-wizard__btn--next').contains('Continuar').click();

    // --- Paso 4 ---
    cy.get('.sell-wizard__progress-info', { timeout: 10000 }).should('contain', 'Paso 4 de 12');
    cy.get('.sell-wizard__title').should('contain', 'Revisá los detalles de tu propiedad');
    cy.get('input[placeholder*="450"]').should('be.visible');
    cy.wait(500);

    // --- Navegación Hacia Atrás ---
    // Clic en Atrás para volver al Paso 3
    cy.get('button.sell-wizard__btn--back').should('be.visible').click();
    cy.get('.sell-wizard__progress-info').should('contain', 'Paso 3 de 12');
    cy.get('.sell-wizard__title').should('contain', '¿Cuándo te gustaría');
    cy.wait(500);

    // Clic en Atrás para volver al Paso 2
    cy.get('button.sell-wizard__btn--back').should('be.visible').click();
    cy.get('.sell-wizard__progress-info').should('contain', 'Paso 2 de 12');
    cy.get('.sell-wizard__title').should('contain', 'Antes de empezar');
  });
});
