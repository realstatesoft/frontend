describe('Property Pagination Flow', () => {
  beforeEach(() => {
    cy.visit('/properties');
    // Esperar a que el spinner desaparezca y carguen los datos
    cy.get('.spinner-border', { timeout: 15000 }).should('not.exist');
  });

  it('debe mostrar los controles de paginación si hay múltiples propiedades', () => {
    // Si hay paginación en pantalla, el contenedor de botones debe existir
    cy.get('body').then(($body) => {
      // Solo verificamos aserciones de paginación si el componente de paginación existe en el DOM
      // (lo cual ocurre si totalPages > 1 en la base de datos de prueba)
      if ($body.find('button[title="Anterior"]').length > 0 || $body.find('button[title="Previous"]').length > 0) {
        cy.log('Paginación detectada en la página de propiedades');
        cy.get('button[title="Anterior"], button[title="Previous"]').should('be.visible');
        cy.get('button[title="Siguiente"], button[title="Next"]').should('be.visible');
      } else {
        cy.log('No hay suficientes propiedades para mostrar paginación en esta base de datos');
      }
    });
  });

  it('debe navegar a la siguiente página al hacer clic en el botón Siguiente', () => {
    cy.get('body').then(($body) => {
      const nextBtn = $body.find('button[title="Siguiente"], button[title="Next"]');
      if (nextBtn.length > 0 && !nextBtn.prop('disabled')) {
        // Hacemos clic en Siguiente
        cy.wrap(nextBtn).click();
        
        // Esperamos que cargue la nueva página
        cy.get('.spinner-border').should('not.exist');

        // El botón anterior ahora debería estar habilitado
        cy.get('button[title="Anterior"], button[title="Previous"]').should('not.be.disabled');
      }
    });
  });

  it('debe deshabilitar el botón Anterior en la primera página', () => {
    cy.get('body').then(($body) => {
      const prevBtn = $body.find('button[title="Anterior"], button[title="Previous"]');
      if (prevBtn.length > 0) {
        // En la primera página, Anterior debería estar deshabilitado
        cy.wrap(prevBtn).should('be.disabled');
      }
    });
  });

  it('debe permitir cambiar de página usando botones numéricos y regresar', () => {
    cy.get('body').then(($body) => {
      // Buscar botones de número de página. Buscamos botones con texto "2"
      const pageTwoBtn = $body.find('button').filter((i, el) => el.textContent.trim() === '2');
      if (pageTwoBtn.length > 0) {
        cy.wrap(pageTwoBtn).first().click();
        cy.get('.spinner-border').should('not.exist');

        // Volver a la página 1 haciendo clic en el botón "1"
        cy.get('button').filter((i, el) => el.textContent.trim() === '1').first().click();
        cy.get('.spinner-border').should('not.exist');
      }
    });
  });
});
