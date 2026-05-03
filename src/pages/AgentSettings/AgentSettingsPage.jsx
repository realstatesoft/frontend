import { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import settingsService from '../../services/settingsService';
import styles from './AgentSettingsPage.module.scss';

function SettingsSection({ title, description, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.section__meta}>
        <h3 className={styles.section__title}>{title}</h3>
        {description && <p className={styles.section__desc}>{description}</p>}
      </div>
      <div className={styles.section__controls}>
        {children}
      </div>
    </div>
  );
}

export default function AgentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveMsg, setSaveMsg] = useState({ error: null, success: null });

  const [settings, setSettings] = useState({
    autoAssignLeads: true,
    notifyNewLead: true,
    notifyVisitRequest: true,
    notifyNewOffer: true,
    workRadiusKm: '',
  });

  useEffect(() => {
    let active = true;
    settingsService.getAgentSettings()
      .then((res) => {
        if (!active) return;
        const d = res?.data;
        if (d) {
          setSettings({
            autoAssignLeads: d.autoAssignLeads ?? true,
            notifyNewLead: d.notifyNewLead ?? true,
            notifyVisitRequest: d.notifyVisitRequest ?? true,
            notifyNewOffer: d.notifyNewOffer ?? true,
            workRadiusKm: d.workRadiusKm ?? '',
          });
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error loading agent settings:', err);
        setLoadError('No se pudo cargar la configuración.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleToggle = (key) => {
    setSettings((p) => ({ ...p, [key]: !p[key] }));
    setSaveMsg({ error: null, success: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveMsg({ error: null, success: null });

    const rawRadius = settings.workRadiusKm;
    const workRadiusKm = rawRadius === '' || rawRadius === null ? null : Number(rawRadius);
    if (workRadiusKm !== null && (!Number.isFinite(workRadiusKm) || workRadiusKm < 1 || workRadiusKm > 500)) {
      setSaveMsg({ error: 'El radio de trabajo debe ser entre 1 y 500 km.', success: null });
      return;
    }

    setSaving(true);
    try {
      const res = await settingsService.updateAgentSettings({
        autoAssignLeads: settings.autoAssignLeads,
        notifyNewLead: settings.notifyNewLead,
        notifyVisitRequest: settings.notifyVisitRequest,
        notifyNewOffer: settings.notifyNewOffer,
        workRadiusKm,
      });
      const d = res?.data;
      if (d) {
        setSettings({
          autoAssignLeads: d.autoAssignLeads ?? true,
          notifyNewLead: d.notifyNewLead ?? true,
          notifyVisitRequest: d.notifyVisitRequest ?? true,
          notifyNewOffer: d.notifyNewOffer ?? true,
          workRadiusKm: d.workRadiusKm ?? '',
        });
      }
      setSaveMsg({ error: null, success: 'Configuración guardada correctamente.' });
    } catch (err) {
      console.error('Error saving agent settings:', err);
      setSaveMsg({ error: 'No se pudo guardar. Intenta nuevamente.', success: null });
    } finally {
      setSaving(false);
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
      <div className={styles.header}>
        <h2 className={styles.title}>Configuración</h2>
        <p className={styles.subtitle}>Personaliza el comportamiento de tu cuenta de agente.</p>
      </div>

      {loadError && <Alert variant="danger" className="mb-4">{loadError}</Alert>}

      <Form onSubmit={handleSubmit}>
        {saveMsg.error && <Alert variant="danger">{saveMsg.error}</Alert>}
        {saveMsg.success && <Alert variant="success">{saveMsg.success}</Alert>}

        <SettingsSection
          title="Prospectos"
          description="Configura cómo se asignan los nuevos prospectos a tu cuenta."
        >
          <Form.Check
            type="switch"
            id="autoAssignLeads"
            label="Asignación automática de prospectos"
            checked={settings.autoAssignLeads}
            onChange={() => handleToggle('autoAssignLeads')}
            className={styles.toggle}
          />
          <p className={styles.toggleHelp}>
            Cuando un nuevo prospecto coincide con tu zona, se te asigna automáticamente.
          </p>
        </SettingsSection>

        <SettingsSection
          title="Notificaciones"
          description="Elige qué eventos generan alertas en tu cuenta."
        >
          <Form.Check
            type="switch"
            id="notifyNewLead"
            label="Notificar nuevo prospecto"
            checked={settings.notifyNewLead}
            onChange={() => handleToggle('notifyNewLead')}
            className={styles.toggle}
          />
          <Form.Check
            type="switch"
            id="notifyVisitRequest"
            label="Notificar solicitud de visita"
            checked={settings.notifyVisitRequest}
            onChange={() => handleToggle('notifyVisitRequest')}
            className={styles.toggle}
          />
          <Form.Check
            type="switch"
            id="notifyNewOffer"
            label="Notificar nueva oferta"
            checked={settings.notifyNewOffer}
            onChange={() => handleToggle('notifyNewOffer')}
            className={styles.toggle}
          />
        </SettingsSection>

        <SettingsSection
          title="Zona de trabajo"
          description="Define el radio geográfico dentro del cual atiendes clientes."
        >
          <Form.Group controlId="workRadiusKm">
            <Form.Label className={styles.label}>Radio de trabajo (km)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="500"
              placeholder="Sin límite"
              value={settings.workRadiusKm}
              onChange={(e) => {
                setSettings((p) => ({ ...p, workRadiusKm: e.target.value }));
                setSaveMsg({ error: null, success: null });
              }}
              className={styles.input}
            />
            <Form.Text className="text-muted">
              Deja vacío para no establecer límite de zona.
            </Form.Text>
          </Form.Group>
        </SettingsSection>

        <div className={styles.footer}>
          <Button type="submit" variant="primary" disabled={saving} className={styles.button}>
            {saving ? (
              <><Spinner animation="border" size="sm" className="me-2" />Guardando...</>
            ) : 'Guardar cambios'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
