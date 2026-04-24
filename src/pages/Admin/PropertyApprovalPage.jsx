import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Container, Dropdown, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import propertyApi from '../../services/properties/propertyApi';
import PLACEHOLDER_IMAGE from '../../assets/placeholder_img.png';
import Pagination from '../../components/properties/Pagination';
import usePropertyPriceDisplay from '../../hooks/usePropertyPriceDisplay';
import '../../styles/PropertyApproval.scss';

const FILTER_OPTIONS = [
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Aprobadas', value: 'APPROVED' },
  { label: 'Rechazadas', value: 'REJECTED' },
  { label: 'Todas', value: 'ALL' },
];

export default function PropertyApprovalPage() {
  const { t } = useTranslation('admin');
  const { formatPrice } = usePropertyPriceDisplay(0);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [filter, setFilter] = useState('PENDING');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const latestFetchRef = useRef(0);

  // Load basic stats by running distinct small calls
  const loadStats = useCallback(async () => {
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
  }, []);

  // ─── Fetch requests ───────────────────────────────────────────
  const fetchProperties = useCallback(async () => {
    const fetchId = ++latestFetchRef.current;
    try {
      setLoading(true);
      setError(null);
      
      const payload = { size: 12, page: Math.max(0, currentPage - 1) };
      if (filter !== 'ALL') {
        payload.status = filter;
      }
      
      const res = await propertyApi.getAll(payload);
      if (fetchId !== latestFetchRef.current) return;
      
      const pageData = res?.data?.data ?? res?.data ?? { content: [], totalPages: 0 };
      setProperties(pageData.content ?? []);
      setTotalPages(pageData.totalPages ?? 0);
      
      // Load stats in background (errors handled internally)
      loadStats().catch(e => console.error("Background stats load failed:", e));
    } catch (err) {
      if (fetchId !== latestFetchRef.current) return;
      console.error('Error al cargar propiedades:', err);
      setError(t('propertyApproval.loadError'));
    } finally {
      if (fetchId === latestFetchRef.current) setLoading(false);
    }
  }, [filter, currentPage, loadStats]);


  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // ─── Actions ─────────────────────────────────────────────────
  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await propertyApi.changeStatus(id, 'APPROVED');
      
      setSuccessMsg(t('propertyApproval.approved'));
      setTimeout(() => setSuccessMsg(null), 3000);
      
      // Refresh data authoritatively to keep pagination/stats in sync
      await fetchProperties();
    } catch (err) {
      console.error(err);
      setError(t('propertyApproval.approveError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(true);
      await propertyApi.changeStatus(id, 'REJECTED');
      
      setSuccessMsg(t('propertyApproval.rejected'));
      setTimeout(() => setSuccessMsg(null), 3000);
      
      // Refresh data authoritatively
      await fetchProperties();
    } catch (err) {
      console.error(err);
      setError(t('propertyApproval.rejectError'));
    } finally {
      setActionLoading(false);
    }
  };

  const activeFilterLabel = FILTER_OPTIONS.find(o => o.value === filter)?.label || t('propertyApproval.filters.all');

  return (
    <div className="approval-page">
      <Container className="py-4">
        <header className="approval-header">
          <h1>{t('propertyApproval.title')}</h1>
          <p className="text-muted mb-0">{t('propertyApproval.subtitle')}</p>
        </header>

        <section className="stats-container">
          <div className="stat-card pending">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">{t('propertyApproval.stats.pending')}</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">{t('propertyApproval.stats.approved')}</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-value">{stats.rejected}</div>
            <div className="stat-label">{t('propertyApproval.stats.rejected')}</div>
          </div>
          <div className="stat-card total">
            <div className="stat-value text-primary">{stats.total}</div>
            <div className="stat-label">{t('propertyApproval.stats.total')}</div>
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
              <p className="mt-3 text-muted">{t('propertyApproval.loading')}</p>
            </div>
          ) : properties.length > 0 ? (
            properties.map(property => {
              const image = property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE;
              const type = property.propertyType || property.type || t('propertyApproval.property');
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
                            <h4 className="title">{property.title || t('propertyApproval.untitled')}</h4>
                          </Link>
                          <div className="location">
                            {property.address || property.locationName || property.location || t('propertyApproval.noLocation')}
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
                        {property.price != null && property.price !== ''
                          ? formatPrice(property.price).label
                          : t('propertyApproval.noPrice')}
                      </div>

                      <div className="meta-info">
                        <span>{t('propertyApproval.agent')}: {property.agentName || property.ownerName || 'N/A'}</span>
                        <span>{t('propertyApproval.sent')}: {dateStr}</span>
                      </div>
                    </div>

                    <div className="action-buttons mt-3 mt-lg-0">
                      <Link 
                        to={`/properties/${property.id}`} 
                        className="btn-details shadow-sm"
                      >
                        {t('propertyApproval.viewDetails')}
                      </Link>
                      
                      {isPending && (
                        <>
                          <button 
                            className="btn-approve shadow-sm"
                            disabled={actionLoading}
                            onClick={() => handleApprove(property.id)}
                          >
                            {t('propertyApproval.approve')}
                          </button>
                          <button 
                            className="btn-reject shadow-sm"
                            disabled={actionLoading}
                            onClick={() => handleReject(property.id)}
                          >
                            {t('propertyApproval.reject')}
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
              <p className="text-muted h5">{t('propertyApproval.empty', { status: activeFilterLabel })}</p>
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
    </div>
  );
}
