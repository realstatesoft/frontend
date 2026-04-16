import { useEffect, useState } from 'react';
import { Container, Table, Spinner, Button, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import propertyFlagsApi from '../../../services/propertyFlagsApi';
import ResolveFlagModal from './ResolveFlagModal';
import { formatTimeAgo } from '../../../utils/dateFormat';

export default function FlagsPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFlag, setSelectedFlag] = useState(null);

  const fetchFlags = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyFlagsApi.getAllActiveFlags();
      setFlags(data?.data || data || []);
    } catch (err) {
      setError('No se pudieron cargar los reportes pendientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleResolveSuccess = (flagId) => {
    // Retirar de la lista
    setFlags((prev) => prev.filter(f => f.id !== flagId));
    setSelectedFlag(null);
  };

  const flagTypeTranslations = {
    FRAUD: 'Fraude',
    ILLEGAL: 'Ilegal',
    SPAM: 'Spam'
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Reportes de propiedades</h2>
          <p className="text-muted mb-0">Gestión de reportes activos y moderación del contenido.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
           <Spinner animation="border" variant="primary" />
           <p className="mt-2 text-muted">Cargando reportes...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
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
              {flags.map(flag => (
                <tr key={flag.id}>
                  <td className="px-3 text-muted">#{flag.id}</td>
                  <td>
                    <Link to={`/properties/${flag.propertyId}`} className="text-decoration-none">
                      Ver Propiedad
                    </Link>
                  </td>
                  <td>
                    <Badge bg={flag.flagType === 'FRAUD' ? 'danger' : flag.flagType === 'ILLEGAL' ? 'dark' : 'warning'} text={flag.flagType === 'SPAM' ? 'dark' : 'light'}>
                      {flagTypeTranslations[flag.flagType] || flag.flagType}
                    </Badge>
                  </td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>{flag.reason}</Tooltip>}
                    >
                      <span className="d-inline-block text-truncate" style={{ maxWidth: '250px', cursor: 'help' }}>
                        {flag.reason}
                      </span>
                    </OverlayTrigger>
                  </td>
                  <td>{flag.reportedByUsername}</td>
                  <td>{flag.createdAt ? formatTimeAgo(flag.createdAt) : '-'}</td>
                  <td className="text-end px-3">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => setSelectedFlag(flag)}
                    >
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
    </Container>
  );
}
