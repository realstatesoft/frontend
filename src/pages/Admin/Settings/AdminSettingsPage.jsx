import { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FiPercent, FiCalendar, FiImage, FiGlobe } from 'react-icons/fi';
import settingsService from '../../../services/settingsService';
import styles from './AdminSettingsPage.module.scss';

function SectionAlert({ error, success }) {
  if (!error && !success) return null;
  return (
    <>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}
    </>
  );
}

function SaveButton({ saving }) {
  return (
    <div className={styles.buttonGroup}>
      <Button type="submit" variant="primary" disabled={saving} className={styles.button}>
        {saving ? (
          <><Spinner animation="border" size="sm" className="me-2" />Guardando...</>
        ) : 'Guardar'}
      </Button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [commissions, setCommissions] = useState({
    saleCommissionPercent: 10,
    rentCommissionPercent: 5,
    rentDepositMonths: 1,
  });
  const [savingCommissions, setSavingCommissions] = useState(false);
  const [commissionsMsg, setCommissionsMsg] = useState({ error: null, success: null });

  const [reservations, setReservations] = useState({ ttlHours: 72, depositPercent: 1 });
  const [savingReservations, setSavingReservations] = useState(false);
  const [reservationsMsg, setReservationsMsg] = useState({ error: null, success: null });

  const [properties, setProperties] = useState({ maxImages: 15 });
  const [savingProperties, setSavingProperties] = useState(false);
  const [propertiesMsg, setPropertiesMsg] = useState({ error: null, success: null });

  const [system, setSystem] = useState({ defaultCurrency: 'PYG' });
  const [savingSystem, setSavingSystem] = useState(false);
  const [systemMsg, setSystemMsg] = useState({ error: null, success: null });

  useEffect(() => {
    let active = true;
    settingsService.getAdminSettings()
      .then((res) => {
        if (!active) return;
        const d = res?.data;
        if (d?.commissions) setCommissions(d.commissions);
        if (d?.reservations) setReservations(d.reservations);
        if (d?.properties) setProperties(d.properties);
        if (d?.system) setSystem(d.system);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error loading admin settings:', err);
        setLoadError('No se pudo cargar la configuración.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSaveCommissions = async (e) => {
    e.preventDefault();
    setCommissionsMsg({ error: null, success: null });
    const sp = Number(commissions.saleCommissionPercent);
    const rp = Number(commissions.rentCommissionPercent);
    const dm = Number(commissions.rentDepositMonths);
    if (!Number.isFinite(sp) || sp < 0 || sp > 100) {
      setCommissionsMsg({ error: 'El porcentaje de comisión de venta debe ser entre 0 y 100.', success: null });
      return;
    }
    if (!Number.isFinite(rp) || rp < 0 || rp > 100) {
      setCommissionsMsg({ error: 'El porcentaje de comisión de alquiler debe ser entre 0 y 100.', success: null });
      return;
    }
    if (!Number.isFinite(dm) || dm < 1 || dm > 12) {
      setCommissionsMsg({ error: 'Los meses de depósito deben ser entre 1 y 12.', success: null });
      return;
    }
    setSavingCommissions(true);
    try {
      const res = await settingsService.updateAdminCommissions({
        saleCommissionPercent: sp,
        rentCommissionPercent: rp,
        rentDepositMonths: dm,
      });
      if (res?.data?.commissions) setCommissions(res.data.commissions);
      setCommissionsMsg({ error: null, success: 'Comisiones actualizadas correctamente.' });
    } catch (err) {
      console.error('Error saving commissions:', err);
      setCommissionsMsg({ error: 'No se pudo guardar. Intenta nuevamente.', success: null });
    } finally {
      setSavingCommissions(false);
    }
  };

  const handleSaveReservations = async (e) => {
    e.preventDefault();
    setReservationsMsg({ error: null, success: null });
    const h = Number(reservations.ttlHours);
    const dp = Number(reservations.depositPercent);
    if (!Number.isFinite(h) || h < 1 || h > 720) {
      setReservationsMsg({ error: 'Las horas de vigencia deben ser entre 1 y 720.', success: null });
      return;
    }
    if (!Number.isFinite(dp) || dp < 0.01 || dp > 100) {
      setReservationsMsg({ error: 'El porcentaje de depósito debe ser entre 0.01 y 100.', success: null });
      return;
    }
    setSavingReservations(true);
    try {
      const res = await settingsService.updateAdminReservations({ ttlHours: h, depositPercent: dp });
      if (res?.data?.reservations) setReservations(res.data.reservations);
      setReservationsMsg({ error: null, success: 'Configuración de reservas actualizada.' });
    } catch (err) {
      console.error('Error saving reservations:', err);
      setReservationsMsg({ error: 'No se pudo guardar. Intenta nuevamente.', success: null });
    } finally {
      setSavingReservations(false);
    }
  };

  const handleSaveProperties = async (e) => {
    e.preventDefault();
    setPropertiesMsg({ error: null, success: null });
    const mi = Number(properties.maxImages);
    if (!Number.isFinite(mi) || mi < 1 || mi > 50) {
      setPropertiesMsg({ error: 'El máximo de imágenes debe ser entre 1 y 50.', success: null });
      return;
    }
    setSavingProperties(true);
    try {
      const res = await settingsService.updateAdminProperties({ maxImages: mi });
      if (res?.data?.properties) setProperties(res.data.properties);
      setPropertiesMsg({ error: null, success: 'Configuración de propiedades actualizada.' });
    } catch (err) {
      console.error('Error saving properties config:', err);
      setPropertiesMsg({ error: 'No se pudo guardar. Intenta nuevamente.', success: null });
    } finally {
      setSavingProperties(false);
    }
  };

  const handleSaveSystem = async (e) => {
    e.preventDefault();
    setSystemMsg({ error: null, success: null });
    const curr = String(system.defaultCurrency ?? '').trim().toUpperCase();
    if (curr.length !== 3) {
      setSystemMsg({ error: 'La moneda debe ser un código ISO 4217 de exactamente 3 caracteres (ej: PYG, USD, EUR).', success: null });
      return;
    }
    setSavingSystem(true);
    try {
      const res = await settingsService.updateAdminSystem({ defaultCurrency: curr });
      if (res?.data?.system) setSystem(res.data.system);
      setSystemMsg({ error: null, success: 'Configuración del sistema actualizada.' });
    } catch (err) {
      console.error('Error saving system config:', err);
      setSystemMsg({ error: 'No se pudo guardar. Intenta nuevamente.', success: null });
    } finally {
      setSavingSystem(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Configuración del sistema</h2>
      <p className={styles.subtitle}>Ajusta los parámetros globales de la plataforma.</p>

      {loadError && <Alert variant="danger" className="mb-4">{loadError}</Alert>}

      <div className={styles.sections}>
        {/* ── COMMISSIONS ─────────────────────────────────────────────── */}
        <Card className={styles.card}>
          <Card.Header className={styles.cardHeader}>
            <FiPercent className={styles.cardHeader__icon} />
            <div>
              <h3 className={styles.cardHeader__title}>Comisiones</h3>
              <p className={styles.cardHeader__desc}>
                Porcentajes de comisión y depósito para ventas y alquileres.
              </p>
            </div>
          </Card.Header>
          <Card.Body>
            <SectionAlert {...commissionsMsg} />
            <Form onSubmit={handleSaveCommissions}>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="saleCommissionPercent">
                    <Form.Label className={styles.label}>Comisión de venta (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={commissions.saleCommissionPercent}
                      onChange={(e) =>
                        setCommissions((p) => ({ ...p, saleCommissionPercent: e.target.value }))
                      }
                      className={styles.input}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="rentCommissionPercent">
                    <Form.Label className={styles.label}>Comisión de alquiler (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={commissions.rentCommissionPercent}
                      onChange={(e) =>
                        setCommissions((p) => ({ ...p, rentCommissionPercent: e.target.value }))
                      }
                      className={styles.input}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="rentDepositMonths">
                    <Form.Label className={styles.label}>Meses de depósito</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="12"
                      value={commissions.rentDepositMonths}
                      onChange={(e) =>
                        setCommissions((p) => ({ ...p, rentDepositMonths: e.target.value }))
                      }
                      className={styles.input}
                    />
                    <Form.Text className="text-muted">Entre 1 y 12 meses.</Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <SaveButton saving={savingCommissions} />
            </Form>
          </Card.Body>
        </Card>

        {/* ── RESERVATIONS ────────────────────────────────────────────── */}
        <Card className={styles.card}>
          <Card.Header className={styles.cardHeader}>
            <FiCalendar className={styles.cardHeader__icon} />
            <div>
              <h3 className={styles.cardHeader__title}>Reservas</h3>
              <p className={styles.cardHeader__desc}>
                Tiempo de vigencia y depósito requerido para reservar una propiedad.
              </p>
            </div>
          </Card.Header>
          <Card.Body>
            <SectionAlert {...reservationsMsg} />
            <Form onSubmit={handleSaveReservations}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="ttlHours">
                    <Form.Label className={styles.label}>Vigencia de reserva (horas)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="720"
                      value={reservations.ttlHours}
                      onChange={(e) =>
                        setReservations((p) => ({ ...p, ttlHours: e.target.value }))
                      }
                      className={styles.input}
                    />
                    <Form.Text className="text-muted">
                      Tiempo antes de que la reserva expire. Máximo 720 h (30 días).
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="depositPercent">
                    <Form.Label className={styles.label}>Depósito de reserva (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0.01"
                      max="100"
                      step="0.01"
                      value={reservations.depositPercent}
                      onChange={(e) =>
                        setReservations((p) => ({ ...p, depositPercent: e.target.value }))
                      }
                      className={styles.input}
                    />
                    <Form.Text className="text-muted">
                      Porcentaje del precio de la propiedad que se cobra como depósito.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <SaveButton saving={savingReservations} />
            </Form>
          </Card.Body>
        </Card>

        {/* ── PROPERTIES ──────────────────────────────────────────────── */}
        <Card className={styles.card}>
          <Card.Header className={styles.cardHeader}>
            <FiImage className={styles.cardHeader__icon} />
            <div>
              <h3 className={styles.cardHeader__title}>Propiedades</h3>
              <p className={styles.cardHeader__desc}>
                Límites y restricciones para la carga de propiedades.
              </p>
            </div>
          </Card.Header>
          <Card.Body>
            <SectionAlert {...propertiesMsg} />
            <Form onSubmit={handleSaveProperties}>
              <Form.Group className="mb-3" controlId="maxImages" style={{ maxWidth: 280 }}>
                <Form.Label className={styles.label}>Máximo de imágenes por propiedad</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="50"
                  value={properties.maxImages}
                  onChange={(e) =>
                    setProperties((p) => ({ ...p, maxImages: e.target.value }))
                  }
                  className={styles.input}
                />
                <Form.Text className="text-muted">Entre 1 y 50 imágenes.</Form.Text>
              </Form.Group>
              <SaveButton saving={savingProperties} />
            </Form>
          </Card.Body>
        </Card>

        {/* ── SYSTEM ──────────────────────────────────────────────────── */}
        <Card className={styles.card}>
          <Card.Header className={styles.cardHeader}>
            <FiGlobe className={styles.cardHeader__icon} />
            <div>
              <h3 className={styles.cardHeader__title}>Sistema</h3>
              <p className={styles.cardHeader__desc}>
                Configuración general de la plataforma.
              </p>
            </div>
          </Card.Header>
          <Card.Body>
            <SectionAlert {...systemMsg} />
            <Form onSubmit={handleSaveSystem}>
              <Form.Group className="mb-3" controlId="defaultCurrency" style={{ maxWidth: 280 }}>
                <Form.Label className={styles.label}>Moneda predeterminada</Form.Label>
                <Form.Control
                  type="text"
                  maxLength={3}
                  placeholder="PYG"
                  value={system.defaultCurrency}
                  onChange={(e) =>
                    setSystem((p) => ({ ...p, defaultCurrency: e.target.value.toUpperCase() }))
                  }
                  className={styles.input}
                />
                <Form.Text className="text-muted">
                  Código ISO 4217 de 3 caracteres (ej: PYG, USD, EUR).
                </Form.Text>
              </Form.Group>
              <SaveButton saving={savingSystem} />
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
