import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Container,
  Form,
  Modal,
  Spinner,
  Table,
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import contractTemplateApi from '../../services/contracts/contractTemplateApi';
import { CONTRACT_TYPE_LABELS } from '../../constants/contractConstants';
import ContractTemplateRichEditor from '../../components/admin/ContractTemplateRichEditor';
import { hasMeaningfulHtmlContent } from '../../utils/htmlToPlainText';
import styles from './AdminContractTemplatesPage.module.scss';

const CONTRACT_TYPES = ['SALE', 'RENT', 'OPTION_TO_BUY'];

const emptyForm = {
  name: '',
  contractType: 'SALE',
  content: '',
  templateVersion: '1.0',
  active: true,
};

function unwrapError(err) {
  return err?.response?.data?.message ?? err?.message ?? 'Error desconocido';
}

export default function AdminContractTemplatesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const isSavingRef = useRef(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterType) params.contractType = filterType;
      if (filterActive === 'true' || filterActive === 'false') {
        params.active = filterActive === 'true';
      }
      const data = await contractTemplateApi.listAdmin(params);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(unwrapError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterActive]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = async (id) => {
    try {
      const detail = await contractTemplateApi.getById(id);
      setEditingId(id);
      setForm({
        name: detail.name ?? '',
        contractType: detail.contractType ?? 'SALE',
        content: detail.content ?? '',
        templateVersion: detail.templateVersion ?? '1.0',
        active: detail.active !== false,
      });
      setModalOpen(true);
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar', text: unwrapError(e) });
    }
  };

  const handleSave = async () => {
    if (isSavingRef.current) return;

    if (!form.name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre obligatorio' });
      return;
    }
    if (!hasMeaningfulHtmlContent(form.content)) {
      Swal.fire({ icon: 'warning', title: 'Contenido obligatorio' });
      return;
    }
    isSavingRef.current = true;
    setSaving(true);
    try {
      if (editingId) {
        await contractTemplateApi.update(editingId, {
          name: form.name.trim(),
          contractType: form.contractType,
          content: form.content,
          templateVersion: (form.templateVersion || '1.0').trim(),
          active: form.active,
        });
        Swal.fire({ icon: 'success', title: 'Plantilla actualizada', timer: 1600, showConfirmButton: false });
      } else {
        await contractTemplateApi.create({
          name: form.name.trim(),
          contractType: form.contractType,
          content: form.content,
          templateVersion: (form.templateVersion || '1.0').trim(),
          active: form.active,
        });
        Swal.fire({ icon: 'success', title: 'Plantilla creada', timer: 1600, showConfirmButton: false });
      }
      setModalOpen(false);
      fetchList();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error al guardar', text: unwrapError(e) });
    } finally {
      isSavingRef.current = false;
      setSaving(false);
    }
  };

  const handleToggleActive = async (row) => {
    try {
      if (row.active) {
        await contractTemplateApi.deactivate(row.id);
      } else {
        await contractTemplateApi.activate(row.id);
      }
      fetchList();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: unwrapError(e) });
    }
  };

  const handleDelete = async (row) => {
    const r = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar plantilla?',
      text: `Se archivará "${row.name}". Los contratos existentes no se borran.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!r.isConfirmed) return;
    try {
      await contractTemplateApi.softDelete(row.id);
      Swal.fire({ icon: 'success', title: 'Eliminada', timer: 1400, showConfirmButton: false });
      fetchList();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: unwrapError(e) });
    }
  };

  return (
    <Container fluid className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Plantillas de contrato</h1>
          <p className={styles.subtitle}>
            Define textos base reutilizables. Solo las plantillas activas y del tipo correcto pueden usarse al crear contratos.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Nueva plantilla
        </Button>
      </div>

      <div className={`${styles.filters} mb-3`}>
        <Form.Select
          style={{ maxWidth: 220 }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos los tipos</option>
          {CONTRACT_TYPES.map((t) => (
            <option key={t} value={t}>
              {CONTRACT_TYPE_LABELS[t] ?? t}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          style={{ maxWidth: 200 }}
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Activas e inactivas</option>
          <option value="true">Solo activas</option>
          <option value="false">Solo inactivas</option>
        </Form.Select>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : rows.length === 0 ? (
        <Alert variant="light" className="border">
          No hay plantillas con estos filtros.
        </Alert>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Versión</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="fw-medium">{row.name}</td>
                  <td>{CONTRACT_TYPE_LABELS[row.contractType] ?? row.contractType}</td>
                  <td>{row.templateVersion}</td>
                  <td>
                    {row.active ? (
                      <Badge bg="success">Activa</Badge>
                    ) : (
                      <Badge bg="secondary">Inactiva</Badge>
                    )}
                  </td>
                  <td className="text-muted small">
                    {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '—'}
                  </td>
                  <td className="text-end">
                    <div className={styles.actions}>
                      <Button size="sm" variant="outline-primary" onClick={() => openEdit(row.id)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => handleToggleActive(row)}
                      >
                        {row.active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(row)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={modalOpen} onHide={() => !saving && setModalOpen(false)} size="xl" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Editar plantilla' : 'Nueva plantilla'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej. Compraventa estándar"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tipo de contrato</Form.Label>
            <Form.Select
              value={form.contractType}
              onChange={(e) => setForm((f) => ({ ...f, contractType: e.target.value }))}
            >
              {CONTRACT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CONTRACT_TYPE_LABELS[t] ?? t}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Versión</Form.Label>
            <Form.Control
              value={form.templateVersion}
              onChange={(e) => setForm((f) => ({ ...f, templateVersion: e.target.value }))}
              placeholder="1.0"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="tpl-active"
              label="Plantilla activa"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Label>Contenido base</Form.Label>
            <ContractTemplateRichEditor
              key={editingId != null ? `tpl-${editingId}` : 'tpl-new'}
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              placeholder="Texto legal o cláusulas base. Usa negrita, listas y títulos si lo necesitas."
              disabled={saving}
            />
            <Form.Text muted>
              El contenido se guarda con formato. Al usar la plantilla en un contrato, el texto se copia como texto plano
              en condiciones adicionales para que el agente pueda seguir editándolo.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
