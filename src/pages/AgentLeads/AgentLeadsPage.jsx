import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiTarget, FiAlertCircle, FiClock, FiCalendar, FiPhone,
  FiMail, FiX, FiEye, FiRefreshCw, FiHome, FiTrendingUp,
  FiZap, FiFileText, FiAlertTriangle, FiChevronLeft, FiChevronRight,
  FiCopy, FiCheck,
} from 'react-icons/fi';
import { getLeadsByAgent } from '../../services/leads/leadApi';
import agentApi from '../../services/agents/agentApi';
import { useAuth } from '../../hooks/useAuth';
import { getWhatsAppLink } from '../../utils/whatsapp';
import LeadDetailView from '../../components/leads/LeadDetailView';
import styles from './AgentLeadsPage.module.scss';

// ─── Timeline helpers ────────────────────────────────────────────────────────
const TIMELINE_LABELS = {
  asap:        { label: 'Lo antes posible', cls: 'asap',     icon: <FiZap /> },
  '1_month':   { label: 'En 1 mes',         cls: 'month',    icon: <FiZap /> },
  '2_3_months':{ label: '2–3 meses',        cls: 'quarter',  icon: <FiCalendar /> },
  '4_plus':    { label: '4+ meses',         cls: 'longterm', icon: <FiCalendar /> },
  browsing:    { label: 'Solo explorando',  cls: 'browsing', icon: <FiEye /> },
};

const URGENCY_ORDER = ['asap', '1_month', '2_3_months', '4_plus', 'browsing'];

function getTimeline(lead) {
  return lead?.metadata?.timeline ?? null;
}

function TimelineBadge({ value }) {
  const cfg = TIMELINE_LABELS[value] ?? { label: value ?? '—', cls: 'browsing', icon: <FiFileText /> };
  return (
    <span className={`${styles.timelineBadge} ${styles[`timelineBadge--${cfg.cls}`]}`}>
      <span className={styles.timelineIcon}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status, color }) {
  const bg = color ?? '#94a3b8';
  const isLight = (hex) => {
    const c = hex.replace('#', '');
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    return (0.299*r + 0.587*g + 0.114*b) / 255 > 0.6;
  };
  const textColor = isLight(bg) ? '#1a1a1a' : '#ffffff';
  return (
    <span
      className={styles.statusBadge}
      style={{
        background: `${bg}22`,
        color: bg,
        borderColor: `${bg}55`,
      }}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: '50%', background: bg, display: 'inline-block' }}
      />
      {status ?? 'Nuevo'}
    </span>
  );
}

// ─── Avatar initial ──────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = (name ?? '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <div className={styles.avatar}>{initials}</div>;
}

