import { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import settingsService from '../../services/settingsService';
import styles from './UserSettingsPage.module.scss';

const NOTIFY_CHANNEL_OPTIONS = [
  { value: 'EMAIL', label: 'Solo correo electrónico' },
  { value: 'IN_APP', label: 'Solo en la aplicación' },
  { value: 'BOTH', label: 'Correo y aplicación' },
];

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

export default function UserSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveMsg, setSaveMsg] = useState({ error: null, success: null });

  const [settings, setSettings] = useState({
    notifyPriceDrop: true,
    notifyNewMatch: true,
    notifyMessages: true,
    notifyChannel: 'BOTH',
    profileVisibleToAgents: true,
    allowDirectContact: true,
  });

  useEffect(() => {
    let active = true;
    settingsService.getUserSettings()
      .then((res) => {
        if (!active) return;
        const d = res?.data;
        if (d) {
          setSettings({
            notifyPriceDrop: d.notifyPriceDrop ?? true,
            notifyNewMatch: d.notifyNewMatch ?? true,
            notifyMessages: d.notifyMessages ?? true,
            notifyChannel: d.notifyChannel ?? 'BOTH',
            profileVisibleToAgents: d.profileVisibleToAgents ?? true,
            allowDirectContact: d.allowDirectContact ?? true,
          });
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error loading user settings:', err);
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
    if (loadError) return;
    setSaveMsg({ error: null, success: null });
    setSaving(true);
    try {
      const res = await settingsService.updateUserSettings({
        notifyPriceDrop: settings.notifyPriceDrop,
        notifyNewMatch: settings.notifyNewMatch,
        notifyMessages: settings.notifyMessages,
        notifyChannel: settings.notifyChannel,
        profileVisibleToAgents: settings.profileVisibleToAgents,
        allowDirectContact: settings.allowDirectContact,
      });
      const d = res?.data;
      if (d) {
        setSettings({
          notifyPriceDrop: d.notifyPriceDrop ?? true,
          notifyNewMatch: d.notifyNewMatch ?? true,
          notifyMessages: d.notifyMessages ?? true,
          notifyChannel: d.notifyChannel ?? 'BOTH',
          profileVisibleToAgents: d.profileVisibleToAgents ?? true,
          allowDirectContact: d.allowDirectContact ?? true,
        });
      }
      setSaveMsg({ error: null, success: 'Configuración guardada correctamente.' });
    } catch (err) {
      console.error('Error saving user settings:', err);
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
        <p className={styles.subtitle}>Personaliza tus notificaciones y preferencias de privacidad.</p>
      </div>

      {loadError && <Alert variant="danger" className="mb-4">{loadError}</Alert>}

      <Form onSubmit={handleSubmit}>
        {saveMsg.error && <Alert variant="danger">{saveMsg.error}</Alert>}
        {saveMsg.success && <Alert variant="success">{saveMsg.success}</Alert>}

        <SettingsSection
          title="Notificaciones"
          description="Elige qué eventos generan alertas en tu cuenta."
        >
          <Form.Check
            type="switch"
            id="notifyPriceDrop"
            label="Notificar bajada de precio en propiedades guardadas"
            checked={settings.notifyPriceDrop}
            onChange={() => handleToggle('notifyPriceDrop')}
            disabled={Boolean(loadError)}
            className={styles.toggle}
          />
          <Form.Check
            type="switch"
            id="notifyNewMatch"
            label="Notificar nuevas propiedades que coincidan con mis preferencias"
            checked={settings.notifyNewMatch}
            onChange={() => handleToggle('notifyNewMatch')}
            disabled={Boolean(loadError)}
            className={styles.toggle}
          />
          <Form.Check
            type="switch"
            id="notifyMessages"
            label="Notificar nuevos mensajes"
            checked={settings.notifyMessages}
            onChange={() => handleToggle('notifyMessages')}
            disabled={Boolean(loadError)}
            className={styles.toggle}
          />
          <Form.Group className="mt-3" controlId="notifyChannel">
            <Form.Label className={styles.label}>Canal de notificaciones</Form.Label>
            <Form.Select
              value={settings.notifyChannel}
              disabled={Boolean(loadError)}
              onChange={(e) => {
                setSettings((p) => ({ ...p, notifyChannel: e.target.value }));
                setSaveMsg({ error: null, success: null });
              }}
              className={styles.select}
            >
              {NOTIFY_CHANNEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </SettingsSection>

        <SettingsSection
          title="Privacidad"
          description="Controla tu visibilidad y cómo los agentes pueden contactarte."
        >
          <Form.Check
            type="switch"
            id="profileVisibleToAgents"
            label="Perfil visible para agentes"
            checked={settings.profileVisibleToAgents}
            onChange={() => handleToggle('profileVisibleToAgents')}
            disabled={Boolean(loadError)}
            className={styles.toggle}
          />
          <p className={styles.toggleHelp}>
            Los agentes podrán ver tu perfil al buscar compradores potenciales.
          </p>
          <Form.Check
            type="switch"
            id="allowDirectContact"
            label="Permitir que los agentes me contacten directamente"
            checked={settings.allowDirectContact}
            onChange={() => handleToggle('allowDirectContact')}
            disabled={Boolean(loadError)}
            className={styles.toggle}
          />
        </SettingsSection>

        <div className={styles.footer}>
          <Button type="submit" variant="primary" disabled={saving || Boolean(loadError)} className={styles.button}>
            {saving ? (
              <><Spinner animation="border" size="sm" className="me-2" />Guardando...</>
            ) : 'Guardar cambios'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
