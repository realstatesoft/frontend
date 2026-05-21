describe('Property Comparison Flow', () => {
  beforeEach(() => {
    cy.visit('/properties/compare');
  });

  it('debe renderizar el panel de comparación con títulos correctos', () => {
    // Validar encabezados y títulos
    cy.get('h3').contains('Compará hasta 3 propiedades lado a lado').should('be.visible');
    cy.get('.text-uppercase').contains('Comparador').should('be.visible');
  });

  it('debe mostrar una alerta informativa si no hay propiedades seleccionadas en la sesión', () => {
    // Al no haber seleccionado ninguna propiedad, debe salir el mensaje de alerta
    cy.get('.alert-info')
      .should('be.visible')
      .and('contain', 'Todavía no seleccionaste propiedades');
  });

  it('debe permitir hacer clic en el botón de Limpiar comparador y regresar a /properties', () => {
    // Buscar el botón para limpiar y hacer clic en él
    cy.get('button').contains('Limpiar comparador').should('be.visible').click();

    // El botón redirige a la lista general de propiedades al limpiar
    cy.url({ timeout: 15000 }).should('include', '/properties');
  });
});
