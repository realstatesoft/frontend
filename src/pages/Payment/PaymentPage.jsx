import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert,
} from 'react-bootstrap';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiCreditCard, FiLock } from 'react-icons/fi';
import CustomNavbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';
import usePayment from '../../hooks/usePayment';
import styles from './PaymentPage.module.scss';

function formatDisplayAmount(raw) {
  const num = parseFloat(raw);
  if (!raw || isNaN(num)) return '—';
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function toSafeRelative(url) {
  if (!url) return '';
  // Allow only relative paths starting with / and not //
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  return '';
}

function maskCardNumber(cardNumber) {
  const raw = cardNumber.replace(/\s/g, '');
  if (!raw) return '•••• •••• •••• ••••';
  const padded = raw.padEnd(16, '•');
  return padded.replace(/(.{4})/g, '$1 ').trim();
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const amount = searchParams.get('amount') ?? '';
  const concept = searchParams.get('concept') ?? 'Pago';
  const type = searchParams.get('type') ?? 'OTHER';
  const description = searchParams.get('description') ?? '';
  const redirectUrl = toSafeRelative(searchParams.get('redirectUrl'));
  const cancelUrl = toSafeRelative(searchParams.get('cancelUrl'));


  const { form, setField, fieldErrors, status, errorMessage, processPayment, reset } = usePayment({
    amount,
    concept,
    description,
    type,
  });

  const redirectTimerRef = useRef(null);
  useEffect(() => () => { if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await processPayment();
    if (ok && redirectUrl) {
      redirectTimerRef.current = setTimeout(() => navigate(redirectUrl), 2000);
    }
  }

  function handleCancel() {
    if (cancelUrl) navigate(cancelUrl);
    else navigate(-1);
  }

  function handleRetry() {
    reset();
  }

  return (
    <div className={styles.page}>
      <CustomNavbar />
      <Container className={styles.wrapper}>
        <Row className="justify-content-center g-4">
          {/* Summary */}
          <Col xs={12} md={4} lg={3}>
            <Card className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <p className={styles.summaryTitle}>Total a pagar</p>
                <p className={styles.summaryAmount}>{formatDisplayAmount(amount)}</p>
              </div>
              <div className={styles.summaryBody}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Concepto</span>
                  <span className={styles.summaryValue}>{concept}</span>
                </div>
                {description && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Detalle</span>
                    <span className={styles.summaryValue}>{description}</span>
                  </div>
                )}
              </div>
            </Card>

            <div className={styles.simulatedBadge}>
              <FiAlertTriangle />
              <span>Pago simulado — no se realizará ningún cargo real.</span>
            </div>
          </Col>

          {/* Payment form */}
          <Col xs={12} md={8} lg={6}>
            <Card className={styles.formCard}>
              <Card.Body className={styles.formCardBody}>

                {status === 'success' && (
                  <div className={styles.successContainer}>
                    <div className={styles.successIcon}>
                      <FiCheckCircle />
                    </div>
                    <h4 className="fw-bold mb-2">¡Pago exitoso!</h4>
                    <p className="text-muted mb-3">
                      Tu pago fue procesado correctamente.
                      {redirectUrl && ' Serás redirigido en instantes…'}
                    </p>
                    {!redirectUrl && (
                      <Button variant="primary" onClick={() => navigate(-1)}>
                        Volver
                      </Button>
                    )}
                  </div>
                )}

                {status === 'error' && (
                  <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>
                      <FiXCircle />
                    </div>
                    <h4 className="fw-bold mb-2">Pago rechazado</h4>
                    <p className="text-muted mb-3">{errorMessage}</p>
                    <Button variant="outline-primary" onClick={handleRetry}>
                      Intentar nuevamente
                    </Button>
                  </div>
                )}

                {(status === 'idle' || status === 'processing') && (
                  <>
                    {/* Card preview */}
                    <div className={styles.cardPreview}>
                      <div className={styles.cardChip} />
                      <div className={styles.cardNumber}>
                        {maskCardNumber(form.cardNumber)}
                      </div>
                      <div className={styles.cardFooter}>
                        <div>
                          <div className={styles.cardLabel}>Titular</div>
                          <div className={styles.cardName}>
                            {form.cardholderName || 'NOMBRE APELLIDO'}
                          </div>
                        </div>
                        <div>
                          <div className={styles.cardLabel}>Vence</div>
                          <div className={styles.cardExpiry}>
                            {form.expiry || 'MM/AA'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                      <FiCreditCard /> Datos de tarjeta
                    </h5>

                    <Form onSubmit={handleSubmit} noValidate>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre del titular</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Como aparece en la tarjeta"
                          value={form.cardholderName}
                          onChange={setField('cardholderName')}
                          isInvalid={!!fieldErrors.cardholderName}
                          disabled={status === 'processing'}
                          autoComplete="cc-name"
                        />
                        <Form.Control.Feedback type="invalid">
                          {fieldErrors.cardholderName}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Número de tarjeta</Form.Label>
                        <Form.Control
                          type="text"
                          inputMode="numeric"
                          placeholder="0000 0000 0000 0000"
                          value={form.cardNumber}
                          onChange={setField('cardNumber')}
                          isInvalid={!!fieldErrors.cardNumber}
                          disabled={status === 'processing'}
                          autoComplete="cc-number"
                        />
                        <Form.Control.Feedback type="invalid">
                          {fieldErrors.cardNumber}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Row className="g-3 mb-4">
                        <Col xs={6}>
                          <Form.Group>
                            <Form.Label>Vencimiento</Form.Label>
                            <Form.Control
                              type="text"
                              inputMode="numeric"
                              placeholder="MM/AA"
                              value={form.expiry}
                              onChange={setField('expiry')}
                              isInvalid={!!fieldErrors.expiry}
                              disabled={status === 'processing'}
                              autoComplete="cc-exp"
                            />
                            <Form.Control.Feedback type="invalid">
                              {fieldErrors.expiry}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col xs={6}>
                          <Form.Group>
                            <Form.Label>CVV</Form.Label>
                            <Form.Control
                              type="password"
                              inputMode="numeric"
                              placeholder="•••"
                              value={form.cvv}
                              onChange={setField('cvv')}
                              isInvalid={!!fieldErrors.cvv}
                              disabled={status === 'processing'}
                              autoComplete="cc-csc"
                            />
                            <Form.Control.Feedback type="invalid">
                              {fieldErrors.cvv}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="d-grid gap-2">
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          disabled={status === 'processing'}
                          className="d-flex align-items-center justify-content-center gap-2"
                        >
                          {status === 'processing' ? (
                            <>
                              <Spinner animation="border" size="sm" />
                              Procesando…
                            </>
                          ) : (
                            <>
                              <FiLock /> Pagar {formatDisplayAmount(amount)}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          disabled={status === 'processing'}
                          onClick={handleCancel}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </Form>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}
