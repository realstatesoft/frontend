import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Container,
  Table,
  Spinner,
  Button,
  OverlayTrigger,
  Tooltip,
  Badge,
  Nav,
  Alert,
  Form,
  Modal,
  InputGroup,
  Dropdown,
} from 'react-bootstrap';
import { FiChevronDown, FiFlag, FiCheckCircle, FiAlertTriangle, FiBarChart2, FiSearch } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import propertyFlagsApi from '../../../services/propertyFlagsApi';
import propertyService from '../../../services/propertyService';
import userReportsApi from '../../../services/userReportsApi';
import SuspendUserModal from '../../../components/users/SuspendUserModal';
import { formatTimeAgo } from '../../../utils/dateFormat';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FLAG_TYPE_LABELS = {
  FRAUD: 'Fraude',
  ILLEGAL: 'Ilegal',
  SPAM: 'Spam',
};

const USER_REPORT_REASON_LABELS = {
  SPAM: 'Spam o publicidad engañosa',
  COMPORTAMIENTO_INAPROPIADO: 'Comportamiento inapropiado',
  INFORMACION_FALSA: 'Información falsa o engañosa',
  ACOSO: 'Acoso o intimidación',
  FRAUDE: 'Fraude o estafa',
  OTRO: 'Otro',
};

const USER_REPORT_STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  RESUELTO: 'Resuelto',
  DESESTIMADO: 'Desestimado',
};

const STATUS_VARIANTS = {
  PENDIENTE: 'warning',
  RESUELTO: 'success',
  DESESTIMADO: 'secondary',
};

function truncate(str, max = 80) {
  if (!str) return '—';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

const FLAG_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'RESOLVED', label: 'Resueltos' },
  { value: 'ALL', label: 'Todos' },
];

const FLAG_TYPE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'FRAUD', label: 'Fraude' },
  { value: 'ILLEGAL', label: 'Ilegal' },
  { value: 'SPAM', label: 'Spam' },
];

const STATUS_LABELS = {
  ACTIVE: 'Activa',
  RESOLVED: 'Resuelta',
};

const STATUS_STYLE = {
  ACTIVE: { bg: '#dcfce7', color: '#15803d' },
  RESOLVED: { bg: '#dbeafe', color: '#2563eb' },
};

function getFlagStatus(flag) {
  return flag?.resolvedAt ? 'RESOLVED' : 'ACTIVE';
}

function buildPropertyLabel(property) {
  if (!property) return '—';
  return property.title ? `#${property.id} · ${property.title}` : `#${property.id}`;
}

function getPropertyTitle(flag, property) {
  if (property?.title) return property.title;
  return `Propiedad #${flag.propertyId}`;
}

function MetricCard({ icon: Icon, value, label, bg, color }) {
  return (
    <div
      style={{
        background: bg,
        borderRadius: 18,
        padding: '18px 22px',
        minHeight: 96,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(255,255,255,0.6)',
          color,
          fontSize: 24,
        }}
      >
        <Icon />
      </div>
      <div className="d-flex flex-column">
        <div style={{ fontSize: 30, lineHeight: 1, fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: 18, lineHeight: 1.2, color }}>{label}</div>
      </div>
    </div>
  );
}

