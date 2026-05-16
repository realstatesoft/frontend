import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiAlertTriangle } from 'react-icons/fi';
import { useTenantMaintenance } from '../../../hooks/useTenantMaintenance';
import { useTenantDashboard } from '../../../hooks/useTenantDashboard';
import MaintenanceRequestForm from './MaintenanceRequestForm';
import TicketList from './TicketList';
import Button from '../../../components/common/Button/Button';
import styles from './TenantMaintenancePage.module.scss';
import Swal from 'sweetalert2';

export default function TenantMaintenancePage() {
  const { t } = useTranslation('tenant');
  const { data, isLoading, error, createRequest, rateRequest } = useTenantMaintenance();
  const { data: dashboardData } = useTenantDashboard();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRequest = async (formData) => {
    setIsSubmitting(true);
    try {
      await createRequest(formData);
      setShowForm(false);
      Swal.fire({
        icon: 'success',
        title: t('maintenance.successTitle', 'Solicitud enviada'),
        text: t('maintenance.successText', 'Tu solicitud de mantenimiento ha sido registrada con éxito.'),
        confirmButtonColor: '#3b82f6',
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: t('maintenance.errorTitle', 'Error'),
        text: t('maintenance.errorSubmitText', 'Hubo un problema al enviar tu solicitud. Por favor intenta de nuevo.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRateRequest = async (id, rating) => {
    try {
      await rateRequest(id, rating);
      Swal.fire({
        icon: 'success',
        title: t('maintenance.ratingSuccessTitle', 'Calificación enviada'),
        text: t('maintenance.ratingSuccessText', 'Gracias por tu feedback.'),
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: t('maintenance.errorTitle', 'Error'),
        text: t('maintenance.errorRateText', 'No se pudo enviar la calificación.'),
      });
    }
  };

  if (isLoading && !data) return <div className={styles.loading}>{t('common.loading', 'Cargando...')}</div>;

  if (error) {
    return (
      <div className={styles.error}>
        <FiAlertTriangle />
          <p>{t('maintenance.loadError', 'Error al cargar las solicitudes de mantenimiento.')}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{t('maintenance.title', 'Mantenimiento')}</h1>
          <p className={styles.subtitle}>{t('maintenance.subtitle', 'Gestiona tus solicitudes de mantenimiento y reparaciones.')}</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <FiPlus /> {t('maintenance.newRequest', 'Nueva Solicitud')}
          </Button>
        )}
      </header>

      {showForm ? (
        <div className={styles.formContainer}>
          <MaintenanceRequestForm 
            onSubmit={handleCreateRequest} 
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
            leases={dashboardData?.activeLeases || []}
          />
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>{t('maintenance.openTickets', 'Tickets Abiertos')}</span>
              <span className={styles.statValue}>{(data?.countsByStatus?.SUBMITTED || 0) + (data?.countsByStatus?.IN_PROGRESS || 0) + (data?.countsByStatus?.ACKNOWLEDGED || 0)}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>{t('maintenance.completed', 'Completados')}</span>
              <span className={styles.statValue}>{data?.countsByStatus?.COMPLETED || 0}</span>
            </div>
          </div>

          <section className={styles.section}>
            <h3>{t('maintenance.myRequests', 'Mis Solicitudes')}</h3>
            <TicketList tickets={data?.tickets} onRate={handleRateRequest} />
          </section>
        </div>
      )}
    </div>
  );
}
