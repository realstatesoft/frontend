import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit3, FiPenTool, FiDownload, FiCheckCircle, FiClock } from 'react-icons/fi';
import { 
  useContractDetail, 
  useContractSignatures, 
  useSignContract 
} from '../../hooks/useContracts';
import { useAuth } from '../../hooks/useAuth';
import { 
  CONTRACT_TYPE_LABELS, 
  CONTRACT_STATUS_LABELS, 
  CONTRACT_STATUS_COLORS 
} from '../../constants/contractConstants';
import Badge from '../../components/common/Badge/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ContractSignModal from './ContractSignModal';
import styles from './ContractDetailPage.module.scss';
import Swal from 'sweetalert2';

const ROLE_LABELS = {
  BUYER:   'Comprador / Inquilino',
  SELLER:  'Vendedor / Propietario',
  AGENT:   'Agente',
  LISTING_AGENT: 'Agente Listador',
  BUYER_AGENT:   'Agente del Comprador',
  WITNESS: 'Testigo',
};

const TYPE_LABELS = {
  ELECTRONIC:       'Electrónica',
  DIGITAL:          'Digital',
  HANDWRITTEN_SCAN: 'Manuscrita escaneada',
};

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  const { data: contractRes, isLoading: loadingContract, refetch: refetchContract } = useContractDetail(id);
  const { data: signaturesRes, isLoading: loadingSigs, refetch: refetchSigs } = useContractSignatures(id);
  
  const contract = contractRes?.data;
  const signatures = signaturesRes?.data ?? [];

  if (loadingContract || !contract) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Cargando información del contrato...</p>
      </div>
    );
  }

  const signedCount = signatures.filter(s => s.signed).length;
  const totalCount = signatures.length;
  const pctSigned = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 0;

  // Verificar si el usuario actual ya firmó
  const userHasSigned = signatures.some(s => s.userId === user?.id && s.signed);
  const canSign = (contract.status === 'SENT' || contract.status === 'PARTIALLY_SIGNED') && !userHasSigned;

  const handleRefresh = () => {
    refetchContract();
    refetchSigs();
  };

  return (
    <div className={styles.page}>
      {/* Header Fijo */}
      <header className={styles.header}>
        <div className={styles.header__content}>
          <button 
            className={styles.btnBack} 
            onClick={() => {
              const base = user?.role === 'AGENT' ? 'agent' : 'owner';
              navigate(`/${base}/contratos`);
            }}
          >
            <FiArrowLeft /> Volver
          </button>
          <div className={styles.header__titleGroup}>
            <h1 className={styles.title}>Contrato #{contract.id}</h1>
            <Badge variant={CONTRACT_STATUS_COLORS[contract.status]}>
              {CONTRACT_STATUS_LABELS[contract.status]}
            </Badge>
          </div>
          <div className={styles.header__actions}>
            {contract.status === 'DRAFT' && (
              <button 
                className={styles.btnSecondary} 
                onClick={() => {
                  const base = user?.role === 'AGENT' ? 'agent' : 'owner';
                  navigate(`/${base}/contratos/${contract.id}/editar`);
                }}
              >
                <FiEdit3 /> Editar Borrador
              </button>
            )}
            {canSign && (
              <button className={styles.btnPrimary} onClick={() => setIsSignModalOpen(true)}>
                <FiPenTool /> Firmar Contrato
              </button>
            )}
            <button className={styles.btnGhost} title="Descargar PDF" onClick={() => Swal.fire('Próximamente', 'La generación de PDF estará disponible pronto.', 'info')}>
              <FiDownload />
            </button>
          </div>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.grid}>
          {/* COLUMNA PRINCIPAL */}
          <div className={styles.mainContent}>
            
            {/* Resumen Card */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Información General</h2>
              </div>
              <div className={styles.infoGrid}>
                <InfoItem label="Propiedad" value={contract.propertyTitle} />
                <InfoItem label="Tipo de Contrato" value={CONTRACT_TYPE_LABELS[contract.contractType]} />
                <InfoItem label="Monto" value={formatCurrency(contract.amount)} highlight />
                <InfoItem label="Fecha de Inicio" value={formatDate(contract.startDate)} />
                <InfoItem label="Fecha de Fin" value={formatDate(contract.endDate)} />
                <InfoItem label="Creado el" value={formatDate(contract.createdAt)} />
              </div>
            </section>

            {/* Partes del Contrato */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Partes Involucradas</h2>
              </div>
              <div className={styles.partiesGrid}>
                <PartyCard 
                  role="Vendedor / Propietario" 
                  name={contract.sellerName} 
                  email={contract.sellerEmail} 
                />
                <PartyCard 
                  role="Comprador / Inquilino" 
                  name={contract.buyerName} 
                  email={contract.buyerEmail} 
                />
                {contract.listingAgentName && (
                  <PartyCard 
                    role="Agente Listador" 
                    name={contract.listingAgentName} 
                    email="Agente de la Propiedad"
                  />
                )}
                {contract.buyerAgentName && (
                  <PartyCard 
                    role="Agente del Comprador" 
                    name={contract.buyerAgentName} 
                    email="Representante del Cliente"
                  />
                )}
              </div>
            </section>

            {/* Términos y Condiciones */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Términos y Condiciones</h2>
              </div>
              <div className={styles.termsBox}>
                {contract.terms?.split('\n').map((line, i) => (
                  <p key={i} className={line.match(/^\d+\./) ? styles.termsHeader : styles.termsLine}>
                    {line}
                  </p>
                )) || <p className={styles.emptyTerms}>No hay términos definidos.</p>}
              </div>
            </section>
          </div>

          {/* SIDEBAR - ESTADO DE FIRMAS */}
          <aside className={styles.sidebar}>
            <div className={`${styles.card} ${styles.stickyCard}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Estado de Firmas</h2>
              </div>
              
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${pctSigned}%` }}
                  ></div>
                </div>
                <div className={styles.progressStats}>
                  <span>{signedCount} de {totalCount} firmados</span>
                  <span>{pctSigned}%</span>
                </div>
              </div>

              <div className={styles.signatureList}>
                {signatures.map((sig) => (
                  <div key={sig.role} className={styles.sigItem}>
                    <div className={sig.signed ? styles.sigIcon__signed : styles.sigIcon__pending}>
                      {sig.signed ? <FiCheckCircle /> : <FiClock />}
                    </div>
                    <div className={styles.sigData}>
                      <span className={styles.sigName}>{sig.signerName}</span>
                      <span className={styles.sigRole}>{ROLE_LABELS[sig.role] || sig.role}</span>
                      {sig.signed && (
                        <span className={styles.sigDate}>
                          {formatDate(sig.signedAt)} - {TYPE_LABELS[sig.signatureType]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {signatures.length === 0 && (
                  <p className={styles.noSignaturesText}>
                    El contrato está en borrador. Debe enviarse para iniciar el proceso de firma.
                  </p>
                )}
              </div>

              {canSign && (
                <div className={styles.sidebarAction}>
                  <p className={styles.actionHint}>Tienes una firma pendiente en este contrato.</p>
                  <button className={styles.btnPrimaryFull} onClick={() => setIsSignModalOpen(true)}>
                    <FiPenTool /> Firmar Ahora
                  </button>
                </div>
              )}
            </div>

            {/* Comisiones (solo para agentes) */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Plan de Comisiones</h2>
              </div>
              <div className={styles.commEntries}>
                <CommRow label="Total Comisión" value={formatCurrency(contract.totalCommissionAmount)} isTotal />
                <CommRow label="Agente Listador" value={formatCurrency(contract.listingAgentCommissionAmount)} />
                <CommRow label="Agente Comprador" value={formatCurrency(contract.buyerAgentCommissionAmount)} />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Modal de Firma */}
      {isSignModalOpen && (
        <ContractSignModal 
          contract={contract} 
          onClose={() => setIsSignModalOpen(false)} 
          onSuccess={() => {
            setIsSignModalOpen(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}

function InfoItem({ label, value, highlight }) {
  return (
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={`${styles.infoValue} ${highlight ? styles.infoValue__highlight : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}

function PartyCard({ role, name, email }) {
  return (
    <div className={styles.partyCard}>
      <span className={styles.partyRole}>{role}</span>
      <span className={styles.partyName}>{name || '—'}</span>
      <span className={styles.partyEmail}>{email || '—'}</span>
    </div>
  );
}

function CommRow({ label, value, isTotal }) {
  return (
    <div className={`${styles.commRow} ${isTotal ? styles.commRow__total : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
