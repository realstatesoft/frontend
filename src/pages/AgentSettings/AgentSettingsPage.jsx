import { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('agent');
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
        setLoadError(t('settings.loadError'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  const handleToggle = (key) => {
    setSettings((p) => ({ ...p, [key]: !p[key] }));
    setSaveMsg({ error: null, success: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadError) return;
    setSaveMsg({ error: null, success: null });

    const rawRadius = settings.workRadiusKm;
    const workRadiusKm = rawRadius === '' || rawRadius === null ? null : Number(rawRadius);
    if (workRadiusKm !== null && (!Number.isFinite(workRadiusKm) || workRadiusKm < 1 || workRadiusKm > 500)) {
      setSaveMsg({ error: t('settings.errorWorkRadius'), success: null });
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
      setSaveMsg({ error: null, success: t('settings.success') });
    } catch (err) {
      console.error('Error saving agent settings:', err);
      setSaveMsg({ error: t('settings.saveError'), success: null });
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
        <h2 className={styles.title}>{t('settings.title')}</h2>
        <p className={styles.subtitle}>{t('settings.subtitle')}</p>
      </div>

      {loadError && <Alert variant="danger" className="mb-4">{loadError}</Alert>}

      <Form onSubmit={handleSubmit}>
        {saveMsg.error && <Alert variant="danger">{saveMsg.error}</Alert>}
        {saveMsg.success && <Alert variant="success">{saveMsg.success}</Alert>}

        <SettingsSection
          title={t('settings.leads.title')}
          description={t('settings.leads.desc')}
        >
          <Form.Check
            type="switch"
            id="autoAssignLeads"
            label={t('settings.leads.autoAssign')}
            checked={settings.autoAssignLeads}
            onChange={() => handleToggle('autoAssignLeads')}
            disabled={Boolean(loadError)}
            className={styles.toggle}
          />
          <p className={styles.toggleHelp}>{t('settings.leads.autoAssignHelp')}</p>
        </SettingsSection>

        <SettingsSection
          title={t('settings.notifications.title')}
          description={t('settings.notifications.desc')}
        >
          <Form.Check
            type="switch"
            id="notifyNewLead"
            label={t('settings.notifications.newLead')}
            checked={settings.notifyNewLead}
            onChange={() => handleToggle('notifyNewLead')}
            disabled={Boolean(loadError)}
            className={styles.toggle}
          />
          <Form.Check
            type="switch"
            id="notifyVisitRequest"
            label={t('settings.notifications.visitRequest')}
            checked={settings.notifyVisitRequest}
            onChange={() => handleToggle('notifyVisitRequest')}
            disabled={Boolean(loadError)}
            className={styles.toggle}
          />
          <Form.Check
            type="switch"
            id="notifyNewOffer"
            label={t('settings.notifications.newOffer')}
            checked={settings.notifyNewOffer}
            onChange={() => handleToggle('notifyNewOffer')}
            disabled={Boolean(loadError)}
            className={styles.toggle}
          />
        </SettingsSection>

        <SettingsSection
          title={t('settings.zone.title')}
          description={t('settings.zone.desc')}
        >
          <Form.Group controlId="workRadiusKm">
            <Form.Label className={styles.label}>{t('settings.zone.label')}</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="500"
              placeholder={t('settings.zone.placeholder')}
              value={settings.workRadiusKm}
              disabled={Boolean(loadError)}
              onChange={(e) => {
                setSettings((p) => ({ ...p, workRadiusKm: e.target.value }));
                setSaveMsg({ error: null, success: null });
              }}
              className={styles.input}
            />
            <Form.Text className="text-muted">{t('settings.zone.help')}</Form.Text>
          </Form.Group>
        </SettingsSection>

        <div className={styles.footer}>
          <Button type="submit" variant="primary" disabled={saving || Boolean(loadError)} className={styles.button}>
            {saving ? (
              <><Spinner animation="border" size="sm" className="me-2" />{t('settings.saving')}</>
            ) : t('settings.save')}
          </Button>
        </div>
      </Form>
    </div>
  );
}
