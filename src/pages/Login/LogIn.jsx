import React, { useState } from 'react';
import { Container, Card, Form, Button, Stack, InputGroup } from 'react-bootstrap';
import { Envelope, Lock, Eye, EyeSlash, Google, Facebook } from 'react-bootstrap-icons';
import logo from '../../assets/Logotipo.png';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import './Login.scss'; 

export default function LogIn() {
    const { login } = useAuth(); 
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Prioridad: 1. location.state.from (SPA) 2. query param "redirect" (Interceptor) 3. "/"
    const isValidRedirect = (url) => {
        if (typeof url !== 'string') return false;
        const path = url.split(/[?#]/)[0];
        return path.startsWith("/") && !path.startsWith("//");
    };

    let redirectParam = searchParams.get("redirect");
    if (!isValidRedirect(redirectParam)) {
        redirectParam = null;
    }

    let fromState = location.state?.from;
    if (fromState && typeof fromState === 'object') {
        fromState = `${fromState.pathname || ''}${fromState.search || ''}${fromState.hash || ''}`;
    }
    
    if (!isValidRedirect(fromState)) {
        fromState = null;
    }

    const from = fromState || redirectParam || "/";

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const response = await api.post("/auth/login", formData);
            const result = response.data;

            if (result.data) {
                login(result.data);
                // Redirigir al destino original o al home
                navigate(from, { replace: true });
            } else {
            setErrorMessage("Respuesta inesperada del servidor");
            }

        } catch (error) {
            console.error("Error en login:", error);
            setErrorMessage(error.response?.data?.message || "Error conectando al servidor");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <Container>
                <Card className="login-card">
                    <div className="logo-container">
                        <img
                            src={logo}
                            alt="Logo"
                            className="logo-img"
                        />
                    </div>

                    <h4 className="login-title">
                        Inicia sesión en tu cuenta
                    </h4>
                    <p className="login-subtitle">
                        ¿Eres nuevo por aquí?{' '}
                        <a href="/signup">
                            Regístrate aquí
                        </a>
                    </p>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="form-label">
                                Correo Electrónico
                            </Form.Label>
                            <InputGroup className="input-group-custom">
                                <InputGroup.Text>
                                    <Envelope size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="tu@email.com"
                                    required
                                />
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3 password-group">
                            <Form.Label className="form-label">
                                Contraseña
                            </Form.Label>
                            <InputGroup className="input-group-custom">
                                <InputGroup.Text>
                                    <Lock size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                                <InputGroup.Text
                                    onClick={() => setShowPassword(!showPassword)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword); }}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        <div className="remember-forgot-row">
                            <Form.Check
                                type="checkbox"
                                id="recordarme"
                                label={<span className="remember-checkbox">Recuérdame</span>}
                                className="mb-0"
                            />
                            <a href="/forgot-password" className="forgot-link">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        {errorMessage && (
                            <div
                                className="error-message"
                                role="alert"
                                aria-live="assertive"
                            >
                                {errorMessage}
                            </div>
                        )}

                        <div className="d-grid">
                            <Button 
                                variant="primary" 
                                type="submit" 
                                disabled={isSubmitting}
                                className="submit-button"
                            >
                                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
                            </Button>
                        </div>
                    </Form>

                    <div className="divider-container">
                        <hr />
                        <span>O continúa con</span>
                        <hr />
                    </div>

                    <Stack direction="horizontal" gap={3} className="social-buttons">
                        <Button variant="outline-secondary" className="social-button">
                            <Google className="google-icon" size={18} />
                            <span className="btn-text">Google</span>
                        </Button>
                        <Button variant="outline-secondary" className="social-button">
                            <Facebook className="facebook-icon" size={18} />
                            <span className="btn-text">Facebook</span>
                        </Button>
                    </Stack>
                </Card>
            </Container>
        </div>
    );
}