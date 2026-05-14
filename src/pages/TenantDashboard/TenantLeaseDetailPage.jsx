import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenantLeaseById } from '../../hooks/useTenantDashboard';
import tenantService from '../../services/tenantService';
import { Spinner, Alert, Button as BootstrapButton } from 'react-bootstrap';
import { FiHome, FiCalendar, FiDollarSign, FiFileText, FiDownload, FiAlertTriangle, FiMail, FiPhone, FiUser, FiPaperclip, FiArrowLeft } from 'react-icons/fi';
import styles from './TenantLeasePage.module.scss';
import useFormatters from '../../hooks/useFormatters';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

export default function TenantLeaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: lease, isLoading, error } = useTenantLeaseById(id);
  const { formatCurrency } = useFormatters();
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await tenantService.downloadLeasePdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrato-arrendamiento-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando PDF:', err);
      alert('No se pudo descargar el PDF. Intenta de nuevo más tarde.');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className={styles.tenantLease__error}>
        <p>{error?.response?.data?.message || 'No se pudo cargar el contrato.'}</p>
        <BootstrapButton variant="outline-primary" className="mt-3" onClick={() => navigate('/tenant/lease')}>
          <FiArrowLeft /> Volver a mis contratos
        </BootstrapButton>
      </div>
    );
  }

  const {
    id: leaseId,
    propertyAddress,
    propertyTitle,
    startDate,
    endDate,
    monthlyRent,
    currency,
    status,
    securityDeposit,
    dueDay,
    autoRenew,
    renewalNoticeDays,
    landlord,
    documents,
    pets,
    includedServices,
    specialConditions,
    emergencyContact
  } = lease;

  const isActive = status === 'ACTIVE';
  const endDateObj = dayjs(endDate);
  const daysUntilExpiry = endDateObj.diff(dayjs(), 'day');
  const isExpiringSoon = daysUntilExpiry <= 60 && daysUntilExpiry > 0;

  return (
    <div className={styles.tenantLease}>
      <header className={styles.tenantLease__header}>
        <BootstrapButton variant="link" className="p-0 mb-2 d-inline-flex align-items-center gap-1 text-decoration-none" onClick={() => navigate('/tenant/lease')}>
          <FiArrowLeft /> Volver a mis contratos
        </BootstrapButton>
        <h1 className={styles.tenantLease__title}>Mi Contrato</h1>
        <p className={styles.tenantLease__subtitle}>Información de tu arrendamiento</p>
      </header>

      {/* Expiration Warning Banner */}
      {isExpiringSoon && (
        <Alert variant="warning" className={styles.tenantLease__expiryBanner}>
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

      {/* Main Card: Overview */}
      <section className={styles.tenantLease__overviewCard}>
        <div className={styles.tenantLease__overviewLeft}>
          <div className={styles.tenantLease__overviewHeader}>
            <h2 className={styles.tenantLease__cardTitle}>Contrato de Arrendamiento</h2>
            <span className={`${styles.tenantLease__badge} ${isActive ? styles['tenantLease__badge--active'] : ''}`}>
              {isActive ? 'Activo' : status}
            </span>
          </div>
          <p className={styles.tenantLease__leaseId}>ID: L{leaseId}</p>

          <div className={styles.tenantLease__infoList}>
            <div className={styles.tenantLease__infoItem}>
              <FiHome className={styles.tenantLease__infoIcon} />
              <div>
                <span className={styles.tenantLease__infoLabel}>Propiedad</span>
                <span className={styles.tenantLease__infoValue}>{propertyTitle || propertyAddress}</span>
                {propertyTitle && <span className={styles.tenantLease__infoSub}>{propertyAddress}</span>}
              </div>
            </div>

            <div className={styles.tenantLease__infoItem}>
              <FiCalendar className={styles.tenantLease__infoIcon} />
              <div>
                <span className={styles.tenantLease__infoLabel}>Período del Contrato</span>
                <span className={styles.tenantLease__infoValue}>
                  {dayjs(startDate).format('DD/MM/YYYY')} - {dayjs(endDate).format('DD/MM/YYYY')}
                </span>
              </div>
            </div>

            <div className={styles.tenantLease__infoItem}>
              <FiDollarSign className={styles.tenantLease__infoIcon} />
              <div>
                <span className={styles.tenantLease__infoLabel}>Renta Mensual</span>
                <span className={styles.tenantLease__infoPrice}>
                  {formatCurrency(monthlyRent, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Main Lease Document */}
        <div className={styles.tenantLease__overviewRight}>
          <h3 className={styles.tenantLease__docSectionTitle}>Documento del Contrato</h3>
          <div className={styles.tenantLease__docBox}>
            <FiFileText className={styles.tenantLease__docIconBig} />
            <p className={styles.tenantLease__docName}>
              {documents?.[0]?.fileName || `Contrato_Arrendamiento_L${leaseId}.pdf`}
            </p>
            <button
              className={styles.tenantLease__downloadBtn}
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <FiDownload />
              )}
              {' '}Descargar PDF
            </button>
          </div>
        </div>
      </section>

      {/* Contract Details */}
      <section className={styles.tenantLease__detailsCard}>
        <h2 className={styles.tenantLease__cardTitle}>Detalles del Contrato</h2>
        <div className={styles.tenantLease__detailsGrid}>
          <div className={styles.tenantLease__detailItem}>
            <span className={styles.tenantLease__detailLabel}>Depósito de Garantía</span>
            <span className={styles.tenantLease__detailValue}>
              {formatCurrency(securityDeposit, currency)}
            </span>
          </div>
          <div className={styles.tenantLease__detailItem}>
            <span className={styles.tenantLease__detailLabel}>Día de Vencimiento</span>
            <span className={styles.tenantLease__detailValue}>{dueDay} de cada mes</span>
          </div>
          <div className={styles.tenantLease__detailItem}>
            <span className={styles.tenantLease__detailLabel}>Mascotas</span>
            <span className={styles.tenantLease__detailValue}>
              {pets === 'ALLOWED' ? 'Permitidas' : pets === 'NOT_ALLOWED' ? 'No permitidas' : pets || 'No especificado'}
            </span>
          </div>
          <div className={styles.tenantLease__detailItem}>
            <span className={styles.tenantLease__detailLabel}>Servicios Incluidos</span>
            <span className={styles.tenantLease__detailValue}>{includedServices || 'No especificado'}</span>
          </div>
          <div className={styles.tenantLease__detailItem}>
            <span className={styles.tenantLease__detailLabel}>Aviso de Desocupación</span>
            <span className={styles.tenantLease__detailValue}>{renewalNoticeDays} días</span>
          </div>
          <div className={styles.tenantLease__detailItem}>
            <span className={styles.tenantLease__detailLabel}>Renovación Automática</span>
            <span className={styles.tenantLease__detailValue}>{autoRenew ? 'Sí' : 'No'}</span>
          </div>
        </div>

        {/* Special Conditions */}
        {specialConditions && (
          <div className={styles.tenantLease__specialConditions}>
            <h3 className={styles.tenantLease__cardTitle}>Condiciones Especiales</h3>
            <p className={styles.tenantLease__specialText}>{specialConditions}</p>
          </div>
        )}
      </section>

      {/* Attached Documents Section */}
      {documents && documents.length > 1 && (
        <section className={styles.tenantLease__documentsCard}>
          <h2 className={styles.tenantLease__cardTitle}>
            <FiPaperclip className={styles.tenantLease__sectionIcon} />
            Documentos Adjuntos
          </h2>
          <div className={styles.tenantLease__documentsList}>
            {documents.slice(1).map((doc, index) => (
              <div key={doc.id || index} className={styles.tenantLease__documentItem}>
                <div className={styles.tenantLease__documentInfo}>
                  <FiFileText className={styles.tenantLease__docIcon} />
                  <div>
                    <span className={styles.tenantLease__docFileName}>{doc.fileName}</span>
                    <span className={styles.tenantLease__docMeta}>
                      {doc.fileType?.toUpperCase()} {doc.fileSize ? `• ${formatFileSize(doc.fileSize)}` : ''}
                    </span>
                  </div>
                </div>
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.tenantLease__docDownloadBtn}
                    title="Descargar"
                  >
                    <FiDownload />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Landlord / Property Manager Contact */}
      <section className={styles.tenantLease__contactCard}>
        <h2 className={styles.tenantLease__cardTitle}>Contacto</h2>
        <div className={styles.tenantLease__contactGrid}>
          {landlord && (
            <div className={styles.tenantLease__contactBox}>
              <h3 className={styles.tenantLease__contactTitle}>
                <FiUser className={styles.tenantLease__contactIcon} />
                Propietario
              </h3>
              <div className={styles.tenantLease__contactDetails}>
                <div className={styles.tenantLease__contactItem}>
                  <span className={styles.tenantLease__contactLabel}>Nombre</span>
                  <span className={styles.tenantLease__contactValue}>{landlord.name || '-'}</span>
                </div>
                <div className={styles.tenantLease__contactItem}>
                  <span className={styles.tenantLease__contactLabel}>Email</span>
                  <span className={styles.tenantLease__contactValue}>
                    {landlord.email ? (
                      <a href={`mailto:${landlord.email}`} className={styles.tenantLease__contactLink}>
                        <FiMail /> {landlord.email}
                      </a>
                    ) : '-'}
                  </span>
                </div>
                <div className={styles.tenantLease__contactItem}>
                  <span className={styles.tenantLease__contactLabel}>Teléfono</span>
                  <span className={styles.tenantLease__contactValue}>
                    {landlord.phone ? (
                      <a href={`tel:${landlord.phone}`} className={styles.tenantLease__contactLink}>
                        <FiPhone /> {landlord.phone}
                      </a>
                    ) : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!landlord && (
            <div className={styles.tenantLease__contactEmpty}>
              <p>No hay información de contacto disponible.</p>
            </div>
          )}

          {emergencyContact && (
            <div className={styles.tenantLease__contactBox}>
              <h3 className={styles.tenantLease__contactTitle}>
                <FiAlertTriangle className={styles.tenantLease__contactIcon} />
                Contacto de Emergencia
              </h3>
              <div className={styles.tenantLease__contactDetails}>
                <p className={styles.tenantLease__emergencyText}>{emergencyContact}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
