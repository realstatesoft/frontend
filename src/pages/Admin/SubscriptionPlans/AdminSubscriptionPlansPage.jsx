import { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Table, Badge, Spinner, Alert, Modal, Form, Row, Col,
} from 'react-bootstrap';
import { FiPlus, FiEdit2, FiPauseCircle, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { MdSubscriptions } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import subscriptionApi from '../../../services/subscriptions/subscriptionApi';
import styles from '../../Admin/Settings/AdminSettingsPage.module.scss';

const EMPTY_FORM = { name: '', description: '', price: '', durationMonths: 1, active: true };

function PlanModal({ show, onHide, onSave, initialData, saving, saveError, t }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (show) setForm(initialData ? { ...initialData, description: initialData.description ?? '' } : EMPTY_FORM);
  }, [show, initialData]);

  function setField(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: parseFloat(form.price),
      durationMonths: parseInt(form.durationMonths, 10),
      active: form.active,
    });
  }

  const isEdit = !!initialData?.id;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? t('adminSubscriptionPlansPage.modal.editTitle') : t('adminSubscriptionPlansPage.modal.createTitle')}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {saveError && <Alert variant="danger" className="mb-3">{saveError}</Alert>}
          <Form.Group className="mb-3" controlId="planName">
            <Form.Label className="fw-semibold">
              {t('adminSubscriptionPlansPage.modal.fieldName')} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={form.name}
              onChange={setField('name')}
              placeholder={t('adminSubscriptionPlansPage.modal.namePlaceholder')}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="planDescription">
            <Form.Label className="fw-semibold">{t('adminSubscriptionPlansPage.modal.fieldDesc')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.description}
              onChange={setField('description')}
              placeholder={t('adminSubscriptionPlansPage.modal.descPlaceholder')}
            />
          </Form.Group>
          <Row className="g-3 mb-3">
            <Col xs={6}>
              <Form.Group controlId="planPrice">
                <Form.Label className="fw-semibold">
                  {t('adminSubscriptionPlansPage.modal.fieldPrice')} <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={setField('price')}
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group controlId="planDuration">
                <Form.Label className="fw-semibold">
                  {t('adminSubscriptionPlansPage.modal.fieldDuration')} <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="120"
                  value={form.durationMonths}
                  onChange={setField('durationMonths')}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Check
            id="planActive"
            type="switch"
            label={t('adminSubscriptionPlansPage.modal.fieldActive')}
            checked={form.active}
            onChange={setField('active')}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
            {t('adminSubscriptionPlansPage.modal.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? (
              <><Spinner animation="border" size="sm" className="me-2" />{t('adminSubscriptionPlansPage.modal.saving')}</>
            ) : isEdit
              ? t('adminSubscriptionPlansPage.modal.saveEdit')
              : t('adminSubscriptionPlansPage.modal.saveCreate')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

function DeleteModal({ show, plan, onHide, onConfirm, deleting, deleteError, t }) {
  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title>{t('adminSubscriptionPlansPage.deleteModal.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {deleteError && <Alert variant="danger">{deleteError}</Alert>}
        <p className="mb-0">
          {t('adminSubscriptionPlansPage.deleteModal.body', { name: plan?.name ?? '' })}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={deleting}>
          {t('adminSubscriptionPlansPage.deleteModal.cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={deleting}>
          {deleting ? <Spinner animation="border" size="sm" /> : t('adminSubscriptionPlansPage.deleteModal.confirm')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function AdminSubscriptionPlansPage() {
  const { t } = useTranslation('navigation');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ open: false, plan: null });
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [actionMsg, setActionMsg] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const loadPlans = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    subscriptionApi.getAllPlansAdmin()
      .then(res => setPlans(res?.data?.data?.content ?? []))
      .catch(() => setLoadError(t('adminSubscriptionPlansPage.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  function openCreate() {
    setEditingPlan(null);
    setSaveError(null);
    setModalOpen(true);
  }

  function openEdit(plan) {
    setEditingPlan(plan);
    setSaveError(null);
    setModalOpen(true);
  }

  async function handleSave(data) {
    setSaving(true);
    setSaveError(null);
    try {
      if (editingPlan?.id) {
        await subscriptionApi.updatePlan(editingPlan.id, data);
      } else {
        await subscriptionApi.createPlan(data);
      }
      setModalOpen(false);
      setActionMsg({
        type: 'success',
        text: editingPlan?.id
          ? t('adminSubscriptionPlansPage.updateSuccess')
          : t('adminSubscriptionPlansPage.createSuccess'),
      });
      loadPlans();
    } catch (err) {
      setSaveError(err.response?.data?.message ?? t('adminSubscriptionPlansPage.modal.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(plan) {
    if (deactivating) return;
    setDeactivating(true);
    try {
      await subscriptionApi.deactivatePlan(plan.id);
      setActionMsg({ type: 'success', text: t('adminSubscriptionPlansPage.deactivateSuccess', { name: plan.name }) });
      loadPlans();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message ?? t('adminSubscriptionPlansPage.genericError') });
    } finally {
      setDeactivating(false);
    }
  }

  function openDelete(plan) {
    setDeleteError(null);
    setDeleteModal({ open: true, plan });
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await subscriptionApi.deletePlan(deleteModal.plan.id);
      setDeleteModal({ open: false, plan: null });
      setActionMsg({ type: 'success', text: t('adminSubscriptionPlansPage.deleteSuccess') });
      loadPlans();
    } catch (err) {
      setDeleteError(err.response?.data?.message ?? t('adminSubscriptionPlansPage.deleteModal.error'));
    } finally {
      setDeleting(false);
    }
  }

  function durationLabel(months) {
    if (months === 1) return t('adminSubscriptionPlansPage.durationOneMonth');
    return t('adminSubscriptionPlansPage.durationMonths', { count: months });
  }

  return (
    <div className={styles.container}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h2 className={styles.title}>{t('adminSubscriptionPlansPage.title')}</h2>
          <p className={styles.subtitle}>{t('adminSubscriptionPlansPage.subtitle')}</p>
        </div>
        <Button variant="primary" className="d-flex align-items-center gap-2" onClick={openCreate}>
          <FiPlus /> {t('adminSubscriptionPlansPage.newPlanBtn')}
        </Button>
      </div>

      {actionMsg && (
        <Alert variant={actionMsg.type} dismissible onClose={() => setActionMsg(null)} className="mb-3">
          {actionMsg.text}
        </Alert>
      )}

      {loadError && (
        <Alert variant="danger" className="d-flex align-items-center gap-2">
          {loadError}
          <Button variant="link" size="sm" className="p-0 ms-2" onClick={loadPlans}>
            <FiRefreshCw size={14} /> {t('adminSubscriptionPlansPage.retry')}
          </Button>
        </Alert>
      )}

      <Card className={styles.card}>
        <Card.Header className={styles.cardHeader}>
          <MdSubscriptions className={styles.cardHeader__icon} />
          <div>
            <h3 className={styles.cardHeader__title}>{t('adminSubscriptionPlansPage.tableTitle')}</h3>
            <p className={styles.cardHeader__desc}>{t('adminSubscriptionPlansPage.tableDesc')}</p>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center text-muted py-5">
              {t('adminSubscriptionPlansPage.tableEmpty')}
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>{t('adminSubscriptionPlansPage.colName')}</th>
                  <th>{t('adminSubscriptionPlansPage.colDesc')}</th>
                  <th>{t('adminSubscriptionPlansPage.colPrice')}</th>
                  <th>{t('adminSubscriptionPlansPage.colDuration')}</th>
                  <th>{t('adminSubscriptionPlansPage.colStatus')}</th>
                  <th className="text-end">{t('adminSubscriptionPlansPage.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="fw-semibold align-middle">{plan.name}</td>
                    <td className="text-muted align-middle" style={{ maxWidth: 200 }}>
                      <span className="text-truncate d-block">{plan.description || '—'}</span>
                    </td>
                    <td className="align-middle">
                      {new Intl.NumberFormat('es-PY', {
                        style: 'currency', currency: 'PYG', minimumFractionDigits: 0,
                      }).format(plan.price)}
                    </td>
                    <td className="align-middle">{durationLabel(plan.durationMonths)}</td>
                    <td className="align-middle">
                      <Badge bg={plan.active ? 'success' : 'secondary'}>
                        {plan.active
                          ? t('adminSubscriptionPlansPage.statusActive')
                          : t('adminSubscriptionPlansPage.statusInactive')}
                      </Badge>
                    </td>
                    <td className="text-end align-middle">
                      <div className="d-flex justify-content-end gap-2">
                        <Button variant="outline-primary" size="sm" title={t('adminSubscriptionPlansPage.modal.editTitle')} onClick={() => openEdit(plan)}>
                          <FiEdit2 size={14} />
                        </Button>
                        {plan.active && (
                          <Button variant="outline-warning" size="sm" title={t('adminSubscriptionPlansPage.statusInactive')} disabled={deactivating} onClick={() => handleDeactivate(plan)}>
                            <FiPauseCircle size={14} />
                          </Button>
                        )}
                        <Button variant="outline-danger" size="sm" title={t('adminSubscriptionPlansPage.deleteModal.title')} onClick={() => openDelete(plan)}>
                          <FiTrash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <PlanModal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingPlan}
        saving={saving}
        saveError={saveError}
        t={t}
      />

      <DeleteModal
        show={deleteModal.open}
        plan={deleteModal.plan}
        onHide={() => setDeleteModal({ open: false, plan: null })}
        onConfirm={handleDelete}
        deleting={deleting}
        deleteError={deleteError}
        t={t}
      />
    </div>
  );
}
