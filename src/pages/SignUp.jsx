import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Stack } from 'react-bootstrap';
import logo from '../assets/Logotipo.png';
import BotonRegistrar from '../components/loginButton';

export default function SignUp() {
    const [tipoUsuario, setTipoUsuario] = useState('Comprador');

    return (
        <div 
            className="bg-light min-vh-100 d-flex align-items-center justify-content-center py-4" 
            style={{ fontFamily: '"Poppins", sans-serif' }}
        >
            <Container style={{ maxWidth: 500 }}>
                <Card className="border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '0.75rem' }}>
                    <div className="text-center mb-2">
                        <img
                            src={logo}
                            alt="Logo"
                            style={{ width: '120px', height: 'auto', objectFit: 'contain' }}
                        />
                    </div>

                    <h3 className="text-center fw-bold mb-1" style={{ marginTop: '-10px' }}>
                        Crea tu cuenta
                    </h3>

                    <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                        ¿Ya tienes una cuenta?{' '}
                        <a 
                            href="/login" 
                            className="text-decoration-none fw-medium" 
                            style={{ color: 'var(--bs-primary)' }}
                        >
                            Inicia sesión aquí
                        </a>
                    </p>

                    <Form>
                        {/* Botones de Tipo de Usuario */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold mb-2" style={{ fontSize: '0.9rem' }}>
                                ¿Qué tipo de usuario eres?
                            </Form.Label>
                            <Stack direction="horizontal" gap={3}>
                                <Button
                                    variant="light"
                                    className="w-50 fw-medium"
                                    onClick={() => setTipoUsuario('Comprador')}
                                    style={{
                                        backgroundColor: tipoUsuario === 'Comprador' ? 'rgba(37, 99, 235, 0.1)' : '#fff',
                                        color: tipoUsuario === 'Comprador' ? 'var(--bs-primary)' : 'var(--bs-secondary)',
                                        borderColor: tipoUsuario === 'Comprador' ? 'var(--bs-primary)' : '#ced4da',
                                        borderRadius: '0.75rem'
                                    }}
                                >
                                    Comprador
                                </Button>
                                <Button
                                    variant="light"
                                    className="w-50 fw-medium"
                                    onClick={() => setTipoUsuario('Vendedor')}
                                    style={{
                                        backgroundColor: tipoUsuario === 'Vendedor' ? 'rgba(37, 99, 235, 0.1)' : '#fff',
                                        color: tipoUsuario === 'Vendedor' ? 'var(--bs-primary)' : 'var(--bs-secondary)',
                                        borderColor: tipoUsuario === 'Vendedor' ? 'var(--bs-primary)' : '#ced4da',
                                        borderRadius: '0.75rem'
                                    }}
                                >
                                    Vendedor
                                </Button>
                            </Stack>
                        </Form.Group>

                        {/* Nombre y Apellido */}
                        <Row className="g-3 mb-3">
                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Nombre</Form.Label>
                                    <Form.Control type="text" placeholder="******" style={{ padding: '0.6rem', borderRadius: '0.75rem' }} />
                                </Form.Group>
                            </Col>
                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Apellido</Form.Label>
                                    <Form.Control type="text" placeholder="******" style={{ padding: '0.6rem', borderRadius: '0.75rem' }} />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Correo Electrónico */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Correo Electrónico</Form.Label>
                            <Form.Control type="email" placeholder="tu@email.com" style={{ padding: '0.6rem', borderRadius: '0.75rem' }} />
                        </Form.Group>

                        {/* Teléfono */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Teléfono</Form.Label>
                            <Form.Control type="tel" placeholder="+595 995 789 456" style={{ padding: '0.6rem', borderRadius: '0.75rem' }} />
                        </Form.Group>

                        {/* Contraseña */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Contraseña</Form.Label>
                            <Form.Control type="password" placeholder="******" style={{ padding: '0.6rem', borderRadius: '0.75rem' }} />
                        </Form.Group>

                        {/* Confirmar Contraseña */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Confirmar contraseña</Form.Label>
                            <Form.Control type="password" placeholder="******" style={{ padding: '0.6rem', borderRadius: '0.75rem' }} />
                        </Form.Group>

                        {/* Checkbox de Términos */}
                        <Form.Group className="mb-4 d-flex align-items-center">
                            <Form.Check 
                                type="checkbox" 
                                id="terminos" 
                                className="me-2 mt-0"
                            />
                            <Form.Label htmlFor="terminos" className="text-dark mb-0" style={{ fontSize: '0.85rem' }}>
                                Acepto los{' '}
                                <a href="#" className="text-decoration-none fw-medium" style={{ color: 'var(--bs-primary)' }}>términos y condiciones</a> 
                                {' '}y la{' '}
                                <a href="#" className="text-decoration-none fw-medium" style={{ color: 'var(--bs-primary)' }}>política de privacidad</a>
                            </Form.Label>
                        </Form.Group>

                        {/* Botón Principal */}
                        <BotonRegistrar texto="Registrarse"/>
                    </Form>

                    {/* Divisor */}
                    <div className="d-flex align-items-center my-4">
                        <hr className="flex-grow-1 m-0" style={{ borderColor: '#ddd' }} />
                        <span className="mx-3 text-muted" style={{ fontSize: '0.85rem' }}>O regístrate con</span>
                        <hr className="flex-grow-1 m-0" style={{ borderColor: '#ddd' }} />
                    </div>

                    {/* Botones Sociales */}
                    <Stack direction="horizontal" gap={3} className="justify-content-center">
                        <Button 
                            variant="outline-secondary" 
                            className="d-flex align-items-center px-4" 
                            style={{ borderRadius: '0.75rem', color: '#555', borderColor: '#ddd' }}
                        >
                            <i className="bi bi-google me-2" style={{ fontSize: '1.1rem' }}></i>
                            <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Google</span>
                        </Button>

                        <Button 
                            variant="outline-secondary" 
                            className="d-flex align-items-center px-4" 
                            style={{ borderRadius: '0.75rem', color: '#555', borderColor: '#ddd' }}
                        >
                            <i className="bi bi-facebook me-2" style={{ fontSize: '1.1rem' }}></i>
                            <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Facebook</span>
                        </Button>
                    </Stack>

                </Card>
            </Container>
        </div>
    );
}