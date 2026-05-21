describe('Property Detail Page Flow', () => {
  beforeEach(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // Ignore only specific known Leaflet errors
      if (err.message && (err.message.includes('_leaflet_pos') || err.message.includes('leaflet'))) {
        return false;
      }
      return true;
    });
  });

  it('debe cargar el detalle de una propiedad con datos reales', () => {
    cy.visit('/properties');
    
    // Esperar a que las tarjetas de propiedad se muestren
    cy.contains('Ver Detalles', { timeout: 15000 }).should('be.visible');

    // Hacer scroll y clic en el botón "Ver Detalles" de la primera propiedad
    cy.contains('Ver Detalles').first().scrollIntoView().click({ force: true });

    // Verifica redirección
    cy.url().should('match', /\/properties\/\d+/);

    // Valida información principal
    cy.get('h1', { timeout: 10000 }).should('be.visible');
    cy.get('.property__price').should('be.visible');
    cy.get('.property__address').should('be.visible');
    
    // Valida imagen principal
    cy.get('.property__main-image').should('be.visible').and('have.attr', 'src');
  });

  it('debe mostrar las pestañas de Descripción, Tours y Características', () => {
    cy.visit('/properties');
    cy.contains('Ver Detalles', { timeout: 15000 }).should('be.visible');
    cy.contains('Ver Detalles').first().scrollIntoView().click({ force: true });
    cy.get('h1', { timeout: 10000 }).should('be.visible');

    // Validar Pestañas
    cy.get('.nav-tabs .nav-link').contains('Descripcion').should('exist');
    cy.get('.nav-tabs .nav-link').contains('Tours y Planos').should('exist');
    cy.get('.nav-tabs .nav-link').contains('Datos y Caracteristicas').should('exist');

    // Interacción con Pestañas
    cy.get('.nav-tabs .nav-link').contains('Tours y Planos').click();
    cy.get('.property__tour-viewport', { timeout: 5000 }).should('exist');

    cy.get('.nav-tabs .nav-link').contains('Datos y Caracteristicas').click();
    cy.get('.property__feature-title', { timeout: 5000 }).should('exist');
  });

  it('debe mostrar la tarjeta de contacto del agente/propietario', () => {
    cy.visit('/properties');
    cy.contains('Ver Detalles', { timeout: 15000 }).should('be.visible');
    cy.contains('Ver Detalles').first().scrollIntoView().click({ force: true });
    cy.get('h1', { timeout: 10000 }).should('be.visible');

    // Validar tarjeta de contacto
    cy.contains('.property-contact-card', /Contacto|Contactar|Enviar|WhatsApp|Email|Agendar/i, { timeout: 15000 })
      .should('exist');
  });

  it('debe mostrar la sección de propiedades similares o su mensaje vacío', () => {
    cy.visit('/properties');
    cy.contains('Ver Detalles', { timeout: 15000 }).should('be.visible');
    cy.contains('Ver Detalles').first().scrollIntoView().click({ force: true });
    cy.get('h1', { timeout: 10000 }).should('be.visible');

    // Título de la sección
    cy.get('h5.property__section-title').contains(/Propiedades similares/i).scrollIntoView().should('be.visible');

    // Validar que se muestre el contenedor de propiedades similares (.summary-card) o el mensaje vacío
    cy.get('body').then(($body) => {
      if ($body.find('.summary-card').length > 0) {
        cy.get('.summary-card').first().should('be.visible');
      } else {
        cy.contains('No se encontraron propiedades similares.').should('be.visible');
      }
    });
  });
});
