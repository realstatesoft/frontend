import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Stack, InputGroup } from 'react-bootstrap';
import { Envelope, Eye, EyeSlash, Facebook, Google, Lock, Person, Telephone } from 'react-bootstrap-icons';
import logo from '../assets/Logotipo.png';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IoCheckmark } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import './SignUp.scss';

export default function AgentSignUp() {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const { t } = useTranslation('auth');

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const nextStep = () => {
    setErrorMessage('');
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setErrorMessage('');
    setCurrentStep(prev => prev - 1);
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    nextStep();
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(t('passwordMismatch'));
      return;
    }
    if (!formData.terminos) {
      setErrorMessage(t('termsRequired'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const dataParaBackend = {
        name: `${formData.nombre} ${formData.apellido}`.trim(),
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'AGENT'
      };

      const result = await register(dataParaBackend);

      // If backend returned tokens, AuthContext.register already called login().
      // Redirect to agent dashboard.
      if (result?.data?.accessToken) {
        navigate('/agent/dashboard');
      } else {
        // No tokens returned – redirect to login with a success flag.
        navigate('/login', { state: { agentRegistered: true } });
      }
    } catch (error) {
      setErrorMessage(error.message || t('agentRegistrationError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Stepper ──────────────────────────────────────────────────────────────

  const steps = [
    { num: 1, label: t('signupStepPersonal') },
    { num: 2, label: t('signupStepAccount') }
  ];

  const renderStepper = () => (
    <div className="signup-stepper mb-4">
      {steps.map((step) => {
        const isActive = currentStep === step.num;
        const isDone = currentStep > step.num;
        return (
          <div key={step.num} className="signup-stepper__item">
            <div className={`signup-stepper__step${isDone ? ' signup-stepper__step--done' : ''}${isActive ? ' signup-stepper__step--active' : ''}`}>
              <div className="signup-stepper__circle">
                {isDone ? <IoCheckmark /> : step.num}
              </div>
              <span className="signup-stepper__label">{step.label}</span>
            </div>
            {step.num < 2 && <div className="signup-stepper__line" />}
          </div>
        );
      })}
    </div>
  );

  // ── Steps ─────────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <Form onSubmit={handleStep1Submit}>
      <Row className="g-3 mb-3">
        <Col xs={6}>
          <Form.Group>
            <Form.Label className="form-label">{t('firstName')}</Form.Label>
            <InputGroup className="input-group-custom">
              <InputGroup.Text><Person size={18} /></InputGroup.Text>
              <Form.Control
                type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                placeholder={t('firstNamePlaceholder')} required
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col xs={6}>
          <Form.Group>
            <Form.Label className="form-label">{t('lastName')}</Form.Label>
            <InputGroup className="input-group-custom">
              <InputGroup.Text><Person size={18} /></InputGroup.Text>
              <Form.Control
                type="text" name="apellido" value={formData.apellido} onChange={handleChange}
                placeholder={t('lastNamePlaceholder')} required
              />
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">{t('phone')}</Form.Label>
        <InputGroup className="input-group-custom">
          <InputGroup.Text><Telephone size={18} /></InputGroup.Text>
          <Form.Control
            type="tel" name="phone" value={formData.phone} onChange={handleChange}
            placeholder={t('phonePlaceholder')} required
          />
        </InputGroup>
      </Form.Group>
      <div className="d-grid">
        <Button variant="primary" type="submit" className="signup-btn">
          {t('nextStep')}
        </Button>
      </div>
    </Form>
  );

  const renderStep2 = () => (
    <Form onSubmit={handleStep2Submit}>
      <Form.Group className="mb-3">
        <Form.Label className="form-label">{t('email')}</Form.Label>
        <InputGroup className="input-group-custom">
          <InputGroup.Text><Envelope size={18} /></InputGroup.Text>
          <Form.Control
            type="email" name="email" value={formData.email} onChange={handleChange}
            placeholder={t('emailPlaceholder')} required
          />
        </InputGroup>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="form-label">{t('password')}</Form.Label>
        <InputGroup className="input-group-custom">
          <InputGroup.Text><Lock size={18} /></InputGroup.Text>
          <Form.Control
            type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
            onChange={handleChange} placeholder={t('passwordPlaceholder')} required
          />
          <InputGroup.Text
            onClick={() => setShowPassword(!showPassword)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword); }}
            role="button" tabIndex={0}
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
          >
            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </InputGroup.Text>
        </InputGroup>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="form-label">{t('confirmPassword')}</Form.Label>
        <InputGroup className="input-group-custom">
          <InputGroup.Text><Lock size={18} /></InputGroup.Text>
          <Form.Control
            type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
            value={formData.confirmPassword} onChange={handleChange}
            placeholder={t('confirmPasswordPlaceholder')} required
          />
          <InputGroup.Text
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowConfirmPassword(!showConfirmPassword); }}
            role="button" tabIndex={0}
            aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}
          >
            {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </InputGroup.Text>
        </InputGroup>
      </Form.Group>
      <Form.Group className="mb-4 d-flex align-items-center">
        <Form.Check
          type="checkbox" id="terminos" name="terminos" checked={formData.terminos}
          onChange={handleChange} className="me-2" required
        />
        <Form.Label htmlFor="terminos" className="text-dark mb-0 small">
          {t('acceptTermsPrefix')} <a href="#" className="text-decoration-none">{t('termsAndConditions')}</a>
        </Form.Label>
      </Form.Group>

      {errorMessage && (
        <div className="error-message" role="alert" aria-live="assertive">{errorMessage}</div>
      )}

      <div className="d-flex gap-2">
        <Button variant="outline-secondary" onClick={prevStep} className="signup-btn-prev">
          {t('back')}
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting} className="signup-btn flex-grow-1">
          {isSubmitting ? t('registering') : t('agentSignUp')}
        </Button>
      </div>
    </Form>
  );

  return (
    <div className="signup-page">
      <Container style={{ maxWidth: 500 }}>
        <Card className="signup-card">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo-img" />
          </div>

          <h4 className="signup-title">{t('agentCreateAccountTitle')}</h4>
          <p className="signup-subtitle">
            {t('signupLoginPrompt')} <a href="/login">{t('signupLoginLink')}</a>
          </p>

          {renderStepper()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}

          <div className="divider-container">
            <hr />
            <span>{t('orSignUpWith')}</span>
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
