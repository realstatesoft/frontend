import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import adminService from '../../services/adminService';
import Pagination from '../../components/properties/Pagination';
import { formatDateTime } from '../../utils/dateFormat';
import styles from './AdminAuditLogsPage.module.scss';

const ENTITY_TYPES = [
  { value: '', label: 'Todas las entidades' },
  { value: 'USER', label: 'Usuario' },
  { value: 'PROPERTY', label: 'Propiedad' },
  { value: 'CONTRACT', label: 'Contrato' },
];

const ACTIONS = [
  { value: '', label: 'Todas las acciones' },
  { value: 'REGISTER', label: 'Registro' },
  { value: 'LOGIN', label: 'Inicio de sesión' },
  { value: 'CREATE', label: 'Creación' },
  { value: 'UPDATE', label: 'Actualización' },
  { value: 'DELETE', label: 'Eliminación' },
  { value: 'TRASH', label: 'Papelera' },
  { value: 'RESTORE', label: 'Restauración' },
  { value: 'STATUS_CHANGE', label: 'Cambio de estado' },
  { value: 'CLEAR_TRASH', label: 'Vaciar papelera' },
];

function parseOptionalLong(raw) {
  const t = String(raw ?? '').trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function buildQueryParams({
  page,
  userSearch,
  entityType,
  entityId,
  action,
  from,
  to,
}) {
  const params = {
    page: Math.max(0, page - 1),
    size: 20,
    sort: 'createdAt,desc',
  };

  const us = String(userSearch ?? '').trim();
  if (us) params.userSearch = us;

  const eid = parseOptionalLong(entityId);
  if (eid !== undefined) params.entityId = eid;

  if (entityType) params.entityType = entityType;
  if (action) params.action = action;
  if (from) params.from = from;
  if (to) params.to = to;

  return params;
}

export default function AdminAuditLogsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [userSearch, setUserSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [entityOptions, setEntityOptions] = useState([]);
  const [loadingEntityOptions, setLoadingEntityOptions] = useState(false);

  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [applied, setApplied] = useState({
    userSearch: '',
    entityType: '',
    entityId: '',
    action: '',
    from: '',
    to: '',
  });

  const [detailRow, setDetailRow] = useState(null);
  const latestFetchRef = useRef(0);

  const loadEntityOptions = useCallback(async () => {
    if (!entityType) {
      setEntityOptions([]);
      return;
    }
    setLoadingEntityOptions(true);
    try {
      const apiRes = await adminService.getAuditLogEntityOptions({
        entityType,
        limit: 50,
      });
      const list = apiRes?.data ?? apiRes ?? [];
      setEntityOptions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setEntityOptions([]);
    } finally {
      setLoadingEntityOptions(false);
    }
  }, [entityType]);

  useEffect(() => {
    loadEntityOptions();
  }, [loadEntityOptions]);

  const fetchLogs = useCallback(async () => {
    const fetchId = ++latestFetchRef.current;
    try {
      setLoading(true);
      setError(null);

      const params = buildQueryParams({
        page: currentPage,
        userSearch: applied.userSearch,
        entityType: applied.entityType,
        entityId: applied.entityId,
        action: applied.action,
        from: applied.from,
        to: applied.to,
      });

      const apiRes = await adminService.getAuditLogs(params);
      if (fetchId !== latestFetchRef.current) return;

      const pageData = apiRes?.data ?? apiRes ?? {};
      setRows(pageData.content ?? []);
      setTotalPages(pageData.totalPages ?? 0);
      setTotalElements(pageData.totalElements ?? 0);
    } catch (err) {
      if (fetchId !== latestFetchRef.current) return;
      console.error(err);
      const msg =
        err.response?.status === 403
          ? 'No tenés permisos para ver los registros de auditoría.'
          : err.response?.data?.message ??
            'No se pudieron cargar los registros. Probá de nuevo más tarde.';
      setError(msg);
      setRows([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      if (fetchId === latestFetchRef.current) setLoading(false);
    }
  }, [currentPage, applied]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleEntityTypeChange = (value) => {
    setEntityType(value);
    setEntityId('');
    setEntityOptions([]);
  };

  const handleApplyFilters = () => {
    setApplied({
      userSearch,
      entityType,
      entityId,
      action,
      from,
      to,
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setUserSearch('');
    setEntityType('');
    setEntityId('');
    setEntityOptions([]);
    setAction('');
    setFrom('');
    setTo('');
    setApplied({
      userSearch: '',
      entityType: '',
      entityId: '',
      action: '',
      from: '',
      to: '',
    });
    setCurrentPage(1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <header className={styles.hero}>
          <h1 className={styles.hero__title}>Registros de auditoría</h1>
        </header>

        <section className={styles.filters} aria-label="Filtros">
          <div className={styles.filters__grid}>
            <Form.Group className={styles.filters__span2}>
              <Form.Label className={styles.filters__label}>Usuario</Form.Label>
              <Form.Control
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                autoComplete="off"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className={styles.filters__label}>Tipo</Form.Label>
              <Form.Select value={entityType} onChange={(e) => handleEntityTypeChange(e.target.value)}>
                {ENTITY_TYPES.map((o) => (
                  <option key={o.value || 'all'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className={styles.filters__span2}>
              <Form.Label className={styles.filters__label}>Entidad</Form.Label>
              <div className="position-relative">
                <Form.Select
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  disabled={!entityType || loadingEntityOptions}
                >
                  <option value="">—</option>
                  {entityOptions.map((opt) => (
                    <option key={opt.id} value={String(opt.id)}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                {loadingEntityOptions && (
                  <Spinner
                    animation="border"
                    size="sm"
                    className="position-absolute"
                    style={{ right: 28, top: '0.55rem' }}
                  />
                )}
              </div>
            </Form.Group>
            <Form.Group>
              <Form.Label className={styles.filters__label}>Acción</Form.Label>
              <Form.Select value={action} onChange={(e) => setAction(e.target.value)}>
                {ACTIONS.map((o) => (
                  <option key={o.value || 'all'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label className={styles.filters__label}>Desde</Form.Label>
              <Form.Control type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Form.Group>
            <Form.Group>
              <Form.Label className={styles.filters__label}>Hasta</Form.Label>
              <Form.Control type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
            </Form.Group>
          </div>
          <div className={styles.filters__actions}>
            <Button variant="primary" type="button" onClick={handleApplyFilters} disabled={loading}>
              Aplicar
            </Button>
            <Button variant="outline-secondary" type="button" onClick={handleResetFilters} disabled={loading}>
              Limpiar
            </Button>
          </div>
        </section>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <section className={styles.tableWrap}>
          {loading ? (
            <div className={styles.state}>
              <Spinner animation="border" variant="primary" className="mb-2" />
              <div>Cargando auditoría…</div>
            </div>
          ) : (
            <>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Fecha</th>
                      <th className={styles.th}>Usuario</th>
                      <th className={styles.th}>Entidad</th>
                      <th className={styles.th}>ID</th>
                      <th className={styles.th}>Acción</th>
                      <th className={styles.th}>IP</th>
                      <th className={styles.th} />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td className={`${styles.td} ${styles.tableEmpty}`} colSpan={7}>
                          —
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr key={row.id} className={styles.tr}>
                          <td className={styles.td}>{formatDateTime(row.createdAt)}</td>
                          <td className={styles.td}>
                            <div>{row.userEmail ?? '—'}</div>
                            {row.userId != null && (
                              <div className={styles.mono} title={String(row.userId)}>
                                id {row.userId}
                              </div>
                            )}
                          </td>
                          <td className={styles.td}>
                            <span className={styles.badgeMuted}>{row.entityType ?? '—'}</span>
                          </td>
                          <td className={styles.td}>{row.entityId ?? '—'}</td>
                          <td className={styles.td}>
                            <span className={styles.badge}>{row.action ?? '—'}</span>
                          </td>
                          <td className={styles.td}>
                            <span className={styles.mono} title={row.ipAddress ?? ''}>
                              {row.ipAddress ?? '—'}
                            </span>
                          </td>
                          <td className={styles.td}>
                            <Button variant="link" size="sm" className="p-0" onClick={() => setDetailRow(row)}>
                              Ver JSON
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalElements > 0 && (
                <p className={styles.meta}>
                  {rows.length} de {totalElements}
                </p>
              )}
            </>
          )}
        </section>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </div>

      <Modal show={detailRow != null} onHide={() => setDetailRow(null)} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Detalle del registro #{detailRow?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailRow && (
            <>
              <div className="small text-muted mb-2">
                User-Agent: {detailRow.userAgent || '—'}
              </div>
              <div className={styles.jsonLabel}>Valores anteriores (oldValues)</div>
              <pre className={styles.jsonBlock}>
                {detailRow.oldValues != null
                  ? JSON.stringify(detailRow.oldValues, null, 2)
                  : 'null'}
              </pre>
              <div className={styles.jsonLabel}>Valores nuevos (newValues)</div>
              <pre className={styles.jsonBlock}>
                {detailRow.newValues != null
                  ? JSON.stringify(detailRow.newValues, null, 2)
                  : 'null'}
              </pre>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
