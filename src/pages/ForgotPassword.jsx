import React from 'react';
// Importamos los componentes de React Bootstrap
import { Container, Card, Form, InputGroup } from 'react-bootstrap';
// Asegúrate de tener instalados los íconos: npm install react-bootstrap-icons
import { Envelope, ArrowLeft } from 'react-bootstrap-icons';
import logo from '../assets/Logotipo.png';
import BotonLogin from '../components/loginButton';

const ForgotPassword = () => {
    // Color azul principal de tu aplicación
    const primaryColor = '#2563eb';

    return (
        // Contenedor principal centrado y con fondo claro
        <div
            className="bg-light min-vh-100 d-flex flex-column align-items-center justify-content-center py-4"
            style={{ fontFamily: '"Poppins", sans-serif', overflow: 'hidden' }}
        >
            <Container style={{ maxWidth: 450 }}>
                <Card className="border-0 shadow-sm p-4" style={{ borderRadius: '1rem' }}>

                    <div className="text-center mb-3">
                        {/* Logo */}
                        <div className="mb-4">
                            <img
                                src={logo}
                                alt="Logo"
                                className="mx-auto d-block img-fluid"
                                style={{ width: '100%', maxWidth: '120px', objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    {/* Encabezados */}
                    <h4 className="text-center fw-bold mb-3">
                        Recuperar Contraseña
                    </h4>
                    <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                        Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                    </p>

                    {/* Formulario */}
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>
                                Correo electrónico
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0" style={{ borderRadius: '0.5rem 0 0 0.5rem' }}>
                                    <Envelope color="#6c757d" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="bg-light border-start-0 ps-0"
                                    style={{ padding: '0.7rem', borderRadius: '0 0.5rem 0.5rem 0' }}
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* Botón Principal (tu componente con tu color azul) */}
                        <BotonLogin texto="Recuperar Contraseña" />
                    </Form>

                    {/* Enlace para volver */}
                    <div className="text-center mt-4">
                        <a
                            href="/"
                            className="text-decoration-none fw-bold text-dark d-inline-flex align-items-center"
                            style={{ fontSize: '0.9rem' }}
                        >
                            <ArrowLeft className="me-2" /> Volver al inicio de sesión
                        </a>
                    </div>

                    {/* Divisor */}
                    <hr className="my-4" />

                    {/* Enlace de registro */}
                    <div className="text-center" style={{ fontSize: '0.9rem' }}>
                        <span className="text-muted">¿No tienes una cuenta? </span>
                        <a href="/signup" className="text-decoration-none fw-bold" style={{ color: primaryColor }}>
                            Regístrate aquí
                        </a>
                    </div>

                </Card>
            </Container>

        </div>
    );
};

export default ForgotPassword;