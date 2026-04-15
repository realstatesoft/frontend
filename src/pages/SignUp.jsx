import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Stack, Alert, Spinner } from 'react-bootstrap';
import logo from '../assets/Logotipo.png';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IoCheckmark, IoArrowForwardOutline } from 'react-icons/io5';
import PreferencesForm from '../components/preferences/PreferencesForm';
import { useUserPreferences } from '../hooks/useUserPreferences';

// ── Stepper visual ────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Tus datos' },
  { label: 'Tu cuenta' },
  { label: 'Preferencias' },
];

function Stepper({ current }) {
  return (
    <div className="signup-stepper">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;

        return (
          <React.Fragment key={stepNum}>
            {/* Línea conectora (antes del paso, excepto el primero) */}
            {idx > 0 && (
              <div className={`signup-stepper__line${isDone || isActive ? ' signup-stepper__line--done' : ''}`} />
            )}

            <div
              className={`signup-stepper__step${isDone ? ' signup-stepper__step--done' : ''}${isActive ? ' signup-stepper__step--active' : ''}`}
            >
              <div className="signup-stepper__circle">
                {isDone ? <IoCheckmark /> : stepNum}
              </div>
              <span className="signup-stepper__label">{step.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Paso 1: Datos personales ──────────────────────────────────────────────────

function Step1({ formData, handleChange, onNext }) {
  const [error, setError] = useState('');

  function validate() {
    if (!formData.nombre.trim()) return 'El nombre es requerido.';
    if (!formData.apellido.trim()) return 'El apellido es requerido.';
    return null;
  }

  function handleContinue() {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    onNext();
  }

  return (
    <>
      <h3 className="text-center fw-bold mb-1">Crea tu cuenta</h3>
      <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
        ¿Ya tienes una cuenta?{' '}
        <a href="/login" className="text-decoration-none fw-medium" style={{ color: 'var(--bs-primary)' }}>
          Inicia sesión aquí
        </a>
      </p>

      {error && (
        <Alert variant="danger" className="py-2 mb-3" style={{ fontSize: '0.85rem', borderRadius: '0.75rem' }}>
          {error}
        </Alert>
      )}

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

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Teléfono</Form.Label>
        <Form.Control
          type="tel" name="phone" value={formData.phone} onChange={handleChange}
          placeholder="+595 9..." style={{ padding: '0.6rem', borderRadius: '0.75rem' }}
        />
      </Form.Group>

      <div className="d-grid">
        <Button
          variant="primary" type="button" onClick={handleContinue}
          style={{ borderRadius: '0.75rem', padding: '0.8rem' }} className="fw-bold"
        >
          Continuar
        </Button>
      </div>
    </>
  );
}

// ── Paso 2: Datos de cuenta ───────────────────────────────────────────────────

function Step2({ formData, handleChange, onNext, onBack, isSubmitting, submitError }) {
  const [error, setError] = useState('');

  function validate() {
    if (!formData.email.trim()) return 'El correo electrónico es requerido.';
    if (formData.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden.';
    if (!formData.terminos) return 'Debes aceptar los términos y condiciones.';
    return null;
  }

  function handleContinue() {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    onNext();
  }

  const displayError = error || submitError;

  return (
    <>
      <h3 className="text-center fw-bold mb-1">Datos de cuenta</h3>
      <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
        Configurá tu correo y contraseña para acceder.
      </p>

      {displayError && (
        <Alert variant="danger" className="py-2 mb-3 text-center" style={{ fontSize: '0.85rem', borderRadius: '0.75rem' }}>
          {displayError}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Correo Electrónico</Form.Label>
        <Form.Control
          type="email" name="email" value={formData.email} onChange={handleChange}
          placeholder="tu@email.com" style={{ padding: '0.6rem', borderRadius: '0.75rem' }} required
        />
      </Form.Group>

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

      <Row className="g-2">
        <Col xs={12} sm={4}>
          <Button
            variant="outline-secondary" type="button" onClick={onBack}
            style={{ borderRadius: '0.75rem', padding: '0.8rem' }} className="fw-medium w-100"
            disabled={isSubmitting}
          >
            ← Volver
          </Button>
        </Col>
        <Col xs={12} sm={8}>
          <Button
            variant="primary" type="button" onClick={handleContinue}
            style={{ borderRadius: '0.75rem', padding: '0.8rem' }} className="fw-bold w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><Spinner animation="border" size="sm" className="me-2" /> Creando cuenta...</>
            ) : (
              'Crear cuenta'
            )}
          </Button>
        </Col>
      </Row>

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
    </>
  );
}

// ── Paso 3: Preferencias ──────────────────────────────────────────────────────

function Step3({ userId, onComplete }) {
  const {
    options,
    optionsLoading,
    error,
    retryLoad,
    savePreferences,
    isSaving,
  } = useUserPreferences(userId);

  async function handleSubmit({ selectedOptionIds, ranges }) {
    try {
      await savePreferences({ userId, selectedOptionIds, ranges });
      onComplete();
    } catch (err) {
      console.error('[Step3] Error al guardar preferencias:', err);
      // El error se mostrará desde PreferencesForm via isSaving/retryLoad
    }
  }

  return (
    <>
      <div className="text-center mb-4">
        <h3 className="fw-bold mb-1">Tus preferencias</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Contanos qué estás buscando y te mostraremos las mejores propiedades para vos.
        </p>
      </div>

      <PreferencesForm
        options={options}
        optionsLoading={optionsLoading}
        error={error}
        onRetry={retryLoad}
        initialPreferences={null}
        onSubmit={handleSubmit}
        isSaving={isSaving}
        submitLabel={
          <>
            Guardar y continuar <IoArrowForwardOutline className="ms-1" />
          </>
        }
        onSkip={onComplete}
        skipLabel="Saltar por ahora, lo haré después"
      />
    </>
  );
}

// ── Componente principal SignUp ────────────────────────────────────────────────

export default function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [newUserId, setNewUserId] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terminos: false,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleRegister() {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const dataParaBackend = {
        name: `${formData.nombre} ${formData.apellido}`.trim(),
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'USER',
      };

      const result = await register(dataParaBackend);
      const userId = result?.data?.id ?? result?.data?.userId ?? null;
      setNewUserId(userId);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error en el registro:', error);
      setSubmitError(error.message || 'Error al registrar usuario. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleComplete() {
    navigate('/');
  }

  return (
    <div
      className="bg-light min-vh-100 d-flex align-items-center justify-content-center py-4"
      style={{ fontFamily: '"Poppins", sans-serif' }}
    >
      <Container style={{ maxWidth: currentStep === 3 ? 680 : 500 }}>
        <Card
          className="border-0 shadow-sm p-4 p-md-5"
          style={{ borderRadius: '0.75rem' }}
        >
          {/* Logo */}
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

          {/* Stepper */}
          <Stepper current={currentStep} />

          {/* Contenido por paso */}
          {currentStep === 1 && (
            <Step1
              formData={formData}
              handleChange={handleChange}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2
              formData={formData}
              handleChange={handleChange}
              onNext={handleRegister}
              onBack={() => setCurrentStep(1)}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}

          {currentStep === 3 && (
            <Step3
              userId={newUserId}
              onComplete={handleComplete}
            />
          )}
        </Card>
      </Container>
    </div>
  );
}