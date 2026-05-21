describe('Footer Section Validation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('debe renderizar el Footer con todas sus secciones y columnas', () => {
    // Validar visibilidad del contenedor principal del footer
    cy.get('footer').should('be.visible');
    
    // Validar marca/título de OpenRoof en el footer
    cy.get('footer h5').should('contain', 'OpenRoof');
    
    // Validar que existan los enlaces esperados o títulos de sección
    cy.get('footer').should('contain', 'Empresa');
    cy.get('footer').should('contain', 'Propiedades');
  });

  it('debe mostrar la información de contacto correctamente', () => {
    // Buscar información de contacto detallada dentro del footer
    cy.get('footer').within(() => {
      cy.get('li').should('contain', 'Asunción, Paraguay');
      cy.get('li').should('contain', '+595 21 000 000');
      cy.get('li').should('contain', 'info@openroof.com.py');
    });
  });
});
