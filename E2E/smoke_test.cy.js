describe('Smoke Test', () => {
  it('should load the home page', () => {
    cy.visit('/')
    // Basic check to ensure the page is loading
    cy.get('body').should('be.visible')
  })
})
