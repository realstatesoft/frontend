describe('Admin Dashboard Access', () => {
  beforeEach(() => {
    // Establecer un viewport de escritorio para evitar que el sidebar responsivo se oculte
    cy.viewport(1280, 800);

    // Obtener credenciales del entorno Cypress
    const email = Cypress.env('ADMIN_EMAIL');
    const password = Cypress.env('ADMIN_PASSWORD');
    
    // Loguear usando el custom command
    cy.login(email, password);

    // Asegurarse de que el login haya finalizado y redirigido al dashboard
    cy.url({ timeout: 15000 }).should('include', '/admin/dashboard');
  });

  it('debe loguearse como admin y acceder al dashboard', () => {
    // Validar el título del Hero del Dashboard o del panel
    cy.get('h1').should('be.visible');
  });

  it('debe mostrar el sidebar/menú con las opciones principales de navegación', () => {
    // Validar que el Sidebar lateral esté presente
    cy.get('aside').should('be.visible');
    
    // Validar que los enlaces clave de administración estén disponibles
    cy.get('a[href="/admin/approval"]').should('be.visible');
    cy.get('a[href="/admin/payments"]').should('be.visible');
  });

  it('debe poder navegar a la página de aprobación de propiedades', () => {
    // Navegar haciendo clic en el enlace de aprobación en el Sidebar
    cy.get('a[href="/admin/approval"]').click({ force: true });

    // Validar redirección y render de la página de aprobaciones
    cy.url().should('include', '/admin/approval');
    cy.get('h1').should('be.visible');
  });
});
