describe('Landing Page & Search Flow', () => {
  it('debe renderizar el Hero, Navbar y secciones principales', () => {
    cy.visit('/');
    
    // Validar Navbar
    cy.get('.navbar').should('be.visible');
    
    // Validar Hero section (contiene "Encuentra tu hogar ideal")
    cy.get('h1').should('be.visible');
    
    // Validar SearchSection (contiene h3 "Busca tu propiedad")
    cy.contains('h3', /Busca/i).should('exist');
    
    // Validar que se muestre el Footer
    cy.get('footer').should('exist');
  });

  it('debe navegar a /properties al hacer clic en "Comprar" en el Navbar', () => {
    cy.visit('/');
    
    // Clic en "Comprar" en el Navbar
    cy.get('.navbar .nav-link').contains(/Comprar/i).click();
    
    // Valida redirección a /properties
    cy.url().should('include', '/properties');
    
    // Valida estado
    cy.window().its('history.state.usr').should('deep.include', { saleRent: 'Venta' });
  });

  it('debe buscar propiedades desde el SearchSection del landing', () => {
    cy.visit('/');
    
    // Selecciona pestaña "Alquilar" en SearchSection (dentro de la píldora)
    cy.get('.rounded-pill button').contains(/Alquilar/i).click();
    
    // Selecciona tipo "Casa"
    cy.get('select.form-select').eq(0).select('Casa');
    
    // Selecciona "3" habitaciones
    cy.get('select.form-select').eq(1).select('3');
    
    // Clic en botón de búsqueda
    cy.get('button.btn.text-white').contains(/Buscar/i).click();
    
    // Valida redirección a /properties
    cy.url().should('include', '/properties');
    
    // Esperar a que pase el loading
    cy.get('.spinner-border', { timeout: 15000 }).should('not.exist');
  });
});
