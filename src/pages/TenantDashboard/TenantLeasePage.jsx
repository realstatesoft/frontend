import React from 'react';
import { useTenantLease } from '../../hooks/useTenantDashboard';
import { Spinner } from 'react-bootstrap';
import { FiHome, FiCalendar, FiDollarSign, FiFileText, FiDownload } from 'react-icons/fi';
import styles from './TenantLeasePage.module.scss';
import useFormatters from '../../hooks/useFormatters';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

export default function TenantLeasePage() {
  const { data: lease, isLoading, error } = useTenantLease();
  const { formatCurrency } = useFormatters();

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
        <p>{error?.response?.data?.message || 'No tienes un arriendo activo en este momento.'}</p>
      </div>
    );
  }

  const {
    id,
    propertyAddress,
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
    emergencyContact
  } = lease;

  const isActive = status === 'ACTIVE';
  const mainDoc = documents?.length > 0 ? documents[0] : null;

  return (
    <div className={styles.tenantLease}>
      <header className={styles.tenantLease__header}>
        <h1 className={styles.tenantLease__title}>Mi Contrato</h1>
        <p className={styles.tenantLease__subtitle}>Información de tu arrendamiento</p>
      </header>

      {/* Main Card: Overview */}
      <section className={styles.tenantLease__overviewCard}>
        <div className={styles.tenantLease__overviewLeft}>
          <div className={styles.tenantLease__overviewHeader}>
            <h2 className={styles.tenantLease__cardTitle}>Contrato de Arrendamiento</h2>
            <span className={`${styles.tenantLease__badge} ${isActive ? styles['tenantLease__badge--active'] : ''}`}>
              {isActive ? 'Activo' : status}
            </span>
          </div>
          <p className={styles.tenantLease__leaseId}>ID: L{id}</p>

          <div className={styles.tenantLease__infoList}>
            <div className={styles.tenantLease__infoItem}>
              <FiHome className={styles.tenantLease__infoIcon} />
              <div>
                <span className={styles.tenantLease__infoLabel}>Propiedad</span>
                <span className={styles.tenantLease__infoValue}>{propertyAddress}</span>
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

        {/* Right side: Document */}
        <div className={styles.tenantLease__overviewRight}>
          <h3 className={styles.tenantLease__docSectionTitle}>Documento del Contrato</h3>
          <div className={styles.tenantLease__docBox}>
            <FiFileText className={styles.tenantLease__docIconBig} />
            <p className={styles.tenantLease__docName}>
              {mainDoc ? mainDoc.fileName : `Contrato_Arrendamiento_L${id}.pdf`}
            </p>
            {mainDoc?.fileUrl ? (
              <a
                href={mainDoc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.tenantLease__downloadBtn}
                style={{ textDecoration: 'none' }}
              >
                <FiDownload /> Descargar PDF
              </a>
            ) : (
              <button
                className={styles.tenantLease__downloadBtn}
                onClick={() => alert('El documento no está disponible.')}
              >
                <FiDownload /> Descargar PDF
              </button>
            )}
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
          {pets && (
            <div className={styles.tenantLease__detailItem}>
              <span className={styles.tenantLease__detailLabel}>Mascotas Permitidas</span>
              <span className={styles.tenantLease__detailValue}>{pets === 'ALLOWED' ? 'Sí' : pets === 'NOT_ALLOWED' ? 'No' : pets}</span>
            </div>
          )}
          {includedServices && (
            <div className={styles.tenantLease__detailItem}>
              <span className={styles.tenantLease__detailLabel}>Servicios Incluidos</span>
              <span className={styles.tenantLease__detailValue}>{includedServices}</span>
            </div>
          )}
          <div className={styles.tenantLease__detailItem}>
            <span className={styles.tenantLease__detailLabel}>Aviso de Desocupación</span>
            <span className={styles.tenantLease__detailValue}>{renewalNoticeDays} días</span>
          </div>
          <div className={styles.tenantLease__detailItem}>
            <span className={styles.tenantLease__detailLabel}>Renovación Automática</span>
            <span className={styles.tenantLease__detailValue}>{autoRenew ? 'Sí' : 'No'}</span>
          </div>
        </div>
      </section>

      {/* Landlord Info */}
      <section className={styles.tenantLease__landlordCard}>
        <h2 className={styles.tenantLease__cardTitle}>Información del Propietario</h2>
        <div className={styles.tenantLease__detailsGrid}>
          <div className={styles.tenantLease__detailItem}>
            <span className={styles.tenantLease__detailLabel}>Nombre</span>
            <span className={styles.tenantLease__detailValue}>{landlord?.name || '-'}</span>
          </div>
          <div className={styles.tenantLease__detailItem}>
            <span className={styles.tenantLease__detailLabel}>Teléfono</span>
            <span className={styles.tenantLease__detailValue}>{landlord?.phone || '-'}</span>
          </div>
          <div className={styles.tenantLease__detailItem}>
            <span className={styles.tenantLease__detailLabel}>Email</span>
            <span className={styles.tenantLease__detailValue}>{landlord?.email || '-'}</span>
          </div>
          {emergencyContact && (
            <div className={styles.tenantLease__detailItem}>
              <span className={styles.tenantLease__detailLabel}>Contacto de Emergencia</span>
              <span className={styles.tenantLease__detailValue}>{emergencyContact}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
