import React, { useState } from 'react';
import { Container, Card, Form, Button, Stack, InputGroup } from 'react-bootstrap';
import { Envelope, Lock, Eye, EyeSlash, Google, Facebook } from 'react-bootstrap-icons';
import logo from '../assets/Logotipo.png';
// Importamos el hook de autenticación y el hook de navegación
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LogIn() {
    const primaryColor = '#2563eb';
    const inputBgColor = '#f8f9fa';
    const iconColor = '#6c757d';

    const { login } = useAuth(); 
    const navigate = useNavigate(); // Para redirigir al usuario tras iniciar sesión

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Estado para guardar el correo y la contraseña
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // 2. Función para actualizar el estado cuando el usuario escribe
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 3. Función que se ejecuta al enviar el formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Hacemos la petición POST al backend de Spring Boot
            const response = await api.post("/auth/login", formData);

            const result = response.data;

            // guardar el AccessToken en las cookies
            if (result.data) {
                login(result.data);

                navigate('/properties'); // Redirige al usuario a la página de propiedades después de iniciar sesión
            }

        } catch (error) {
            console.error("Error en login:", error);
            alert(error.response?.data?.message || error.message || "Correo o contraseña incorrectos");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="bg-light min-vh-100 d-flex flex-column align-items-center justify-content-center py-4"
            style={{ fontFamily: '"Poppins", sans-serif', overflow: 'hidden' }}
        >
            <Container style={{ maxWidth: 500 }}>
                <Card className="text-start border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '1rem' }}>

                    {/* Logo responsivo y centrado */}
                    <div className="mb-4">
                        <img
                            src={logo}
                            alt="Logo"
                            className="mx-auto d-block img-fluid"
                            style={{ width: '100%', maxWidth: '120px', objectFit: 'contain' }}
                        />
                    </div>

                    <h4 className="text-center fw-bold mb-2">
                        Inicia sesión en tu cuenta
                    </h4>
                    <p className="text-center text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                        ¿Eres nuevo por aquí?{' '}
                        <a href="/signup" className="text-decoration-none fw-bold" style={{ color: primaryColor }}>
                            Regístrate aquí
                        </a>
                    </p>

                    {/* Conectamos el formulario con handleSubmit */}
                    <Form onSubmit={handleSubmit}>

                        {/* Correo Electrónico */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                Correo Electrónico
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{ backgroundColor: inputBgColor, border: 'none', borderRadius: '0.5rem 0 0 0.5rem', paddingRight: 0 }}>
                                    <Envelope color={iconColor} size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="tu@email.com"
                                    style={{ backgroundColor: inputBgColor, border: 'none', padding: '0.7rem 0.7rem 0.7rem 10px', borderRadius: '0 0.5rem 0.5rem 0', boxShadow: 'none' }}
                                    required
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* Contraseña */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                Contraseña
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{ backgroundColor: inputBgColor, border: 'none', borderRadius: '0.5rem 0 0 0.5rem', paddingRight: 0 }}>
                                    <Lock color={iconColor} size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    style={{ backgroundColor: inputBgColor, border: 'none', padding: '0.7rem 0.7rem 0.7rem 10px', boxShadow: 'none' }}
                                    required
                                />
                                <InputGroup.Text
                                    style={{ backgroundColor: inputBgColor, border: 'none', borderRadius: '0 0.5rem 0.5rem 0', cursor: 'pointer' }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeSlash color={iconColor} size={18} /> : <Eye color={iconColor} size={18} />}
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        {/* Recordarme y Olvidaste tu contraseña */}
                        <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                            <Form.Check
                                type="checkbox"
                                id="recordarme"
                                label={<span className="text-muted fw-medium" style={{ fontSize: '0.85rem' }}>Recuérdame</span>}
                                className="mb-0"
                            />
                            <a href="/forgot-password" className="text-decoration-none fw-bold" style={{ fontSize: '0.85rem', color: primaryColor }}>
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        {/* Botón Principal tipo Submit */}
                        <div className="d-grid">
                            <Button variant="primary" type="submit" disabled={isSubmitting} style={{ borderRadius: '0.75rem', padding: '0.8rem' }} className="fw-bold">
                                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
                            </Button>
                        </div>

                    </Form>

                    {/* Divisor */}
                    <div className="d-flex align-items-center my-4">
                        <hr className="flex-grow-1 m-0" style={{ borderColor: '#e0e0e0' }} />
                        <span className="mx-3 text-muted" style={{ fontSize: '0.8rem' }}>O continúa con</span>
                        <hr className="flex-grow-1 m-0" style={{ borderColor: '#e0e0e0' }} />
                    </div>

                    {/* Botones Sociales */}
                    <Stack direction="horizontal" gap={3} className="justify-content-center">
                        <Button variant="outline-secondary" className="d-flex justify-content-center align-items-center w-50 py-2 bg-white" style={{ borderRadius: '0.5rem', color: '#333', borderColor: '#e0e0e0', fontSize: '0.9rem' }}>
                            <Google className="me-2 text-danger" size={18} />
                            <span className="fw-bold">Google</span>
                        </Button>
                        <Button variant="outline-secondary" className="d-flex justify-content-center align-items-center w-50 py-2 bg-white" style={{ borderRadius: '0.5rem', color: '#333', borderColor: '#e0e0e0', fontSize: '0.9rem' }}>
                            <Facebook className="me-2 text-primary" size={18} />
                            <span className="fw-bold">Facebook</span>
                        </Button>
                    </Stack>

                </Card>
            </Container>
        </div>
    );
}