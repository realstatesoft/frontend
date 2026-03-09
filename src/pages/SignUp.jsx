import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Stack } from 'react-bootstrap';
import logo from '../assets/Logotipo.png';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
    const navigate = useNavigate();
    const { register } = useAuth(); // Obtenemos la función de registro del contexto

    const [tipoUsuario, setTipoUsuario] = useState('Comprador');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        terminos: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        //Validaciones básicas locales
        if (formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }
        if (!formData.terminos) {
            alert("Debes aceptar los términos y condiciones");
            return;
        }

        setIsSubmitting(true);
        try {

            const dataParaBackend = {
                name: `${formData.nombre} ${formData.apellido}`.trim(),
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: tipoUsuario === 'Comprador' ? 'BUYER' : 'SELLER'
            };

            //Enviamos al backend
            await register(dataParaBackend);

            alert("¡Registro exitoso!");
            navigate('/'); //Redirigimos a la página principal
            console.log("Usuario registrado:", dataParaBackend.email);

        } catch (error) {
            console.error("Error en el registro:", error);
            alert("Hubo un error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="bg-light min-vh-100 d-flex align-items-center justify-content-center py-4"
            style={{ fontFamily: '"Poppins", sans-serif' }}
        >
            <Container style={{ maxWidth: 500 }}>
                <Card className="border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '0.75rem' }}>
                    <div className="text-center mb-2">
                        <div className="mb-4">
                            <img
                                src={logo}
                                alt="Logo"
                                className="mx-auto d-block img-fluid"
                                style={{ width: '100%', maxWidth: '120px', objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    <h3 className="text-center fw-bold mb-1" style={{ marginTop: '-10px' }}>
                        Crea tu cuenta
                    </h3>

                    <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                        ¿Ya tienes una cuenta?{' '}
                        <a href="/login" className="text-decoration-none fw-medium" style={{ color: 'var(--bs-primary)' }}>
                            Inicia sesión aquí
                        </a>
                    </p>

                    <Form onSubmit={handleSubmit}>
                        {/* Tipo de Usuario */}
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
                                    <Form.Control
                                        type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                                        placeholder="Ej: Ayumu" style={{ padding: '0.6rem', borderRadius: '0.75rem' }} required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Apellido</Form.Label>
                                    <Form.Control
                                        type="text" name="apellido" value={formData.apellido} onChange={handleChange}
                                        placeholder="Apellido" style={{ padding: '0.6rem', borderRadius: '0.75rem' }} required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Correo */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Correo Electrónico</Form.Label>
                            <Form.Control
                                type="email" name="email" value={formData.email} onChange={handleChange}
                                placeholder="tu@email.com" style={{ padding: '0.6rem', borderRadius: '0.75rem' }} required
                            />
                        </Form.Group>

                        {/* Teléfono */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Teléfono</Form.Label>
                            <Form.Control
                                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                placeholder="+595 9..." style={{ padding: '0.6rem', borderRadius: '0.75rem' }}
                            />
                        </Form.Group>

                        {/* Contraseña */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Contraseña</Form.Label>
                            <Form.Control
                                type="password" name="password" value={formData.password} onChange={handleChange}
                                placeholder="Min. 8 caracteres" style={{ padding: '0.6rem', borderRadius: '0.75rem' }} required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Confirmar contraseña</Form.Label>
                            <Form.Control
                                type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                                placeholder="Repite tu contraseña" style={{ padding: '0.6rem', borderRadius: '0.75rem' }} required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4 d-flex align-items-center">
                            <Form.Check
                                type="checkbox" id="terminos" name="terminos" checked={formData.terminos} onChange={handleChange}
                                className="me-2 mt-0" required
                            />
                            <Form.Label htmlFor="terminos" className="text-dark mb-0" style={{ fontSize: '0.85rem' }}>
                                Acepto los <a href="#" className="text-decoration-none fw-medium">términos y condiciones</a>
                            </Form.Label>
                        </Form.Group>

                        <div className="d-grid">
                            <Button variant="primary" type="submit" disabled={isSubmitting} style={{ borderRadius: '0.75rem', padding: '0.8rem' }} className="fw-bold">
                                {isSubmitting ? 'Registrando...' : 'Registrarse'}
                            </Button>
                        </div>
                    </Form>

                    <div className="d-flex align-items-center my-4">
                        <hr className="flex-grow-1 m-0" style={{ borderColor: '#ddd' }} />
                        <span className="mx-3 text-muted" style={{ fontSize: '0.85rem' }}>O regístrate con</span>
                        <hr className="flex-grow-1 m-0" style={{ borderColor: '#ddd' }} />
                    </div>

                    <Stack direction="horizontal" gap={3} className="justify-content-center">
                        <Button variant="outline-secondary" className="d-flex align-items-center px-4" style={{ borderRadius: '0.75rem' }}>
                            <i className="bi bi-google me-2"></i> Google
                        </Button>
                        <Button variant="outline-secondary" className="d-flex align-items-center px-4" style={{ borderRadius: '0.75rem' }}>
                            <i className="bi bi-facebook me-2"></i> Facebook
                        </Button>
                    </Stack>
                </Card>
            </Container>
        </div>
    );
}