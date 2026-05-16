import React, { useState } from 'react';
// Importamos los componentes de React Bootstrap
import { Container, Card, Form, InputGroup } from 'react-bootstrap';
// Asegúrate de tener instalados los íconos: npm install react-bootstrap-icons
import { Envelope, ArrowLeft } from 'react-bootstrap-icons';
import logo from '../assets/Logotipo.png';
import BotonLogin from '../components/loginButton';
import { useTranslation } from 'react-i18next';
import { useFormValidation } from '../hooks/useFormValidation';

const ForgotPassword = () => {
    const { t } = useTranslation('auth');
    const primaryColor = '#2563eb';
    const [email, setEmail] = useState('');
    const { fieldErrors, validate, clearFieldError } = useFormValidation();

    const handleSubmit = (e) => {
        e.preventDefault();
        const valid = validate({
            email: { value: email, label: t('email'), required: true, pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('invalidEmail') || 'Email inválido' } },
        });
        if (!valid) return;
    };

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
                        {t('recoverPassword')}
                    </h4>
                    <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                        {t('forgotPasswordDescription')}
                    </p>

                    {/* Formulario */}
                    <Form onSubmit={handleSubmit} noValidate>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>
                                {t('email')}
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0" style={{ borderRadius: '0.5rem 0 0 0.5rem' }}>
                                    <Envelope color="#6c757d" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    placeholder={t('emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                                    className={`bg-light border-start-0 ps-0 ${fieldErrors.email ? 'field-error' : ''}`}
                                    style={{ padding: '0.7rem', borderRadius: '0 0.5rem 0.5rem 0' }}
                                />
                            </InputGroup>
                            {fieldErrors.email && <div className="field-error-msg">{fieldErrors.email}</div>}
                        </Form.Group>

                        {/* Botón Principal (tu componente con tu color azul) */}
                        <BotonLogin texto={t('recoverPassword')} />
                    </Form>

                    {/* Enlace para volver */}
                    <div className="text-center mt-4">
                        <a
                            href="/"
                            className="text-decoration-none fw-bold text-dark d-inline-flex align-items-center"
                            style={{ fontSize: '0.9rem' }}
                        >
                            <ArrowLeft className="me-2" /> {t('backToLogin')}
                        </a>
                    </div>

                    {/* Divisor */}
                    <hr className="my-4" />

                    {/* Enlace de registro */}
                    <div className="text-center" style={{ fontSize: '0.9rem' }}>
                        <span className="text-muted">{t('noAccount')} </span>
                        <a href="/signup" className="text-decoration-none fw-bold" style={{ color: primaryColor }}>
                            {t('signupLink')}
                        </a>
                    </div>

                </Card>
            </Container>

        </div>
    );
};

export default ForgotPassword;
