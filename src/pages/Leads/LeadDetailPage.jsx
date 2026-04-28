import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useLead } from '../../hooks/useLeads';
import LeadDetailView from '../../components/leads/LeadDetailView';
import styles from './LeadDetailPage.module.scss';

const LeadDetailPage = () => {
  const { id } = useParams();
  const { data: lead, isLoading } = useLead(id);

  return (
    <div className={styles.leadDetail}>
      {/* Header */}
      <header className={styles.leadDetail__header}>
        <div>
          <Link to="/dashboard" className={styles.backBtn}>
            <FiArrowLeft /> Volver
          </Link>
          <h1>{lead?.name || 'Cargando...'}</h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            {lead ? `ID de Prospecto: #${lead.id} · Captado vía ${lead.source}` : 'Obteniendo información...'}
          </p>
        </div>
        {lead && (
          <div 
            className={styles.leadDetail__badge} 
            style={{ backgroundColor: `${lead.statusColor}20`, color: lead.statusColor }}
          >
            {lead.status}
          </div>
        )}
      </header>

      <LeadDetailView leadId={id} />
    </div>
  );
};

export default LeadDetailPage;
