import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Dropdown, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CustomNavbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';
import propertyApi from '../../services/properties/propertyApi';
import PLACEHOLDER_IMAGE from '../../assets/placeholder_img.png';
import Pagination from '../../components/properties/Pagination';
import '../../styles/PropertyApproval.scss';

const FILTER_OPTIONS = [
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Aprobadas', value: 'APPROVED' },
  { label: 'Rechazadas', value: 'REJECTED' },
  { label: 'Todas', value: 'ALL' },
];

export default function PropertyApprovalPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [filter, setFilter] = useState('PENDING');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  // ─── Fetch requests ───────────────────────────────────────────
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const payload = { size: 12, page: Math.max(0, currentPage - 1) };
      if (filter !== 'ALL') {
        payload.status = filter;
      }
      
      const res = await propertyApi.getAll(payload);
      
      const pageData = res?.data?.data ?? res?.data ?? { content: [], totalPages: 0 };
      setProperties(pageData.content ?? []);
      setTotalPages(pageData.totalPages ?? 0);
      
      // Attempt to load stats in background
      loadStats();
    } catch (err) {
      console.error('Error al cargar propiedades:', err);
      setError('No se pudieron cargar las propiedades. Intente más tarde.');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage]);

  // Load basic stats by running distinct small calls
  const loadStats = async () => {
    try {
      const [pendRes, appRes, rejRes, totRes] = await Promise.all([
        propertyApi.getAll({ status: 'PENDING', size: 1 }),
        propertyApi.getAll({ status: 'APPROVED', size: 1 }),
        propertyApi.getAll({ status: 'REJECTED', size: 1 }),
        propertyApi.getAll({ size: 1 })
      ]);
      
      setStats({
        pending: pendRes?.data?.data?.totalElements ?? pendRes?.data?.totalElements ?? 0,
        approved: appRes?.data?.data?.totalElements ?? appRes?.data?.totalElements ?? 0,
        rejected: rejRes?.data?.data?.totalElements ?? rejRes?.data?.totalElements ?? 0,
        total: totRes?.data?.data?.totalElements ?? totRes?.data?.totalElements ?? 0
      });
    } catch (e) {
      console.error("Error cargando estadisticas", e);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // ─── Actions ─────────────────────────────────────────────────
  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await propertyApi.changeStatus(id, 'APPROVED');
      
      setSuccessMsg("Propiedad Aprobada");
      setTimeout(() => setSuccessMsg(null), 3000);
      
      // Update local state smoothly
      if(filter !== 'ALL' && filter !== 'APPROVED') {
        setProperties(prev => prev.filter(p => p.id !== id));
      } else {
        setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
      }
      setStats(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
    } catch (err) {
      console.error(err);
      setError("Error al aprobar propiedad");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(true);
      await propertyApi.changeStatus(id, 'REJECTED');
      
      setSuccessMsg("Propiedad Rechazada");
      setTimeout(() => setSuccessMsg(null), 3000);
      
      // Update local state
      if(filter !== 'ALL' && filter !== 'REJECTED') {
        setProperties(prev => prev.filter(p => p.id !== id));
      } else {
        setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED' } : p));
      }
      setStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
    } catch (err) {
      console.error(err);
      setError("Error al rechazar propiedad");
    } finally {
      setActionLoading(false);
    }
  };

  const activeFilterLabel = FILTER_OPTIONS.find(o => o.value === filter)?.label || 'Todos';

  return (
    <div className="approval-page">
      <CustomNavbar />

      <Container className="py-5">
        <header className="approval-header">
          <h1>Aprobación de Propiedades</h1>
          <p className="text-muted mb-0">Revisa y aprueba las propiedades enviadas por los agentes y propietarios</p>
        </header>

        <section className="stats-container">
          <div className="stat-card pending">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Aprobadas</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-value">{stats.rejected}</div>
            <div className="stat-label">Rechazadas</div>
          </div>
          <div className="stat-card total">
            <div className="stat-value text-primary">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </section>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)} className="mb-4">
            {successMsg}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <Dropdown>
            <Dropdown.Toggle variant="light" className="fw-bold fs-5 border shadow-sm">
              {activeFilterLabel}
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-sm border-0">
              {FILTER_OPTIONS.map(opt => (
                <Dropdown.Item
                  key={opt.value}
                  active={filter === opt.value}
                  onClick={() => {
                    setFilter(opt.value);
                    setCurrentPage(1);
                  }}
                >
                  {opt.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <section>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Cargando propiedades...</p>
            </div>
          ) : properties.length > 0 ? (
            properties.map(property => {
              const image = property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE;
              const type = property.propertyType || property.type || "Inmueble";
              const dateStr = property.createdAt 
                ? new Date(property.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
                : "—";
              const isPending = property.status === 'PENDING';
              
              return (
                <div key={property.id} className="property-approval-card">
                  <img src={image} alt={property.title} className="property-image" />
                  
                  <div className="property-content">
                    <div>
                      <div className="top-row">
                        <div>
                          <Link to={`/properties/${property.id}`} className="text-decoration-none">
                            <h4 className="title">{property.title || 'Propiedad sin título'}</h4>
                          </Link>
                          <div className="location">
                            {property.address || property.locationName || property.location || 'Ubicación no especificada'}
                          </div>
                        </div>
                        <div>
                          <span 
                            className={`status-badge text-white badge-${(property.status || 'default').toLowerCase()}`}
                          >
                            {property.status}
                          </span>
                        </div>
                      </div>

                      <div className="details-row">
                        <span>{type}</span>
                        {property.bedrooms !== undefined && <span>{property.bedrooms} habs</span>}
                        {property.bathrooms !== undefined && <span>{property.bathrooms} baños</span>}
                        {property.surfaceArea && <span>{property.surfaceArea} m²</span>}
                      </div>

                      <div className="price">
                        {property.price ? `$ ${Number(property.price).toLocaleString()}` : 'Precio no disponible'}
                      </div>

                      <div className="meta-info">
                        <span>Agente: {property.agentName || property.ownerName || 'N/A'}</span>
                        <span>Enviado: {dateStr}</span>
                      </div>
                    </div>

                    <div className="action-buttons mt-3 mt-lg-0">
                      <Link 
                        to={`/properties/${property.id}`} 
                        className="btn-details shadow-sm"
                      >
                        Ver Detalles
                      </Link>
                      
                      {isPending && (
                        <>
                          <button 
                            className="btn-approve shadow-sm"
                            disabled={actionLoading}
                            onClick={() => handleApprove(property.id)}
                          >
                            Aprobar
                          </button>
                          <button 
                            className="btn-reject shadow-sm"
                            disabled={actionLoading}
                            onClick={() => handleReject(property.id)}
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-5">
              <p className="text-muted h5">No hay propiedades con estado "{activeFilterLabel}".</p>
            </div>
          )}
        </section>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </Container>
      <Footer />
    </div>
  );
}
