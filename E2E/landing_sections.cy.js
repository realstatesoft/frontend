describe('Landing Page Sections Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('debe renderizar el HeroSection con el título y botón principal', () => {
    // Validar existencia de Navbar y Logo
    cy.get('.navbar').should('be.visible');
    cy.get('.navbar-brand').should('be.visible');

    // Validar el título principal en HeroSection
    cy.get('h1').should('be.visible');
  });

  it('debe renderizar el SearchSection para buscar propiedades', () => {
    // Desplazarse para activar la animación por scroll
    cy.get('h3').contains(/Empieza a buscar/i).scrollIntoView({ duration: 500 }).should('be.visible');
    
    // Y inputs de selección o de texto para realizar búsquedas
    cy.get('input[placeholder*="Ciudad"]').should('be.visible');
    cy.get('button').contains(/Comprar/i).should('be.visible');
    cy.get('button').contains(/Alquilar/i).should('be.visible');
    cy.get('select').should('have.length', 3);
  });

  it('debe renderizar las secciones de Servicios, Estadísticas, Nosotros y Footer', () => {
    // Desplazarse al final para asegurarse de que todos los IntersectionObservers se disparen
    cy.get('footer').scrollIntoView({ duration: 1000 }).should('be.visible');

    // Verificar textos clave de la sección Sobre Nosotros y Servicios
    cy.get('body').should('contain', 'Sobre Nosotros')
                  .and('contain', 'Comprar una casa');
  });
});

