import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useLead } from '../../hooks/useLeads';
import LeadDetailView from '../../components/leads/LeadDetailView';
import styles from './LeadDetailPage.module.scss';

const LeadDetailPage = () => {
  const { id } = useParams();
  const { data: lead } = useLead(id);

  return (
    <div className={styles.leadDetail}>
      {/* Header */}
      <header className={styles.leadDetail__header}>
        <div>
          <Link to="/dashboard" className={styles.backBtn}>
            <FiArrowLeft /> Volver
          </Link>
          <h1>{lead?.name || 'Cargando...'}</h1>
          <p className={styles.leadDetail__subtitle}>
            {lead ? `ID de Prospecto: #${lead.id} · Captado vía ${lead.source}` : 'Obteniendo información...'}
          </p>
        </div>
        {lead && (
          <div 
            className={styles.leadDetail__badge} 
            style={{ '--badge-color': lead.statusColor }}
          >
            {lead.status}
          </div>
        )}
      </header>

      <LeadDetailView leadId={id} lead={lead} />
    </div>
  );
};

export default LeadDetailPage;