function LeadDrawer({ lead, onClose }) {
  if (!lead) return null;

  return (
    <div className={styles.drawerOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.drawer} onClick={e => e.stopPropagation()}>
        <header className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Detalle del Prospecto</h2>
          <button className={styles.drawerClose} onClick={onClose} aria-label="Cerrar">
            <FiX />
          </button>
        </header>

        <div className={styles.drawerBody}>
          <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{lead.name}</h1>
              <StatusBadge status={lead.status} color={lead.statusColor} />
            </div>
          </div>

          <LeadDetailView lead={lead} />
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

export default function AgentLeadsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [agentProfile, setAgentProfile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTimeline, setFilterTimeline] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Resolve AgentProfile (id differs from userId)
  useEffect(() => {
    const userId = user?.userId ?? user?.id;
    if (!userId) return;
    agentApi.getAgentById(userId)
      .then(res => {
        const payload = res?.data ?? res;
        const agentData = payload?.data ?? payload;
        setAgentProfile(agentData);
      })
      .catch(() => setError('No se pudo cargar el perfil del agente.'));
  }, [user]);

  // 2. Fetch leads whenever agentProfile or page changes
  const fetchLeads = useCallback(async (page = 0) => {
    if (!agentProfile?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getLeadsByAgent(agentProfile.id, {
        page,
        size: PAGE_SIZE,
        sort: 'createdAt,desc',
      });
      const pageData = res?.data ?? res;
      setLeads(pageData?.content ?? []);
      setTotalPages(pageData?.totalPages ?? 0);
      setCurrentPage(pageData?.number ?? 0);
    } catch {
      setError('No se pudieron cargar los prospectos.');
    } finally {
      setLoading(false);
    }
  }, [agentProfile]);

  useEffect(() => { fetchLeads(0); }, [fetchLeads]);

  // 3. Client-side filtering
  const filtered = useMemo(() => {
    return leads.filter(lead => {
      const matchStatus = !filterStatus || lead.status === filterStatus;
      const matchTimeline = !filterTimeline || getTimeline(lead) === filterTimeline;
      const query = searchQuery.toLowerCase();
      const matchSearch = !query
        || (lead.name ?? '').toLowerCase().includes(query)
        || (lead.email ?? '').toLowerCase().includes(query)
        || (lead.phone ?? '').toLowerCase().includes(query)
        || (lead.metadata?.address ?? '').toLowerCase().includes(query);
      return matchStatus && matchTimeline && matchSearch;
    });
  }, [leads, filterStatus, filterTimeline, searchQuery]);

  // 4. Sorted: urgent first
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ai = URGENCY_ORDER.indexOf(getTimeline(a) ?? 'browsing');
      const bi = URGENCY_ORDER.indexOf(getTimeline(b) ?? 'browsing');
      if (ai !== bi) return ai - bi;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [filtered]);

  // 5. Stats
  const stats = useMemo(() => {
    const total = leads.length;
    const urgent = leads.filter(l => ['asap', '1_month'].includes(getTimeline(l))).length;
    const now = new Date();
    const thisMonth = leads.filter(l => {
      const d = new Date(l.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const sources = new Set(leads.map(l => l.source)).size;
    return { total, urgent, thisMonth, sources };
  }, [leads]);

  const uniqueStatuses = useMemo(() => [...new Set(leads.map(l => l.status).filter(Boolean))], [leads]);

  const handleReset = () => {
    setFilterStatus('');
    setFilterTimeline('');
    setSearchQuery('');
  };

  return (
    <div className={styles.leadsPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <FiTarget style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--color-accent)' }} />
            Prospectos
          </h1>
          <p className={styles.subtitle}>Solicitudes recibidas desde el SellWizard · ordenadas por urgencia</p>
        </div>
        <button
          className={styles.actionBtn}
          onClick={() => fetchLeads(currentPage)}
          title="Actualizar"
          aria-label="Refrescar leads"
          style={{ width: 40, height: 40 }}
        >
          <FiRefreshCw />
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles['statIcon--total']}`}><FiTarget /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total de Prospectos</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles['statIcon--urgent']}`}><FiAlertCircle /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.urgent}</span>
            <span className={styles.statLabel}>Urgentes (≤1 mes)</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles['statIcon--month']}`}><FiTrendingUp /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.thisMonth}</span>
            <span className={styles.statLabel}>Este Mes</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.filterGroup} style={{ flex: '2 1 220px' }}>
          <label className={styles.filterLabel}>Buscar</label>
          <input
            id="leads-search"
            className={styles.filterSearch}
            placeholder="Nombre, email, teléfono, dirección..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="leads-filter-status">Estado</label>
          <select
            id="leads-filter-status"
            className={styles.filterSelect}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {uniqueStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="leads-filter-timeline">Timeline de venta</label>
          <select
            id="leads-filter-timeline"
            className={styles.filterSelect}
            value={filterTimeline}
            onChange={e => setFilterTimeline(e.target.value)}
          >
            <option value="">Todos</option>
            {Object.entries(TIMELINE_LABELS).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {(filterStatus || filterTimeline || searchQuery) && (
          <div className={styles.filterGroup} style={{ flex: '0 0 auto' }}>
            <label className={styles.filterLabel}>&nbsp;</label>
            <button className={styles.filterReset} onClick={handleReset}>
              <FiX style={{ marginRight: 4 }} />Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid var(--color-border)',
              borderTopColor: 'var(--color-accent)',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <span>Cargando prospectos...</span>
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><FiAlertTriangle /></div>
            <p className={styles.emptyTitle}>{error}</p>
            <button onClick={() => fetchLeads(currentPage)} style={{
              marginTop: 8, padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)', background: 'transparent',
              cursor: 'pointer', color: 'var(--color-text-secondary)',
            }}>Reintentar</button>
          </div>
        ) : sorted.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><FiTarget /></div>
            <p className={styles.emptyTitle}>No hay prospectos</p>
            <p className={styles.emptyText}>
              {leads.length > 0
                ? 'Ningún lead coincide con los filtros actuales.'
                : 'Cuando un cliente complete el SellWizard, sus datos aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table} aria-label="Tabla de prospectos">
                <thead>
                  <tr>
                    <th>Prospecto</th>
                    <th>Estado</th>
                    <th>Urgencia</th>
                    <th>Propiedad</th>
                    <th>Recibido</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(lead => {
                    const timeline = getTimeline(lead);
                    const meta = lead.metadata ?? {};
                    const whatsappUrl = getWhatsAppLink(lead.phone, '595',
                      `Hola ${lead.name ?? ''}, te contacto desde OpenRoof por tu consulta.`);
                    const propLabel = [
                      meta.propertyType,
                      meta.category === 'SALE' ? 'Venta' : meta.category === 'RENT' ? 'Alquiler' : null,
                    ].filter(Boolean).join(' · ') || '—';

                    return (
                      <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/agent/leads/${lead.id}`)}>
                        <td>
                          <div className={styles.prospectCell}>
                            <Avatar name={lead.name} />
                            <div>
                              <div className={styles.prospectName}>{lead.name ?? '—'}</div>
                              <div className={styles.prospectContact}>{lead.email || lead.phone || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td><StatusBadge status={lead.status} color={lead.statusColor} /></td>
                        <td>{timeline ? <TimelineBadge value={timeline} /> : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</td>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.83rem' }}>{propLabel}</td>
                        <td>
                          <div className={styles.dateCell}>
                            <FiClock size={13} />
                            {lead.createdAt
                              ? new Date(lead.createdAt).toLocaleDateString('es-PY', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                })
                              : '—'}
                          </div>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={`${styles.actionBtn} ${styles['actionBtn--whatsapp']}`}
                                title="WhatsApp"
                                aria-label="Contactar por WhatsApp"
                              >
                                <FiPhone />
                              </a>
                            )}
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className={`${styles.actionBtn} ${styles['actionBtn--primary']}`}
                                title="Enviar email"
                                aria-label="Enviar email"
                              >
                                <FiMail />
                              </a>
                            )}
                            <button
                              className={`${styles.actionBtn} ${styles['actionBtn--primary']}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/agent/leads/${lead.id}`);
                              }}
                              title="Ver detalle"
                              aria-label="Ver detalle"
                            >
                              <FiEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={currentPage === 0}
                  onClick={() => fetchLeads(currentPage - 1)}
                  aria-label="Página anterior"
                >
                  <FiChevronLeft />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.pageBtn} ${i === currentPage ? styles['pageBtn--active'] : ''}`}
                    onClick={() => fetchLeads(i)}
                    aria-label={`Página ${i + 1}`}
                    aria-current={i === currentPage ? 'page' : undefined}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className={styles.pageBtn}
                  disabled={currentPage === totalPages - 1}
                  onClick={() => fetchLeads(currentPage + 1)}
                  aria-label="Página siguiente"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
