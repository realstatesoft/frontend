import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FIGMA_COLORS } from '../constants/clientConstants';

const NotFoundPage = () => {
  return (
    <div 
      className="d-flex align-items-center justify-content-center min-vh-100 bg-light" 
      style={{ fontFamily: '"Poppins", sans-serif' }}
    >
      <Container className="text-center p-5 bg-white shadow-sm" style={{ borderRadius: '2rem', maxWidth: '600px' }}>
        <h1 
          className="display-1 fw-bold mb-4" 
          style={{ color: FIGMA_COLORS.deepDark, opacity: 0.1, fontSize: '8rem' }}
        >
          404
        </h1>
        <h2 className="fw-bold mb-3" style={{ color: FIGMA_COLORS.deepDark }}>Página no encontrada</h2>
        <p className="text-muted mb-5 px-md-5">
          La página o el cliente que buscas no existe, no está disponible o no tienes permisos suficientes para verlo.
        </p>
        <Button 
          as={Link} 
          to="/" 
          variant="primary" 
          className="rounded-pill px-5 py-3 border-0 shadow-sm"
          style={{ backgroundColor: '#0D6EFD', fontWeight: '600' }}
        >
          Volver al inicio
        </Button>
      </Container>
    </div>
  );
};

export default NotFoundPage;
