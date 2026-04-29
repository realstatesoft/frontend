import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Stack, Alert } from 'react-bootstrap';
import logo from '../assets/Logotipo.png';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IoCheckmark, IoArrowForwardOutline } from 'react-icons/io5';
import PreferencesForm from '../components/preferences/PreferencesForm';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useTranslation } from 'react-i18next';

export default function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation('auth');

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Guardamos el userId tras el paso 2 para el paso 3
  const [registeredUserId, setRegisteredUserId] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terminos: false
  });

  const {
    options,
    optionsLoading,
    error: optionsError,
    retryLoad,
    savePreferences,
    isSaving: isSavingPrefs
  } = useUserPreferences(registeredUserId);

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

  // ── Handlers de cada paso ──────────────────────────────────────────────────

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
        role: 'USER'
      };

      const result = await register(dataParaBackend);
      const userId = result?.data?.id; 
      
      if (userId) {
        setRegisteredUserId(userId);
        nextStep();
      } else {
        // Si no tenemos ID, algo falló en la respuesta
        setErrorMessage(t('registrationIdError'));
      }
    } catch (error) {
      setErrorMessage(error.message || t('registrationError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferencesSubmit = async ({ selectedOptionIds, ranges }) => {
    setErrorMessage('');
    try {
      await savePreferences({
        userId: registeredUserId,
        selectedOptionIds,
        ranges
      });
      // Éxito -> al landing
      navigate('/');
    } catch (err) {
      // Si falla el guardado de preferencias, mostramos error pero permitimos saltar
      setErrorMessage(err.message);
    }
  };

  const handleSkipPreferences = () => {
    navigate('/');
  };

  // ── Render de Stepper ──────────────────────────────────────────────────────

  const steps = [
    { num: 1, label: t('signupStepPersonal') },
    { num: 2, label: t('signupStepAccount') },
    { num: 3, label: t('signupStepPreferences') }
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
            {step.num < 3 && <div className="signup-stepper__line" />}
          </div>
        );
      })}
    </div>
  );

  // ── Renders de Pasos ───────────────────────────────────────────────────────

  const renderStep1 = () => (
    <Form onSubmit={handleStep1Submit}>
      <Row className="g-3 mb-3">
        <Col xs={6}>
          <Form.Group>
            <Form.Label className="fw-semibold small">{t('firstName')}</Form.Label>
            <Form.Control
              type="text" name="nombre" value={formData.nombre} onChange={handleChange}
              placeholder={t('firstNamePlaceholder')} required
              className="signup-input"
            />
          </Form.Group>
        </Col>
        <Col xs={6}>
          <Form.Group>
            <Form.Label className="fw-semibold small">{t('lastName')}</Form.Label>
            <Form.Control
              type="text" name="apellido" value={formData.apellido} onChange={handleChange}
              placeholder={t('lastNamePlaceholder')} required
              className="signup-input"
            />
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold small">{t('phone')}</Form.Label>
        <Form.Control
          type="tel" name="phone" value={formData.phone} onChange={handleChange}
          placeholder={t('phonePlaceholder')}
          className="signup-input"
        />
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
        <Form.Label className="fw-semibold small">{t('email')}</Form.Label>
        <Form.Control
          type="email" name="email" value={formData.email} onChange={handleChange}
          placeholder={t('emailPlaceholder')} required
          className="signup-input"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold small">{t('password')}</Form.Label>
        <Form.Control
          type="password" name="password" value={formData.password} onChange={handleChange}
          placeholder={t('passwordPlaceholder')} required
          className="signup-input"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold small">{t('confirmPassword')}</Form.Label>
        <Form.Control
          type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
          placeholder={t('confirmPasswordPlaceholder')} required
          className="signup-input"
        />
      </Form.Group>
      <Form.Group className="mb-4 d-flex align-items-center">
        <Form.Check
          type="checkbox" id="terminos" name="terminos" checked={formData.terminos} onChange={handleChange}
          className="me-2" required
        />
        <Form.Label htmlFor="terminos" className="text-dark mb-0 small">
          {t('acceptTermsPrefix')} <a href="#" className="text-decoration-none">{t('termsAndConditions')}</a>
        </Form.Label>
      </Form.Group>

      {errorMessage && <Alert variant="danger" className="py-2 small mb-3">{errorMessage}</Alert>}

      <div className="d-flex gap-2">
        <Button variant="outline-secondary" onClick={prevStep} className="signup-btn-prev">
          {t('back')}
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting} className="signup-btn flex-grow-1">
          {isSubmitting ? t('registering') : t('signUp')}
        </Button>
      </div>
    </Form>
  );

  const renderStep3 = () => (
    <div className="signup-step-preferences">
      <div className="text-center mb-4">
        <h4 className="fw-bold mb-2">{t('almostDone')}</h4>
        <p className="text-muted small">
          {t('signupPreferencesCopy')}
        </p>
      </div>
      
      {errorMessage && <Alert variant="danger" className="py-2 small mb-3">{errorMessage}</Alert>}

      <PreferencesForm
        options={options}
        optionsLoading={optionsLoading}
        error={optionsError}
        onRetry={retryLoad}
        initialPreferences={null}
        onSubmit={handlePreferencesSubmit}
        isSaving={isSavingPrefs}
        submitLabel={
          <>
            {t('saveAndContinue')} <IoArrowForwardOutline className="ms-1" />
          </>
        }
        onSkip={handleSkipPreferences}
        skipLabel={t('skipForNow')}
      />
    </div>
  );

  return (
    <div className="signup-page bg-light min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Container style={{ maxWidth: currentStep === 3 ? 800 : 500 }}>
        <Card className="signup-card border-0 shadow-sm overflow-hidden">
          <div className="p-4 p-md-5">
            <div className="text-center mb-4">
              <img src={logo} alt="Logo" className="signup-logo mb-3" />
              {currentStep < 3 && (
                <>
                  <h3 className="fw-bold mb-1">{t('createAccountTitle')}</h3>
                  <p className="text-muted small">
                    {t('signupLoginPrompt')} <a href="/login" className="text-decoration-none">{t('loginLink')}</a>
                  </p>
                </>
              )}
            </div>

            {renderStepper()}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {currentStep < 3 && (
              <>
                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1" />
                  <span className="mx-3 text-muted small">{t('orSignUpWith')}</span>
                  <hr className="flex-grow-1" />
                </div>
                <Stack direction="horizontal" gap={3} className="justify-content-center">
                  <Button variant="outline-secondary" className="signup-social-btn">
                    <i className="bi bi-google me-2"></i> Google
                  </Button>
                  <Button variant="outline-secondary" className="signup-social-btn">
                    <i className="bi bi-facebook me-2"></i> Facebook
                  </Button>
                </Stack>
              </>
            )}
          </div>
        </Card>
      </Container>
    </div>
  );
}