function FlagDetailModal({ flag, property, loadingProperty, onClose, onResolve }) {
  if (!flag) return null;

  const flagTypeLabels = {
    FRAUD: 'Fraude',
    ILLEGAL: 'Ilegal',
    SPAM: 'Spam',
  };

  return (
    <Modal show={!!flag} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalle del reporte #{flag.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-3 bg-light rounded mb-3">
          <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
            <Badge bg="secondary">{flagTypeLabels[flag.flagType] || flag.flagType}</Badge>
            <Badge bg={getFlagStatus(flag) === 'ACTIVE' ? 'warning' : 'success'} text={getFlagStatus(flag) === 'ACTIVE' ? 'dark' : 'light'}>
              {getFlagStatus(flag) === 'ACTIVE' ? 'Activo' : 'Resuelto'}
            </Badge>
          </div>
          <p className="mb-1"><strong>Motivo:</strong> {flag.reason}</p>
          <p className="mb-1"><strong>Propiedad:</strong> {loadingProperty ? 'Cargando...' : buildPropertyLabel(property)}</p>
          <p className="mb-1"><strong>Reportado por:</strong> {flag.reportedByUsername || '—'}</p>
          <p className="mb-1"><strong>Fecha de creación:</strong> {formatTimeAgo(flag.createdAt) || '—'}</p>
          <p className="mb-0"><strong>Estado:</strong> {getFlagStatus(flag) === 'ACTIVE' ? 'Pendiente' : 'Resuelto'}</p>
        </div>

        {flag.resolutionNotes ? (
          <div className="mb-3">
            <strong>Notas de resolución</strong>
            <p className="text-muted mb-0">{flag.resolutionNotes}</p>
          </div>
        ) : null}

        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <Link to={`/properties/${flag.propertyId}`} className="btn btn-outline-primary">
            Ver detalle de propiedad
          </Link>
          {getFlagStatus(flag) === 'ACTIVE' ? (
            <Button variant="primary" onClick={onResolve}>
              Marcar como resuelto
            </Button>
          ) : null}
        </div>
      </Modal.Body>
    </Modal>
  );
}

