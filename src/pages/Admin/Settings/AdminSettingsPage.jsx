import { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FiPercent, FiCalendar, FiImage, FiGlobe } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import settingsService from '../../../services/settingsService';
import styles from './AdminSettingsPage.module.scss';
import NumericInput from '../../../components/common/NumericInput';

function SectionAlert({ error, success }) {
  if (!error && !success) return null;
  return (
    <>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}
    </>
  );
}

function SaveButton({ saving, t }) {
  return (
    <div className={styles.buttonGroup}>
      <Button type="submit" variant="primary" disabled={saving} className={styles.button}>
        {saving ? (
          <><Spinner animation="border" size="sm" className="me-2" />{t('settings.saving')}</>
        ) : t('settings.save')}
      </Button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { t } = useTranslation('admin');
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
        setLoadError(t('settings.loadError'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  const handleSaveCommissions = async (e) => {
    e.preventDefault();
    setCommissionsMsg({ error: null, success: null });
    const sp = Number(commissions.saleCommissionPercent);
    const rp = Number(commissions.rentCommissionPercent);
    const dm = Number(commissions.rentDepositMonths);
    if (!Number.isFinite(sp) || sp < 0 || sp > 100) {
      setCommissionsMsg({ error: t('settings.commissions.errorSalePercent'), success: null });
      return;
    }
    if (!Number.isFinite(rp) || rp < 0 || rp > 100) {
      setCommissionsMsg({ error: t('settings.commissions.errorRentPercent'), success: null });
      return;
    }
    if (!Number.isFinite(dm) || dm < 1 || dm > 12) {
      setCommissionsMsg({ error: t('settings.commissions.errorDepositMonths'), success: null });
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
      setCommissionsMsg({ error: null, success: t('settings.commissions.success') });
    } catch (err) {
      console.error('Error saving commissions:', err);
      setCommissionsMsg({ error: t('settings.saveError'), success: null });
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
      setReservationsMsg({ error: t('settings.reservations.errorTtlHours'), success: null });
      return;
    }
    if (!Number.isFinite(dp) || dp < 0.01 || dp > 100) {
      setReservationsMsg({ error: t('settings.reservations.errorDepositPercent'), success: null });
      return;
    }
    setSavingReservations(true);
    try {
      const res = await settingsService.updateAdminReservations({ ttlHours: h, depositPercent: dp });
      if (res?.data?.reservations) setReservations(res.data.reservations);
      setReservationsMsg({ error: null, success: t('settings.reservations.success') });
    } catch (err) {
      console.error('Error saving reservations:', err);
      setReservationsMsg({ error: t('settings.saveError'), success: null });
    } finally {
      setSavingReservations(false);
    }
  };

  const handleSaveProperties = async (e) => {
    e.preventDefault();
    setPropertiesMsg({ error: null, success: null });
    const mi = Number(properties.maxImages);
    if (!Number.isFinite(mi) || mi < 1 || mi > 50) {
      setPropertiesMsg({ error: t('settings.properties.errorMaxImages'), success: null });
      return;
    }
    setSavingProperties(true);
    try {
      const res = await settingsService.updateAdminProperties({ maxImages: mi });
      if (res?.data?.properties) setProperties(res.data.properties);
      setPropertiesMsg({ error: null, success: t('settings.properties.success') });
    } catch (err) {
      console.error('Error saving properties config:', err);
      setPropertiesMsg({ error: t('settings.saveError'), success: null });
    } finally {
      setSavingProperties(false);
    }
  };

  const handleSaveSystem = async (e) => {
    e.preventDefault();
    setSystemMsg({ error: null, success: null });
    setSavingSystem(true);
    try {
      const res = await settingsService.updateAdminSystem({ defaultCurrency: system.defaultCurrency });
      if (res?.data?.system) setSystem(res.data.system);
      setSystemMsg({ error: null, success: t('settings.system.success') });
    } catch (err) {
      console.error('Error saving system config:', err);
      setSystemMsg({ error: t('settings.saveError'), success: null });
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
      <h2 className={styles.title}>{t('settings.title')}</h2>
      <p className={styles.subtitle}>{t('settings.subtitle')}</p>

      {loadError && <Alert variant="danger" className="mb-4">{loadError}</Alert>}

      <div className={styles.sections}>
        {/* ── COMMISSIONS ─────────────────────────────────────────────── */}
        <Card className={styles.card}>
          <Card.Header className={styles.cardHeader}>
            <FiPercent className={styles.cardHeader__icon} />
            <div>
              <h3 className={styles.cardHeader__title}>{t('settings.commissions.title')}</h3>
              <p className={styles.cardHeader__desc}>{t('settings.commissions.desc')}</p>
            </div>
          </Card.Header>
          <Card.Body>
            <SectionAlert {...commissionsMsg} />
            <Form onSubmit={handleSaveCommissions}>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="saleCommissionPercent">
                    <Form.Label className={styles.label}>{t('settings.commissions.salePercent')}</Form.Label>
                    <NumericInput
                      allowDecimal
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
                    <Form.Label className={styles.label}>{t('settings.commissions.rentPercent')}</Form.Label>
                    <NumericInput
                      allowDecimal
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
                    <Form.Label className={styles.label}>{t('settings.commissions.depositMonths')}</Form.Label>
                    <NumericInput
                      value={commissions.rentDepositMonths}
                      onChange={(e) =>
                        setCommissions((p) => ({ ...p, rentDepositMonths: e.target.value }))
                      }
                      className={styles.input}
                    />
                    <Form.Text className="text-muted">{t('settings.commissions.depositMonthsHelp')}</Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <SaveButton saving={savingCommissions} t={t} />
            </Form>
          </Card.Body>
        </Card>

        {/* ── RESERVATIONS ────────────────────────────────────────────── */}
        <Card className={styles.card}>
          <Card.Header className={styles.cardHeader}>
            <FiCalendar className={styles.cardHeader__icon} />
            <div>
              <h3 className={styles.cardHeader__title}>{t('settings.reservations.title')}</h3>
              <p className={styles.cardHeader__desc}>{t('settings.reservations.desc')}</p>
            </div>
          </Card.Header>
          <Card.Body>
            <SectionAlert {...reservationsMsg} />
            <Form onSubmit={handleSaveReservations}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="ttlHours">
                    <Form.Label className={styles.label}>{t('settings.reservations.ttlHours')}</Form.Label>
                    <NumericInput
                      value={reservations.ttlHours}
                      onChange={(e) =>
                        setReservations((p) => ({ ...p, ttlHours: e.target.value }))
                      }
                      className={styles.input}
                    />
                    <Form.Text className="text-muted">{t('settings.reservations.ttlHoursHelp')}</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="depositPercent">
                    <Form.Label className={styles.label}>{t('settings.reservations.depositPercent')}</Form.Label>
                    <NumericInput
                      allowDecimal
                      value={reservations.depositPercent}
                      onChange={(e) =>
                        setReservations((p) => ({ ...p, depositPercent: e.target.value }))
                      }
                      className={styles.input}
                    />
                    <Form.Text className="text-muted">{t('settings.reservations.depositPercentHelp')}</Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <SaveButton saving={savingReservations} t={t} />
            </Form>
          </Card.Body>
        </Card>

        {/* ── PROPERTIES ──────────────────────────────────────────────── */}
        <Card className={styles.card}>
          <Card.Header className={styles.cardHeader}>
            <FiImage className={styles.cardHeader__icon} />
            <div>
              <h3 className={styles.cardHeader__title}>{t('settings.properties.title')}</h3>
              <p className={styles.cardHeader__desc}>{t('settings.properties.desc')}</p>
            </div>
          </Card.Header>
          <Card.Body>
            <SectionAlert {...propertiesMsg} />
            <Form onSubmit={handleSaveProperties}>
              <Form.Group className="mb-3" controlId="maxImages" style={{ maxWidth: 280 }}>
                <Form.Label className={styles.label}>{t('settings.properties.maxImages')}</Form.Label>
                <NumericInput
                  value={properties.maxImages}
                  onChange={(e) =>
                    setProperties((p) => ({ ...p, maxImages: e.target.value }))
                  }
                  className={styles.input}
                />
                <Form.Text className="text-muted">{t('settings.properties.maxImagesHelp')}</Form.Text>
              </Form.Group>
              <SaveButton saving={savingProperties} t={t} />
            </Form>
          </Card.Body>
        </Card>

        {/* ── SYSTEM ──────────────────────────────────────────────────── */}
        <Card className={styles.card}>
          <Card.Header className={styles.cardHeader}>
            <FiGlobe className={styles.cardHeader__icon} />
            <div>
              <h3 className={styles.cardHeader__title}>{t('settings.system.title')}</h3>
              <p className={styles.cardHeader__desc}>{t('settings.system.desc')}</p>
            </div>
          </Card.Header>
          <Card.Body>
            <SectionAlert {...systemMsg} />
            <Form onSubmit={handleSaveSystem}>
              <Form.Group className="mb-3" controlId="defaultCurrency" style={{ maxWidth: 280 }}>
                <Form.Label className={styles.label}>{t('settings.system.currency')}</Form.Label>
                <Form.Select
                  value={system.defaultCurrency}
                  onChange={(e) => setSystem((p) => ({ ...p, defaultCurrency: e.target.value }))}
                  className={styles.input}
                >
                  <option value="PYG">₲ PYG — Guaraní paraguayo</option>
                  <option value="USD">$ USD — Dólar estadounidense</option>
                  <option value="BRL">R$ BRL — Real brasileño</option>
                </Form.Select>
              </Form.Group>
              <SaveButton saving={savingSystem} t={t} />
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
