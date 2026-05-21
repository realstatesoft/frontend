describe('Agents Page Flow', () => {
  it('debe renderizar la página de agentes con todas sus secciones', () => {
    cy.visit('/agents');

    // Validar navbar y footer
    cy.get('.navbar').should('be.visible');
    cy.get('footer').should('exist');

    // Validar Hero
    cy.get('h1').contains('Crea tu perfil de agente inmobiliario').should('be.visible');
    cy.get('button').contains('Regístrate Ahora!').should('be.visible');

    // Validar pasos (Steps)
    cy.get('h5').contains('Regístrate').should('be.visible');
    cy.get('h5').contains('Configura tu perfil').should('be.visible');
    cy.get('h5').contains('Recibe leads').should('be.visible');

    // Validar ¿Por qué? (Why)
    cy.get('h3').contains('Por qué trabajamos con agentes').should('be.visible');
    cy.get('h2').contains('60%').should('be.visible');
    cy.get('h2').contains('81%').should('be.visible');

    // Validar Testimonios (Testimonials)
    cy.get('h2').contains('Testimonios').should('be.visible');
  });

  it('debe navegar a la página de agentes desde el Navbar', () => {
    cy.visit('/');

    // Clic en Agentes en el navbar
    cy.get('.navbar .nav-link').contains(/Agentes/i).click();

    // Validar redirección a /agents
    cy.url().should('include', '/agents');
    cy.get('h1').contains('Crea tu perfil de agente inmobiliario').should('be.visible');
  });
});