function FlagCard({ flag, property, onOpenDetail, onOpenResolve }) {
  const status = getFlagStatus(flag);
  const statusStyle = STATUS_STYLE[status];
  const hasResolution = Boolean(flag.resolutionNotes);

  return (
    <div
      style={{
        borderRadius: 18,
        background: '#fff',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
        padding: 18,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 18,
      }}
    >
      <div className="d-flex gap-3">
        <div
          style={{
            width: 90,
            minWidth: 90,
            height: 90,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #c7d2fe, #f8fafc)',
            display: 'grid',
            placeItems: 'center',
            color: '#4f46e5',
            fontSize: 34,
            overflow: 'hidden',
          }}
        >
          <FiFlag />
        </div>

        <div className="d-flex flex-column gap-1" style={{ flex: 1 }}>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h4 className="mb-0" style={{ fontSize: 22, fontWeight: 700 }}>
              {getPropertyTitle(flag, property)}
            </h4>
            <span
              style={{
                marginLeft: 'auto',
                padding: '6px 14px',
                borderRadius: 999,
                background: statusStyle.bg,
                color: statusStyle.color,
                fontWeight: 600,
                fontSize: 13,
                minWidth: 92,
                textAlign: 'center',
              }}
            >
              {STATUS_LABELS[status]}
            </span>
          </div>

          <div className="text-muted" style={{ fontSize: 15 }}>
            {buildPropertyLabel(property)}
          </div>

          <div className="d-flex flex-wrap gap-3 mt-1" style={{ fontSize: 13, color: '#475569' }}>
            <span><strong>Tipo:</strong> {FLAG_TYPE_LABELS[flag.flagType] || flag.flagType}</span>
            <span><strong>Reportado por:</strong> {flag.reportedByUsername || '—'}</span>
            <span><strong>Fecha:</strong> {flag.createdAt ? formatTimeAgo(flag.createdAt) : '—'}</span>
          </div>

          <div style={{ fontSize: 15, marginTop: 4 }}>
            <strong>Motivo:</strong> {flag.reason}
          </div>

          {hasResolution ? (
            <div
              style={{
                marginTop: 12,
                padding: '14px 16px',
                background: '#fef3c7',
                borderRadius: 12,
                color: '#92400e',
              }}
            >
              <strong style={{ display: 'block', marginBottom: 4 }}>Notas de resolución</strong>
              <div>{flag.resolutionNotes}</div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="d-flex flex-column justify-content-between align-items-end gap-3" style={{ minWidth: 220 }}>
        <div className="d-flex flex-column gap-2 align-items-end">
          <Button
            variant="outline-primary"
            style={{ borderRadius: 12, minWidth: 122 }}
            onClick={() => onOpenDetail(flag)}
          >
            Ver detalle
          </Button>
          {status === 'ACTIVE' ? (
            <Button
              variant="success"
              style={{ borderRadius: 12, minWidth: 122 }}
              onClick={() => onOpenResolve(flag)}
            >
              Resolver
            </Button>
          ) : null}
        </div>

        <Link
          to={`/properties/${flag.propertyId}`}
          className="text-decoration-none"
          style={{ color: '#2563eb', fontWeight: 600 }}
        >
          Ver propiedad
        </Link>
      </div>
    </div>
  );
}

function ResolveFlagConfirmModal({ flag, isOpen, onClose, onSuccess }) {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setResolutionNotes('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!flag) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) return;

    setLoading(true);
    setError('');

    try {
      await propertyFlagsApi.resolveFlag(flag.id, { resolutionNotes: resolutionNotes.trim() });
      onSuccess?.(flag.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error al resolver el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Marcar como resuelto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-3 bg-light rounded mb-3">
          <p className="mb-1"><strong>Reporte:</strong> #{flag.id}</p>
          <p className="mb-1"><strong>Propiedad:</strong> #{flag.propertyId}</p>
          <p className="mb-0"><strong>Motivo:</strong> {flag.reason}</p>
        </div>

        <p className="text-muted">
          Confirmá la resolución y agregá una nota breve para dejar trazabilidad de la acción.
        </p>

        <Form onSubmit={handleSubmit}>
          {error ? <Alert variant="danger">{error}</Alert> : null}

          <Form.Group className="mb-3">
            <Form.Label>Notas de resolución</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Ej.: Se revisó el contenido, no se detectó incumplimiento adicional y el caso se cerró."
              disabled={loading}
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={!resolutionNotes.trim() || loading}>
              {loading ? 'Resolviendo...' : 'Confirmar resolución'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

// ─── Tab: Reportes de propiedades ─────────────────────────────────────────────

function PropertyFlagsTab() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [resolveFlagTarget, setResolveFlagTarget] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('ACTIVE');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [query, setQuery] = useState('');

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filterStatus === 'ALL' ? { status: 'ALL' } : { status: filterStatus };
      const data = await propertyFlagsApi.getAllFlags(params);
      setFlags(data?.data || data || []);
    } catch {
      setError('No se pudieron cargar los reportes pendientes.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  useEffect(() => {
    let alive = true;

    async function loadProperty() {
      if (!selectedFlag?.propertyId) {
        setSelectedProperty(null);
        return;
      }

      setPropertyLoading(true);
      try {
        const res = await propertyService.getById(selectedFlag.propertyId);
        if (!alive) return;
        setSelectedProperty(res?.data || res || null);
      } catch {
        if (alive) setSelectedProperty(null);
      } finally {
        if (alive) setPropertyLoading(false);
      }
    }

    loadProperty();

    return () => {
      alive = false;
    };
  }, [selectedFlag?.propertyId]);

  const visibleFlags = useMemo(() => {
    const search = query.trim().toLowerCase();

    return flags
      .filter((flag) => (filterType ? flag.flagType === filterType : true))
      .filter((flag) => {
        if (filterStatus === 'ALL') return true;
        return getFlagStatus(flag) === filterStatus;
      })
      .filter((flag) => {
        if (!search) return true;
        return [
          flag.reason,
          flag.reportedByUsername,
          String(flag.id),
          String(flag.propertyId),
          flag.flagType,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search));
      })
      .sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return sortOrder === 'DESC' ? bDate - aDate : aDate - bDate;
      });
  }, [flags, filterType, filterStatus, query, sortOrder]);

  const activeCount = useMemo(() => flags.filter((flag) => getFlagStatus(flag) === 'ACTIVE').length, [flags]);
  const resolvedCount = useMemo(() => flags.filter((flag) => getFlagStatus(flag) === 'RESOLVED').length, [flags]);
  const fraudCount = useMemo(() => flags.filter((flag) => flag.flagType === 'FRAUD').length, [flags]);
  const totalCount = flags.length;

  const handleResolveSuccess = (flagId) => {
    setFlags((prev) => prev.filter((f) => f.id !== flagId));
    setSelectedFlag(null);
    setResolveFlagTarget(null);
    setSelectedProperty(null);
  };

  const handleOpenDetail = (flag) => {
    setSelectedFlag(flag);
  };

  const handleOpenResolve = (flag) => {
    setResolveFlagTarget(flag);
  };

  return (
    <>
      <div
        style={{
          borderRadius: 24,
          padding: '32px 30px',
          background:
            'linear-gradient(90deg, rgba(203, 235, 247, 0.95), rgba(255, 247, 214, 0.95) 55%, rgba(255, 224, 198, 0.95))',
          boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
          marginBottom: 28,
        }}
      >
        <h2 className="mb-2" style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>
          Moderación de Propiedades
        </h2>
        <p className="mb-0" style={{ fontSize: 18, color: '#334155' }}>
          Gestioná y moderá todos los reportes recibidos sobre propiedades del sistema.
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <MetricCard icon={FiFlag} value={activeCount} label="Activas" bg="#e8f6e8" color="#15803d" />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <MetricCard icon={FiCheckCircle} value={resolvedCount} label="Resueltas" bg="#dbeafe" color="#2563eb" />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <MetricCard icon={FiAlertTriangle} value={fraudCount} label="Fraude" bg="#fee2e2" color="#dc2626" />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <MetricCard icon={FiBarChart2} value={totalCount} label="Reportes" bg="#eff6ff" color="#3b82f6" />
        </div>
      </div>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <Dropdown>
          <Dropdown.Toggle
            variant="light"
            style={{
              border: 'none',
              boxShadow: 'none',
              background: 'transparent',
              padding: 0,
              fontSize: 24,
              fontWeight: 800,
              color: '#0f172a',
            }}
          >
            <span className="me-2">
              {filterStatus === 'ACTIVE' ? 'Pendientes' : filterStatus === 'RESOLVED' ? 'Resueltas' : 'Todos'}
            </span>
            <FiChevronDown size={22} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {FLAG_STATUS_OPTIONS.map((opt) => (
              <Dropdown.Item key={opt.value} onClick={() => setFilterStatus(opt.value)}>
                {opt.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <div className="d-flex flex-wrap gap-2">
          <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ minWidth: 150 }}>
            {FLAG_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
          <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ minWidth: 180 }}>
            <option value="DESC">Más recientes primero</option>
            <option value="ASC">Más antiguos primero</option>
          </Form.Select>
        </div>
      </div>

      <InputGroup className="mb-4" style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)' }}>
        <InputGroup.Text style={{ background: '#fff', border: 'none' }}>
          <FiSearch />
        </InputGroup.Text>
        <Form.Control
          placeholder="Buscar por motivo, usuario, ID de flag o propiedad"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ border: 'none', padding: '14px 16px' }}
        />
        {query ? (
          <Button variant="outline-secondary" onClick={() => setQuery('')}>
            Limpiar
          </Button>
        ) : null}
      </InputGroup>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando reportes...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : visibleFlags.length === 0 ? (
        <div className="text-center py-5 bg-light rounded shadow-sm">
          <p className="text-muted mb-0 fs-5 mt-2">No hay reportes pendientes.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {visibleFlags.map((flag) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              property={selectedFlag?.id === flag.id ? selectedProperty : null}
              onOpenDetail={handleOpenDetail}
              onOpenResolve={handleOpenResolve}
            />
          ))}
        </div>
      )}

      <FlagDetailModal
        flag={selectedFlag}
        property={selectedProperty}
        loadingProperty={propertyLoading}
        onClose={() => setSelectedFlag(null)}
        onResolve={() => {
          setResolveFlagTarget(selectedFlag);
          setSelectedFlag(null);
        }}
      />

      <ResolveFlagConfirmModal
        flag={resolveFlagTarget}
        isOpen={!!resolveFlagTarget}
        onClose={() => setResolveFlagTarget(null)}
        onSuccess={handleResolveSuccess}
      />
    </>
  );
}

