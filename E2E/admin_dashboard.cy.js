describe('Admin Dashboard Access', () => {
  beforeEach(() => {
    // Obtener credenciales del entorno Cypress o usar defaults
    const email = Cypress.env('ADMIN_EMAIL');
    const password = Cypress.env('ADMIN_PASSWORD');

    // Loguear usando el custom command
    cy.login(email, password);
  });

  it('debe loguearse como admin y acceder al dashboard', () => {
    // Tras el login exitoso, debe redirigir al panel de administración
    cy.url({ timeout: 15000 }).should('include', '/admin/dashboard');

    // Validar el título del Hero del Dashboard
    cy.get('h1').should('be.visible');
  });

  it('debe mostrar el sidebar/menú con las opciones principales de navegación', () => {
    cy.visit('/admin/dashboard');

    // Validar que el Sidebar lateral esté presente
    cy.get('aside').should('be.visible');

    // Validar que los enlaces clave de administración estén disponibles
    cy.get('a[href="/admin/approval"]').should('be.visible');
    cy.get('a[href="/admin/payments"]').should('be.visible');
  });

  it('debe poder navegar a la página de aprobación de propiedades', () => {
    cy.visit('/admin/dashboard');

    // Navegar haciendo clic en el enlace de aprobación en el Sidebar
    cy.get('a[href="/admin/approval"]').click();

    // Validar redirección y render de la página de aprobaciones
    cy.url().should('include', '/admin/approval');
    cy.get('h1').should('be.visible');
  });
});
