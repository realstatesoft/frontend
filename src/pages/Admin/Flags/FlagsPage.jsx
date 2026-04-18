import { useEffect, useState, useCallback } from 'react';
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
} from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import propertyFlagsApi from '../../../services/propertyFlagsApi';
import userReportsApi from '../../../services/userReportsApi';
import ResolveFlagModal from './ResolveFlagModal';
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

// ─── Tab: Reportes de propiedades ─────────────────────────────────────────────

function PropertyFlagsTab() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFlag, setSelectedFlag] = useState(null);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyFlagsApi.getAllActiveFlags();
      setFlags(data?.data || data || []);
    } catch {
      setError('No se pudieron cargar los reportes pendientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleResolveSuccess = (flagId) => {
    setFlags((prev) => prev.filter((f) => f.id !== flagId));
    setSelectedFlag(null);
  };

  return (
    <>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando reportes...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : flags.length === 0 ? (
        <div className="text-center py-5 bg-light rounded shadow-sm">
          <p className="text-muted mb-0 fs-5 mt-2">No hay reportes pendientes.</p>
        </div>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-3">ID</th>
                <th>Propiedad</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Reportado por</th>
                <th>Fecha</th>
                <th className="text-end px-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <tr key={flag.id}>
                  <td className="px-3 text-muted">#{flag.id}</td>
                  <td>
                    <Link to={`/properties/${flag.propertyId}`} className="text-decoration-none">
                      Ver Propiedad
                    </Link>
                  </td>
                  <td>
                    <Badge
                      bg={
                        flag.flagType === 'FRAUD'
                          ? 'danger'
                          : flag.flagType === 'ILLEGAL'
                          ? 'dark'
                          : 'warning'
                      }
                      text={flag.flagType === 'SPAM' ? 'dark' : 'light'}
                    >
                      {FLAG_TYPE_LABELS[flag.flagType] || flag.flagType}
                    </Badge>
                  </td>
                  <td>
                    <OverlayTrigger placement="top" overlay={<Tooltip>{flag.reason}</Tooltip>}>
                      <span
                        className="d-inline-block text-truncate"
                        style={{ maxWidth: '250px', cursor: 'help' }}
                      >
                        {flag.reason}
                      </span>
                    </OverlayTrigger>
                  </td>
                  <td>{flag.reportedByUsername}</td>
                  <td>{flag.createdAt ? formatTimeAgo(flag.createdAt) : '—'}</td>
                  <td className="text-end px-3">
                    <Button variant="primary" size="sm" onClick={() => setSelectedFlag(flag)}>
                      Resolver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <ResolveFlagModal
        flag={selectedFlag}
        isOpen={!!selectedFlag}
        onClose={() => setSelectedFlag(null)}
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