// ─── Tab: Reportes de usuarios ─────────────────────────────────────────────────

function UserReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal de suspensión desde esta tab
  const [suspendTarget, setSuspendTarget] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = statusFilter ? { status: statusFilter } : undefined;
      const resData = await userReportsApi.getUserReports(params);
      
      // Handle Spring Boot Page<T> format (which has a 'content' array)
      const payload = resData?.data || resData;
      const items = payload?.content || payload || [];
      setReports(Array.isArray(items) ? items : []);
    } catch {
      setError('No se pudieron cargar los reportes de usuarios.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await userReportsApi.updateUserReportStatus(reportId, newStatus);
      showSuccess('Estado del reporte actualizado.');
      fetchReports();
    } catch (err) {
      setError(
        err.response?.data?.message || 'No se pudo actualizar el estado del reporte.'
      );
    }
  };

  const STATUS_OPTIONS = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'RESUELTO', label: 'Resuelto' },
    { value: 'DESESTIMADO', label: 'Desestimado' },
  ];

  return (
    <>
      {/* Filtro por estado */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="text-muted small">Filtrar por estado:</span>
        {[{ value: '', label: 'Todos' }, ...STATUS_OPTIONS].map((opt) => (
          <button
            key={opt.value}
            className={`btn btn-sm ${statusFilter === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setStatusFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {successMsg && (
        <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)} className="mb-3">
          {successMsg}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando reportes...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-5 bg-light rounded shadow-sm">
          <p className="text-muted mb-0 fs-5 mt-2">No hay reportes de usuarios.</p>
        </div>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-3">ID</th>
                <th>Usuario reportado</th>
                <th>Reportado por</th>
                <th>Motivo</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="text-end px-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-3 text-muted">#{report.id}</td>
                  <td>
                    <strong>{report.reportedUserName || `#${report.reportedUserId}`}</strong>
                  </td>
                  <td className="text-muted">
                    {report.reporterUserName || `#${report.reporterUserId}`}
                  </td>
                  <td>
                    <Badge bg="secondary">
                      {USER_REPORT_REASON_LABELS[report.reason] || report.reason}
                    </Badge>
                  </td>
                  <td>
                    {report.description ? (
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{report.description}</Tooltip>}
                      >
                        <span style={{ cursor: 'help' }}>
                          {truncate(report.description, 80)}
                        </span>
                      </OverlayTrigger>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="text-muted small">
                    {report.createdAt ? formatTimeAgo(report.createdAt) : '—'}
                  </td>
                  <td>
                    <Badge bg={STATUS_VARIANTS[report.status] || 'secondary'}>
                      {USER_REPORT_STATUS_LABELS[report.status] || report.status}
                    </Badge>
                  </td>
                  <td className="text-end px-3">
                    <div className="d-flex justify-content-end gap-2 flex-wrap">
                      {/* Cambiar estado */}
                      <select
                        className="form-select form-select-sm"
                        style={{ width: 'auto', maxWidth: 130 }}
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        aria-label={`Cambiar estado del reporte #${report.id}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {/* Suspender usuario reportado */}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() =>
                          setSuspendTarget({
                            id: report.reportedUserId,
                            name: report.reportedUserName || `Usuario #${report.reportedUserId}`,
                          })
                        }
                      >
                        Suspender usuario
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal de suspensión reutilizado */}
      <SuspendUserModal
        user={suspendTarget}
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onSuccess={() => {
          setSuspendTarget(null);
          showSuccess('Usuario suspendido correctamente.');
        }}
      />
    </>
  );
}

// ─── Página principal con tabs ─────────────────────────────────────────────────

const TABS = [
  { key: 'propiedades', label: 'Reportes de propiedades' },
  { key: 'usuarios', label: 'Reportes de usuarios' },
];

export default function FlagsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'propiedades';

  const setActiveTab = (key) => {
    setSearchParams({ tab: key });
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Reportes</h2>
          <p className="text-muted mb-0">Gestión de reportes y moderación del contenido.</p>
        </div>
      </div>

      {/* Tabs de navegación */}
      <Nav variant="tabs" className="mb-4">
        {TABS.map((tab) => (
          <Nav.Item key={tab.key}>
            <Nav.Link
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{ cursor: 'pointer' }}
              id={`tab-${tab.key}`}
              aria-selected={activeTab === tab.key}
            >
              {tab.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Contenido del tab activo */}
      {activeTab === 'propiedades' && <PropertyFlagsTab />}
      {activeTab === 'usuarios' && <UserReportsTab />}
    </Container>
  );
}
