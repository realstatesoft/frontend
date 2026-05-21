describe('Property Map Render Flow', () => {
  beforeEach(() => {
    cy.visit('/properties');
    cy.get('.spinner-border', { timeout: 15000 }).should('not.exist');
  });

  it('debe renderizar el contenedor del mapa de Leaflet en la página de propiedades', () => {
    // Validar el elemento del lienzo (canvas) del mapa
    cy.get('.properties-map-section__canvas').should('exist');

    // Validar la integración del contenedor de Leaflet
    cy.get('.properties-map-section__leaflet').should('exist');
    cy.get('.leaflet-container').should('exist');
  });

  it('debe tener las capas de azulejos (tiles) y controles del mapa cargados', () => {
    // Verificar que los controles de zoom típicos de Leaflet están presentes
    cy.get('.leaflet-control-zoom').should('exist');
    cy.get('.leaflet-control-zoom-in').should('exist');
    cy.get('.leaflet-control-zoom-out').should('exist');

    // Verificar la existencia de la atribución de copyright (OpenStreetMap)
    cy.get('.leaflet-control-attribution').should('exist').and('contain', 'OpenStreetMap');
  });

  it('debe estructurar el diseño en pantalla dividida (split-screen) en vistas de escritorio', () => {
    // El mapa y el grid de resultados se disponen uno al lado del otro
    // Verificamos que el contenedor general tenga la clase bootstrap row
    cy.get('.container-fluid.row').should('exist');
    
    // Verificamos el bloque específico del mapa en desktop (.col-lg-6)
    cy.get('.col-lg-6').should('exist');
  });
});
