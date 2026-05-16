import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Stack, Alert, InputGroup } from 'react-bootstrap';
import { Envelope, Eye, EyeSlash, Facebook, Google, Lock, Person, Telephone } from 'react-bootstrap-icons';
import logo from '../assets/Logotipo.png';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IoCheckmark, IoArrowForwardOutline } from 'react-icons/io5';
import PreferencesForm from '../components/preferences/PreferencesForm';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useTranslation } from 'react-i18next';
import { useFormValidation } from '../hooks/useFormValidation';
import './SignUp.scss';

export default function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation('auth');

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  const { fieldErrors, validate, clearFieldError } = useFormValidation();

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
    clearFieldError(name);
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
    const valid = validate({
      nombre: { value: formData.nombre, label: t('firstName'), required: true },
      apellido: { value: formData.apellido, label: t('lastName'), required: true },
    });
    if (!valid) return;
    nextStep();
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const valid = validate({
      email: { value: formData.email, label: t('email'), required: true, pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('invalidEmail') || 'Email inválido' } },
      password: { value: formData.password, label: t('password'), required: true, minLength: 6 },
      confirmPassword: { value: formData.confirmPassword, label: t('confirmPassword'), required: true },
    });

    if (!valid) return;

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
    <Form onSubmit={handleStep1Submit} noValidate>
      <Row className="g-3 mb-3">
        <Col xs={6}>
          <Form.Group>
            <Form.Label className="form-label">{t('firstName')}</Form.Label>
            <InputGroup className="input-group-custom">
              <InputGroup.Text><Person size={18} /></InputGroup.Text>
              <Form.Control
                type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                placeholder={t('firstNamePlaceholder')}
                className={fieldErrors.nombre ? 'field-error' : ''}
                isInvalid={!!fieldErrors.nombre}
              />
            </InputGroup>
            {fieldErrors.nombre && <div className="field-error-msg">{fieldErrors.nombre}</div>}
          </Form.Group>
        </Col>
        <Col xs={6}>
          <Form.Group>
            <Form.Label className="form-label">{t('lastName')}</Form.Label>
            <InputGroup className="input-group-custom">
              <InputGroup.Text><Person size={18} /></InputGroup.Text>
              <Form.Control
                type="text" name="apellido" value={formData.apellido} onChange={handleChange}
                placeholder={t('lastNamePlaceholder')}
                className={fieldErrors.apellido ? 'field-error' : ''}
                isInvalid={!!fieldErrors.apellido}
              />
            </InputGroup>
            {fieldErrors.apellido && <div className="field-error-msg">{fieldErrors.apellido}</div>}
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">{t('phone')}</Form.Label>
        <InputGroup className="input-group-custom">
          <InputGroup.Text><Telephone size={18} /></InputGroup.Text>
          <Form.Control
            type="tel" name="phone" value={formData.phone} onChange={handleChange}
            placeholder={t('phonePlaceholder')}
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
    <Form onSubmit={handleStep2Submit} noValidate>
      <Form.Group className="mb-3">
        <Form.Label className="form-label">{t('email')}</Form.Label>
        <InputGroup className="input-group-custom">
          <InputGroup.Text><Envelope size={18} /></InputGroup.Text>
          <Form.Control
            type="email" name="email" value={formData.email} onChange={handleChange}
            placeholder={t('emailPlaceholder')}
            className={fieldErrors.email ? 'field-error' : ''}
            isInvalid={!!fieldErrors.email}
          />
        </InputGroup>
        {fieldErrors.email && <div className="field-error-msg">{fieldErrors.email}</div>}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="form-label">{t('password')}</Form.Label>
        <InputGroup className="input-group-custom">
          <InputGroup.Text><Lock size={18} /></InputGroup.Text>
          <Form.Control
            type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
            placeholder={t('passwordPlaceholder')}
            className={fieldErrors.password ? 'field-error' : ''}
            isInvalid={!!fieldErrors.password}
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
        {fieldErrors.password && <div className="field-error-msg">{fieldErrors.password}</div>}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="form-label">{t('confirmPassword')}</Form.Label>
        <InputGroup className="input-group-custom">
          <InputGroup.Text><Lock size={18} /></InputGroup.Text>
          <Form.Control
            type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
            placeholder={t('confirmPasswordPlaceholder')}
            className={fieldErrors.confirmPassword ? 'field-error' : ''}
            isInvalid={!!fieldErrors.confirmPassword}
          />
          <InputGroup.Text
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowConfirmPassword(!showConfirmPassword); }}
            role="button" tabIndex={0}
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
          >
            {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </InputGroup.Text>
        </InputGroup>
        {fieldErrors.confirmPassword && <div className="field-error-msg">{fieldErrors.confirmPassword}</div>}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="form-label">{t('password')}</Form.Label>
        <InputGroup className="input-group-custom">
          <InputGroup.Text><Lock size={18} /></InputGroup.Text>
          <Form.Control
            type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
            placeholder={t('passwordPlaceholder')} required
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
            type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
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
          type="checkbox" id="terminos" name="terminos" checked={formData.terminos} onChange={handleChange}
          className="me-2" required
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
    <div className="signup-page">
      <Container style={{ maxWidth: currentStep === 3 ? 800 : 500 }}>
        <Card className="signup-card">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo-img" />
          </div>

          {currentStep < 3 && (
            <>
              <h4 className="signup-title">{t('createAccountTitle')}</h4>
              <p className="signup-subtitle">
                {t('signupLoginPrompt')} <a href="/login">{t('signupLoginLink')}</a>
              </p>
              <p className="signup-subtitle">
                {t('agentSignupPrompt')} <a href="/signup/agent">{t('agentSignupLink')}</a>
              </p>
            </>
          )}

          {renderStepper()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {currentStep < 3 && (
            <>
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
            </>
          )}
        </Card>
      </Container>
    </div>
  );
}
