import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
} from '../../constants/contractConstants';
import Badge from '../../components/common/Badge/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useContractSignatures } from '../../hooks/useContracts';
import styles from './ContractsPage.module.scss';

const ROLE_LABELS = {
  BUYER:   'Comprador / Inquilino',
  SELLER:  'Vendedor / Propietario',
  AGENT:   'Agente',
  WITNESS: 'Testigo',
};

const TYPE_LABELS = {
  ELECTRONIC:       'Electrónica',
  DIGITAL:          'Digital',
  HANDWRITTEN_SCAN: 'Manuscrita escaneada',
};

export default function ContractDetailModal({ contract: c, onClose }) {
  const { data: signaturesRes, isLoading: loadingSigs } = useContractSignatures(c?.id);
  const signatures = signaturesRes?.data ?? [];

  if (!c) return null;

  const signedCount    = signatures.filter((s) => s.signed).length;
  const totalCount     = signatures.length;
  const pctSigned      = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 0;

  return (
    <div className={styles.modal__backdrop} onClick={onClose}>
      <div
        className={`${styles.modal__box} ${styles['modal__box--wide']}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del contrato"
      >
        {/* Header */}
        <div className={styles.modal__header}>
          <h2 className={styles.modal__title}>Detalle del Contrato #{c.id}</h2>
          <button className={styles.modal__close} onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className={styles.modal__body}>

          {/* Propiedad y tipo */}
          <Section title="Propiedad">
            <Row label="Propiedad" value={c.propertyTitle || '—'} />
            <Row
              label="Tipo"
              value={
                <Badge variant={c.contractType === 'SALE' ? 'info' : 'accent'}>
                  {CONTRACT_TYPE_LABELS[c.contractType] || c.contractType}
                </Badge>
              }
            />
            <Row
              label="Estado"
              value={
                <Badge variant={CONTRACT_STATUS_COLORS[c.status] || 'neutral'}>
                  {CONTRACT_STATUS_LABELS[c.status] || c.status}
                </Badge>
              }
            />
          </Section>

          {/* Partes */}
          <Section title="Partes del contrato">
            <Row label="Vendedor / Propietario" value={`${c.sellerName || '—'} (${c.sellerEmail || '—'})`} />
            <Row label="Comprador / Inquilino"  value={`${c.buyerName  || '—'} (${c.buyerEmail  || '—'})`} />
            <Row label="Agente listador"        value={c.listingAgentName || <span className={styles.modal__noAgent}>Sin agente listador</span>} />
            <Row label="Agente del comprador"   value={c.buyerAgentName   || <span className={styles.modal__noAgent}>Sin agente del comprador</span>} />
          </Section>

          {/* Montos */}
          <Section title="Montos y comisiones">
            <Row label="Monto del contrato"            value={formatCurrency(c.amount)} highlight />
            <Row label="Comisión total (%)"             value={`${c.commissionPct ?? 0}%`} />
            <Row label="Comisión total ($)"             value={formatCurrency(c.totalCommissionAmount)} highlight />
            <Row label="Comisión agente listador (%)"   value={`${c.listingAgentCommissionPct ?? 0}%`} />
            <Row label="Comisión agente listador ($)"   value={formatCurrency(c.listingAgentCommissionAmount)} />
            <Row label="Comisión agente comprador (%)"  value={`${c.buyerAgentCommissionPct ?? 0}%`} />
            <Row label="Comisión agente comprador ($)"  value={formatCurrency(c.buyerAgentCommissionAmount)} />
          </Section>

          {/* Fechas */}
          <Section title="Fechas">
            <Row label="Fecha de inicio"       value={formatDate(c.startDate) || '—'} />
            <Row label="Fecha de vencimiento"  value={formatDate(c.endDate)   || '—'} />
            <Row label="Creado"                value={formatDate(c.createdAt) || '—'} />
          </Section>

          {/* Términos */}
          {c.terms && (
            <Section title="Términos">
              <p className={styles.modal__terms}>{c.terms}</p>
            </Section>
          )}

          {/* ── PANEL DE FIRMAS ────────────────────────────────────────────── */}
          <Section title={`Estado de firmas ${totalCount > 0 ? `(${signedCount}/${totalCount})` : ''}`}>
            {loadingSigs ? (
              <p className={styles.modal__sigsLoading}>Cargando firmas…</p>
            ) : signatures.length === 0 ? (
              <p className={styles.modal__noSigs}>
                No hay firmas registradas aun. El contrato debe estar en estado <strong>Enviado</strong> para recibir firmas.
              </p>
            ) : (
              <>
                {/* Barra de progreso */}
                <div className={styles.sign__progressBar}>
                  <div
                    className={styles.sign__progressFill}
                    style={{ width: `${pctSigned}%` }}
                  />
                </div>
                <p className={styles.sign__progressLabel}>
                  {signedCount} de {totalCount} partes han firmado ({pctSigned}%)
                </p>

                {/* Lista de firmas */}
                <div className={styles.sign__list}>
                  {signatures.map((sig) => (
                    <div
                      key={sig.signatureId}
                      className={`${styles.sign__item} ${sig.signed ? styles['sign__item--signed'] : styles['sign__item--pending']}`}
                    >
                      <span className={styles.sign__status}>
                        {sig.signed ? '✅' : '⏳'}
                      </span>
                      <div className={styles.sign__info}>
                        <span className={styles.sign__name}>{sig.signerName || `Usuario #${sig.signerId}`}</span>
                        <span className={styles.sign__role}>{ROLE_LABELS[sig.role] || sig.role}</span>
                        {sig.signatureType && (
                          <span className={styles.sign__type}>{TYPE_LABELS[sig.signatureType] || sig.signatureType}</span>
                        )}
                      </div>
                      <span className={styles.sign__date}>
                        {sig.signed
                          ? formatDate(sig.signedAt) || 'Fecha no disponible'
                          : 'Pendiente de firma'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>
        </div>

        <div className={styles.modal__footer}>
          <button className={styles.modal__btnClose} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className={styles.modal__section}>
      <h3 className={styles.modal__sectionTitle}>{title}</h3>
      <div className={styles.modal__grid}>{children}</div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className={`${styles.modal__row} ${highlight ? styles['modal__row--highlight'] : ''}`}>
      <span className={styles.modal__rowLabel}>{label}</span>
      <span className={styles.modal__rowValue}>{value}</span>
    </div>
  );
}
