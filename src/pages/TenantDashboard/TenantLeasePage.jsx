import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantLease } from '../../hooks/useTenantDashboard';
import tenantService from '../../services/tenantService';
import { Spinner, Alert, Button as BootstrapButton } from 'react-bootstrap';
import { FiHome, FiCalendar, FiDollarSign, FiFileText, FiDownload, FiAlertTriangle, FiEye, FiArrowRight } from 'react-icons/fi';
import styles from './TenantLeasePage.module.scss';
import useFormatters from '../../hooks/useFormatters';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

export default function TenantLeasePage() {
  const { data, isLoading, error, page, setPage } = useTenantLease();
  const { formatCurrency } = useFormatters();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (leaseId) => {
    try {
      setDownloadingId(leaseId);
      const response = await tenantService.downloadLeasePdf(leaseId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrato-arrendamiento-${leaseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando PDF:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar el PDF. Intenta de nuevo más tarde.',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.tenantLease__error}>
        <p>{error?.response?.data?.message || 'Hubo un problema al cargar tus contratos.'}</p>
      </div>
    );
  }

  const leases = data?.content || (Array.isArray(data) ? data : []);

  if (!leases || leases.length === 0) {
    return (
      <div className={styles.tenantLease}>
        <header className={styles.tenantLease__header}>
          <h1 className={styles.tenantLease__title}>Mis Contratos</h1>
          <p className={styles.tenantLease__subtitle}>Gestiona tus arrendamientos activos</p>
        </header>
        <div className={styles.tenantLease__error}>
          <FiHome style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }} />
          <p>No tienes contratos activos en este momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tenantLease}>
      <header className={styles.tenantLease__header}>
        <h1 className={styles.tenantLease__title}>Mis Contratos</h1>
        <p className={styles.tenantLease__subtitle}>Gestiona tus arrendamientos activos</p>
      </header>

      {leases.map((lease) => {
        const isActive = lease.status === 'ACTIVE';
        const endDateObj = dayjs(lease.endDate);
        const daysUntilExpiry = endDateObj.diff(dayjs(), 'day');
        const isExpiringSoon = daysUntilExpiry <= 60 && daysUntilExpiry > 0;
        const mainDoc = lease.documents?.[0];

        return (
          <div key={lease.id} className={styles.tenantLease__overviewCard} style={{ marginBottom: '1.5rem' }}>
            <div className={styles.tenantLease__overviewLeft}>
              <div className={styles.tenantLease__overviewHeader}>
                <h2 className={styles.tenantLease__cardTitle}>{lease.propertyTitle || 'Contrato de Arrendamiento'}</h2>
                <span className={`${styles.tenantLease__badge} ${isActive ? styles['tenantLease__badge--active'] : ''}`}>
                  {isActive ? 'Activo' : lease.status}
                </span>
              </div>
              <p className={styles.tenantLease__leaseId}>ID: L{lease.id}</p>

              {isExpiringSoon && (
                <Alert variant="warning" className={styles.tenantLease__expiryBanner} style={{ marginBottom: '1rem' }}>
                  <FiAlertTriangle className={styles.tenantLease__expiryIcon} />
                  <div>
                    <strong>{t('tenant.lease.expiringSoon', 'Tu contrato está por expirar')}</strong>
                    <p className="mb-0">
                      {t('tenant.lease.expiringMessage', 'Tu contrato vence en {{days}} días, el {{endDate}}.', {
                        days: daysUntilExpiry,
                        endDate: endDateObj.format('DD/MM/YYYY')
                      })}
                    </p>
                  </div>
                </Alert>
              )}

              <div className={styles.tenantLease__infoList}>
                <div className={styles.tenantLease__infoItem}>
                  <FiHome className={styles.tenantLease__infoIcon} />
                  <div>
                    <span className={styles.tenantLease__infoLabel}>Propiedad</span>
                    <span className={styles.tenantLease__infoValue}>{lease.propertyTitle || lease.propertyAddress}</span>
                    {lease.propertyTitle && <span className={styles.tenantLease__infoSub}>{lease.propertyAddress}</span>}
                  </div>
                </div>

                <div className={styles.tenantLease__infoItem}>
                  <FiCalendar className={styles.tenantLease__infoIcon} />
                  <div>
                    <span className={styles.tenantLease__infoLabel}>Período del Contrato</span>
                    <span className={styles.tenantLease__infoValue}>
                      {dayjs(lease.startDate).format('DD/MM/YYYY')} - {dayjs(lease.endDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                </div>

                <div className={styles.tenantLease__infoItem}>
                  <FiDollarSign className={styles.tenantLease__infoIcon} />
                  <div>
                    <span className={styles.tenantLease__infoLabel}>Renta Mensual</span>
                    <span className={styles.tenantLease__infoPrice}>
                      {formatCurrency(lease.monthlyRent, lease.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.tenantLease__overviewRight}>
              <h3 className={styles.tenantLease__docSectionTitle}>Documento del Contrato</h3>
              <div className={styles.tenantLease__docBox}>
                <FiFileText className={styles.tenantLease__docIconBig} />
                <p className={styles.tenantLease__docName}>
                  {mainDoc?.fileName || `Contrato_Arrendamiento_L${lease.id}.pdf`}
                </p>
                <button
                  className={styles.tenantLease__downloadBtn}
                  onClick={() => handleDownload(lease.id)}
                  disabled={downloadingId === lease.id}
                >
                  {downloadingId === lease.id ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <FiDownload />
                  )}
                  {' '}Descargar PDF
                </button>
                <BootstrapButton
                  variant="outline-dark"
                  className="mt-3 w-100 d-inline-flex align-items-center justify-content-center gap-2"
                  onClick={() => navigate(`/tenant/lease/${lease.id}`)}
                >
                  <FiEye /> Ver Detalles
                </BootstrapButton>
              </div>
            </div>
          </div>
        );
      })}

      {data?.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          <BootstrapButton
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </BootstrapButton>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Página {page + 1} de {data.totalPages}</span>
          <BootstrapButton
            variant="secondary"
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </BootstrapButton>
        </div>
      )}
    </div>
  );
}
