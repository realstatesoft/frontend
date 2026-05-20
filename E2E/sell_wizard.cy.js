describe('Sell Wizard Flow', () => {
  it('debe renderizar el wizard con barra de progreso', () => {
    cy.visit('/sell');
    
    // Validar el header del asistente
    cy.get('.sell-wizard__progress-info').should('contain', 'tu propiedad');
    cy.get('.sell-wizard__progress-info').should('contain', 'Paso 1 de 12');
    cy.get('.sell-wizard__progress-fill').should('exist');
    
    // Título inicial
    cy.get('.sell-wizard__title').should('contain', 'Contanos sobre tu propiedad');
  });

  it('debe completar el paso 1 y avanzar al paso 2', () => {
    cy.visit('/sell');
    
    // Seleccionar tipo de propiedad "Casa"
    cy.get('.sell-wizard__grid').contains('Casa').click();

    // Llenar la dirección de la propiedad
    cy.get('input.sell-wizard__input').type('Avenida Irrazábal 123');

    // Hacer clic en el mapa de Leaflet para fijar geolocalización
    cy.get('.leaflet-container').click();

    // Continuar al paso 2
    cy.get('button.sell-wizard__btn--next').contains('Continuar').click();

    // Validar que avanzamos al Paso 2
    cy.get('.sell-wizard__progress-info').should('contain', 'Paso 2 de 12');
    cy.get('.sell-wizard__title').should('contain', 'Antes de empezar');
  });
});
