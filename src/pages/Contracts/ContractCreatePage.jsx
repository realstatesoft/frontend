import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiSend } from 'react-icons/fi';
import { Container } from 'react-bootstrap';
import Swal from 'sweetalert2';
import propertyApi from '../../services/properties/propertyApi';
import { searchClients } from '../../services/clients/clientApi';
import { getAllAgents } from '../../services/agents/agentApi';
import PriceInput from '../../components/commons/PriceInput';
import CustomNavbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';
import { 
  useCreateContract, 
  useUpdateContract,
  useUpdateContractStatus,
  useContractDetail
} from '../../hooks/useContracts';
import { useAuth } from '../../hooks/useAuth';
import {
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_TYPE,
} from '../../constants/contractConstants';
import { getClausesForType } from './contractClauses';
import styles from './ContractCreatePage.module.scss';

/* ─── Formulario inicial ─────────────────────────────────────────────────────── */

const INITIAL_FORM = {
  propertyId: '',
  contractType: 'SALE',
  buyerId: '',
  sellerId: '',
  listingAgentId: '',
  buyerAgentId: '',
  amount: '',
  commissionPct: '0.00',
  listingAgentCommissionPct: '0.00',
  buyerAgentCommissionPct: '0.00',
  startDate: '',
  endDate: '',
  terms: '',
};

function formatClientOptionLabel(client) {
  const displayName = client?.name ?? client?.userName ?? (client?.userId != null ? `Cliente #${client.userId}` : 'Cliente');
  const email = client?.email ?? client?.userEmail ?? '';
  return email ? `${displayName} (${email})` : displayName;
}

function isPlaceholderClient(client) {
  const displayName = client?.name ?? client?.userName ?? '';
  const email = client?.email ?? client?.userEmail ?? '';
  return displayName.startsWith('Cliente #') && !email;
}

export default function ContractCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [sellerName, setSellerName] = useState('');
  const [selectedClauses, setSelectedClauses] = useState([]);
  const [customTerms, setCustomTerms] = useState('');
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [commissionError, setCommissionError] = useState('');
  const [isPreFilling, setIsPreFilling] = useState(false);

  const { user } = useAuth();
  const role = user?.role?.toUpperCase();
  const isAgent = role === 'AGENT';
  const isPublicContractsFlow = !isAgent;
  const isGuidedSellerFlow = !isAgent;
  const contractsHomePath = isAgent ? '/agent/contratos' : (role === 'OWNER' ? '/owner/ofertas' : '/ofertas');
  const backLabel = isAgent ? 'Volver a contratos' : 'Volver a ofertas';

  const { id: contractIdFromUrl } = useParams();
  const isEditing = Boolean(contractIdFromUrl);

  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const updateStatus = useUpdateContractStatus();

  // ─── Cargar contrato si estamos editando ────────────────────────────────────
  const { data: existingContract, isLoading: isLoadingContract } = useContractDetail(contractIdFromUrl);

  useEffect(() => {
    if (isEditing && existingContract?.data) {
      const c = existingContract.data;
      
      // Si la propiedad no está en la lista de 'properties', traerla
      if (c.propertyId && !properties.find(p => p.id === c.propertyId)) {
        propertyApi.getById(c.propertyId).then(res => {
          const prop = res?.data?.data ?? res?.data;
          if (prop) setProperties(prev => [prop, ...prev]);
        }).catch(() => {});
      }

      setForm({
        propertyId:                c.propertyId?.toString() || '',
        contractType:              c.contractType || 'SALE',
        buyerId:                   c.buyerId?.toString() || '',
        sellerId:                  c.sellerId?.toString() || '',
        listingAgentId:            c.listingAgentId?.toString() || '',
        buyerAgentId:              c.buyerAgentId?.toString() || '',
        amount:                    c.amount?.toString() || '',
        commissionPct:             c.commissionPct?.toString() || '0.00',
        listingAgentCommissionPct: c.listingAgentCommissionPct?.toString() || '0.00',
        buyerAgentCommissionPct:   c.buyerAgentCommissionPct?.toString() || '0.00',
        startDate:                 c.startDate || '',
        endDate:                   c.endDate || '',
        terms:                     c.terms || '',
      });
      setSellerName(c.sellerName || '');
      setCustomTerms(c.terms || '');
    }
  }, [isEditing, existingContract, properties.length === 0]);

  // ─── Pre-llenado desde Oferta (Query Params) ──────────────────────────────
  useEffect(() => {
    if (isEditing || isPreFilling) return;

    const params = new URLSearchParams(location.search);
    const pId = params.get('propertyId');
    const bId = params.get('buyerId');
    const bName = params.get('buyerName');
    const bEmail = params.get('buyerEmail');
    const amt = params.get('amount');

    if (bId) {
      setClients((prev) => {
        if (prev.some((c) => c?.userId?.toString() === bId)) return prev;

        return [
          {
            id: `offer-buyer-${bId}`,
            userId: bId,
            name: bName || `Cliente #${bId}`,
            email: bEmail || '',
          },
          ...prev,
        ];
      });
    }

    if (pId) {
      setIsPreFilling(true);
      propertyApi.getById(pId)
        .then(res => {
          const prop = res?.data?.data ?? res?.data;
          if (prop) {
            setProperties(prev => {
              if (prev.find(p => p.id.toString() === pId)) return prev;
              return [prop, ...prev];
            });
            
            setForm(prev => ({
              ...prev,
              propertyId: pId,
              buyerId: bId || prev.buyerId,
              amount: amt || prop.price?.toString() || prev.amount,
              sellerId: prop.ownerId || '',
              listingAgentId: prop.agentId || '',
              commissionPct: prop.commissionPct || '0.00',
              listingAgentCommissionPct: prop.agentId ? (prop.commissionPct || '0.00') : '0.00',
              contractType: prop.category === 'RENT' ? 'RENT' : prev.contractType,
            }));
            setSellerName(prop.ownerName || '');
          }
        })
        .catch(err => console.error("Error al pre-cargar oferta:", err));
    }
  }, [location.search, isEditing, isPreFilling]);

  // ─── Cargar datos para los selects ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingData(true);
      try {
        const propsPromise = isAgent
          ? propertyApi.getAgentScope({ size: 100 })
          : propertyApi.getMe({ page: 0, size: 100, status: 'PUBLISHED' });

        const [propsRes, clientsRes, agentsRes] = await Promise.all([
          propsPromise,
          searchClients({ page: 0, size: 100, sort: 'created_at,desc' }),
          getAllAgents({ page: 0, size: 100 }),
        ]);
        if (cancelled) return;

        const raw = propsRes?.data?.data?.content ?? propsRes?.data?.data ?? propsRes?.data ?? [];
        setProperties(prev => {
           // Combinar con las propiedades ya cargadas (por el pre-llenado)
           const combined = [...prev, ...raw];
           const unique = [];
           const ids = new Set();
           for (const p of combined) {
             if (!ids.has(p.id)) {
               ids.add(p.id);
               unique.push(p);
             }
           }
           return unique;
        });

        setClients(prev => {
          const incoming = clientsRes?.content ?? [];
          const byUserId = new Map();
          const withoutUserId = new Map();

          for (const client of prev) {
            const userKey = client?.userId != null ? client.userId.toString() : null;
            const idKey = client?.id != null ? client.id.toString() : null;

            if (userKey) {
              byUserId.set(userKey, client);
            } else if (idKey) {
              withoutUserId.set(idKey, client);
            }
          }

          for (const client of incoming) {
            const userKey = client?.userId != null ? client.userId.toString() : null;
            const idKey = client?.id != null ? client.id.toString() : null;

            if (userKey) {
              const existing = byUserId.get(userKey);
              if (!existing || isPlaceholderClient(existing)) {
                byUserId.set(userKey, client);
              }
            } else if (idKey && !withoutUserId.has(idKey)) {
              withoutUserId.set(idKey, client);
            }
          }

          return [...byUserId.values(), ...withoutUserId.values()];
        });
        const agentsRaw = agentsRes?.data ?? agentsRes ?? {};
        setAgents(agentsRaw.content ?? []);
      } catch {
        // no bloquear la página
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isAgent, user?.agentProfileId]);

  // ─── Buscar por MLS-ID (Prop ID) ──────────────────────────────────────────
  const [mlsSearch, setMlsSearch] = useState('');
  const [isSearchingMls, setIsSearchingMls] = useState(false);

  const handleMlsSearch = async () => {
    if (!mlsSearch.trim()) return;
    setIsSearchingMls(true);
    try {
      const res = await propertyApi.getById(mlsSearch.trim());
      const prop = res?.data?.data ?? res?.data ?? null;
      
      if (prop) {
        setProperties(prev => {
          if (prev.find(p => p.id === prop.id)) return prev;
          return [prop, ...prev];
        });
        handlePropertyChange({ target: { value: prop.id } });
        Swal.fire({
          icon: 'success',
          title: 'Propiedad encontrada',
          text: `${prop.title} cargada correctamente.`,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error();
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'No encontrada',
        text: 'No se encontró ninguna propiedad con ese ID.',
      });
    } finally {
      setIsSearchingMls(false);
    }
  };

  // ─── Auto-fill al seleccionar propiedad ────────────────────────────────────
  const handlePropertyChange = async (e) => {
    const propId = e.target.value;
    setForm((prev) => ({ ...prev, propertyId: propId, sellerId: '', listingAgentId: '', amount: '' }));
    setSellerName('');
    if (!propId) return;
    try {
      const res = await propertyApi.getById(propId);
      const prop = res?.data?.data ?? res?.data ?? {};
      setForm((prev) => ({
        ...prev,
        propertyId: propId,
        sellerId: prop.ownerId ?? '',
        listingAgentId: prop.agentId ?? '',
        amount: prop.price ?? '',
        commissionPct: prop.commissionPct ?? '0.00',
        listingAgentCommissionPct: prop.agentId ? (prop.commissionPct ?? '0.00') : '0.00',
        buyerAgentCommissionPct: '0.00',
        contractType: prop.category === 'RENT' ? 'RENT' : prev.contractType,
      }));
      setSellerName(prop.ownerName ?? '');
    } catch {
      // mantener propId seleccionado
    }
  };

  const validateCommission = useCallback((updated) => {
    const total   = parseFloat(updated.commissionPct) || 0;
    const listing = parseFloat(updated.listingAgentCommissionPct) || 0;
    const buyer   = parseFloat(updated.buyerAgentCommissionPct) || 0;
    const diff    = Math.abs(total - (listing + buyer));

    if (!updated.listingAgentId && listing > 0)
      return 'Si no hay agente listador, su comisión debe ser 0.';
    if (!updated.buyerAgentId && buyer > 0)
      return 'Si no hay agente del comprador, su comisión debe ser 0.';
    if (diff > 0.01 && (updated.listingAgentId || updated.buyerAgentId))
      return `La comisión total (${total}%) debe ser igual a la suma de listador (${listing}%) + comprador (${buyer}%).`;
    return '';
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'listingAgentId' && !value) updated.listingAgentCommissionPct = '0.00';
      if (name === 'buyerAgentId' && !value) updated.buyerAgentCommissionPct = '0.00';
      setCommissionError(validateCommission(updated));
      return updated;
    });
  };

  const toggleClause = (clauseId) => {
    setSelectedClauses((prev) =>
      prev.includes(clauseId)
        ? prev.filter((id) => id !== clauseId)
        : [...prev, clauseId],
    );
  };

  const selectAllClauses = () => {
    const available = getClausesForType(form.contractType);
    setSelectedClauses(available.map((c) => c.id));
  };

  const clearAllClauses = () => setSelectedClauses([]);

  const buildTermsText = useCallback(() => {
    const clauses = getClausesForType(form.contractType);
    const selected = clauses.filter((c) => selectedClauses.includes(c.id));
    const parts = selected.map((c, i) => `${i + 1}. ${c.label.toUpperCase()}\n${c.text}`);
    if (customTerms.trim()) {
      parts.push(`${parts.length + 1}. CONDICIONES ADICIONALES\n${customTerms.trim()}`);
    }
    return parts.join('\n\n');
  }, [form.contractType, selectedClauses, customTerms]);

  const handleSubmit = async (sendAfterCreate = false) => {
    if (!form.propertyId) {
      Swal.fire({ icon: 'warning', title: 'Campo obligatorio', text: 'La propiedad es obligatoria.' });
      return;
    }
    if (!form.buyerId) {
      Swal.fire({ icon: 'warning', title: 'Campo obligatorio', text: 'El comprador/inquilino es obligatorio.' });
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      Swal.fire({ icon: 'warning', title: 'Campo obligatorio', text: 'El monto total es obligatorio y debe ser mayor a 0.' });
      return;
    }
    if (!form.startDate) {
      Swal.fire({ icon: 'warning', title: 'Campo obligatorio', text: 'La fecha de inicio es obligatoria.' });
      return;
    }

    const err = validateCommission(form);
    if (err) { setCommissionError(err); return; }

    const terms = buildTermsText();

    const payload = {
      propertyId:                parseInt(form.propertyId, 10) || null,
      contractType:              form.contractType,
      buyerId:                   parseInt(form.buyerId, 10) || null,
      sellerId:                  parseInt(form.sellerId, 10) || null,
      listingAgentId:            form.listingAgentId ? parseInt(form.listingAgentId, 10) : null,
      buyerAgentId:              form.buyerAgentId ? parseInt(form.buyerAgentId, 10) : null,
      amount:                    parseFloat(form.amount) || null,
      commissionPct:             parseFloat(form.commissionPct) || 0,
      listingAgentCommissionPct: parseFloat(form.listingAgentCommissionPct) || 0,
      buyerAgentCommissionPct:   parseFloat(form.buyerAgentCommissionPct) || 0,
      startDate:                 form.startDate || null,
      endDate:                   form.endDate || null,
      terms:                     terms || null,
    };

    try {
      let res;
      if (isEditing) {
        res = await updateContract.mutateAsync({ id: contractIdFromUrl, ...payload });
      } else {
        res = await createContract.mutateAsync(payload);
      }
      
      const contractId = res?.data?.id ?? res?.id ?? contractIdFromUrl;

      if (sendAfterCreate && contractId) {
        try {
          await updateStatus.mutateAsync({ id: contractId, status: 'SENT' });
          Swal.fire({
            icon: 'success',
            title: 'Contrato creado y enviado',
            text: 'El contrato fue creado y enviado a las partes.',
            timer: 2500,
            showConfirmButton: false,
          });
        } catch {
          Swal.fire({
            icon: 'warning',
            title: 'Contrato creado',
            text: 'Se guardó como borrador pero no se pudo cambiar a "Enviado".',
            timer: 3000,
            showConfirmButton: false,
          });
        }
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Borrador guardado',
          text: 'El contrato fue guardado como borrador. Podrás editarlo y enviarlo después.',
          timer: 2500,
          showConfirmButton: false,
        });
      }

      navigate(contractsHomePath);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear contrato',
        text: err?.response?.data?.message ?? 'No se pudo crear el contrato.',
      });
    }
  };

  const availableClauses = getClausesForType(form.contractType);
  const isPending = createContract.isPending || updateStatus.isPending;

  const pageContent = (
    <div className={`${styles.page} ${isPublicContractsFlow ? styles['page--public'] : ''}`}>
      <div className={styles.page__header}>
        <div className={styles.page__headerTitleRow}>
          <div className={styles.page__headerTexts}>
            <button
              type="button"
              className={styles.page__back}
              onClick={() => navigate(contractsHomePath)}
            >
              <FiArrowLeft /> {backLabel}
            </button>
            <h1 className={styles.page__title}>
              {isEditing ? `Editando Contrato #${contractIdFromUrl}` : 'Nuevo Contrato'}
            </h1>
            <p className={styles.page__subtitle}>
              {isEditing 
                ? 'Modifica los datos del borrador antes de enviarlo.' 
                : 'Completa la información del contrato. Se guardará como borrador hasta que lo envíes.'}
            </p>
            {isGuidedSellerFlow && (
              <p className={styles.page__helper}>
                Tu propiedad y comisiones se completan automáticamente para que solo confirmes los datos esenciales del acuerdo.
              </p>
            )}
          </div>

          {(loadingData || isLoadingContract || isPreFilling) && (
            <div className={styles.page__loadingBadge}>
              <div className={styles.page__loadingPulse}></div>
              {isPreFilling ? 'Pre-cargando oferta...' : isLoadingContract ? 'Cargando contrato...' : 'Cargando datos maestros...'}
            </div>
          )}
        </div>
      </div>

      <div className={styles.page__content}>
        <div className={styles.page__main}>
          <fieldset className={styles.form__section}>
            <legend className={styles.form__sectionTitle}>Propiedad y tipo</legend>

            <div className={styles.form__row} style={{ marginBottom: '1.5rem' }}>
              <label className={styles.form__label}>
                Buscar por MLS-ID (ID de propiedad)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className={styles.form__input}
                  placeholder="Ej: 37"
                  value={mlsSearch}
                  onChange={(e) => setMlsSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleMlsSearch()}
                />
                <button
                  type="button"
                  className={`${styles.btn} ${styles['btn--secondary']}`}
                  onClick={handleMlsSearch}
                  disabled={isSearchingMls}
                >
                  {isSearchingMls ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>

            <div className={styles.form__grid2}>
              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="cc-property">
                  Propiedad <span className={styles.form__required}>*</span>
                </label>
                <select
                  id="cc-property"
                  name="propertyId"
                  className={styles.form__select}
                  value={form.propertyId}
                  onChange={handlePropertyChange}
                  required
                >
                  <option value="">— Seleccionar propiedad —</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="cc-type">
                  Tipo de contrato <span className={styles.form__required}>*</span>
                </label>
                <select
                  id="cc-type"
                  name="contractType"
                  className={styles.form__select}
                  value={form.contractType}
                  onChange={(e) => {
                    handleChange(e);
                    setSelectedClauses([]);
                  }}
                  required
                >
                  {CONTRACT_TYPE_OPTIONS.map((label) => (
                    <option key={label} value={CONTRACT_TYPE[label]}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.form__row}>
              <label className={styles.form__label} htmlFor="cc-amount">
                Monto (USD) <span className={styles.form__required}>*</span>
              </label>
              <PriceInput
                id="cc-amount"
                name="amount"
                className={styles.form__input}
                value={form.amount}
                onChange={(e) => handleChange({ target: { name: 'amount', value: e.target.value } })}
                placeholder="0"
                required
              />
            </div>
          </fieldset>

          <fieldset className={styles.form__section}>
            <legend className={styles.form__sectionTitle}>Partes del contrato</legend>

            <div className={styles.form__grid2}>
              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="cc-seller">
                  Vendedor / Propietario <span className={styles.form__required}>*</span>
                </label>
                <input
                  id="cc-seller"
                  type="text"
                  readOnly
                  className={styles.form__input}
                  value={sellerName}
                  placeholder="Se completa al elegir propiedad"
                />
              </div>

              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="cc-buyer">
                  Comprador / Inquilino <span className={styles.form__required}>*</span>
                </label>
                <select
                  id="cc-buyer"
                  name="buyerId"
                  className={styles.form__select}
                  value={form.buyerId}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Seleccionar cliente —</option>
                  {clients
                    .filter((c) => c.userId != null)
                    .map((c) => (
                      <option key={c.id} value={c.userId}>
                        {formatClientOptionLabel(c)}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </fieldset>

          {isAgent ? (
            <>
              <fieldset className={styles.form__section}>
                <legend className={styles.form__sectionTitle}>Agentes (opcionales)</legend>
                <div className={styles.form__grid2}>
                  <div className={styles.form__row}>
                    <label className={styles.form__label} htmlFor="cc-listing-agent">
                      Agente listador
                    </label>
                    <select
                      id="cc-listing-agent"
                      name="listingAgentId"
                      className={styles.form__select}
                      value={form.listingAgentId}
                      onChange={handleChange}
                    >
                      <option value="">— Sin agente listador —</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.userName} ({a.licenseNumber ?? ''})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.form__row}>
                    <label className={styles.form__label} htmlFor="cc-buyer-agent">
                      Agente del comprador
                    </label>
                    <select
                      id="cc-buyer-agent"
                      name="buyerAgentId"
                      className={styles.form__select}
                      value={form.buyerAgentId}
                      onChange={handleChange}
                    >
                      <option value="">— Sin agente del comprador —</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.userName} ({a.licenseNumber ?? ''})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>

              <fieldset className={styles.form__section}>
                <legend className={styles.form__sectionTitle}>Comisiones (%)</legend>
                <div className={styles.form__grid3}>
                  <div className={styles.form__row}>
                    <label className={styles.form__label} htmlFor="cc-comm">
                      Total comisión
                    </label>
                    <input
                      id="cc-comm"
                      type="number"
                      name="commissionPct"
                      className={styles.form__input}
                      value={form.commissionPct}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                  <div className={styles.form__row}>
                    <label className={styles.form__label} htmlFor="cc-comm-listing">
                      Agente listador
                    </label>
                    <input
                      id="cc-comm-listing"
                      type="number"
                      name="listingAgentCommissionPct"
                      className={styles.form__input}
                      value={form.listingAgentCommissionPct}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      disabled={!form.listingAgentId}
                    />
                  </div>
                  <div className={styles.form__row}>
                    <label className={styles.form__label} htmlFor="cc-comm-buyer">
                      Agente comprador
                    </label>
                    <input
                      id="cc-comm-buyer"
                      type="number"
                      name="buyerAgentCommissionPct"
                      className={styles.form__input}
                      value={form.buyerAgentCommissionPct}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      disabled={!form.buyerAgentId}
                    />
                  </div>
                </div>
                {commissionError && <p className={styles.form__error}>{commissionError}</p>}
              </fieldset>
            </>
          ) : (
            <fieldset className={styles.form__section}>
              <legend className={styles.form__sectionTitle}>Intermediación</legend>
              <div className={styles.form__summaryGrid}>
                <div className={styles.form__summaryItem}>
                  <span className={styles.form__summaryLabel}>Agente asignado</span>
                  <span className={styles.form__summaryValue}>
                    {agents.find((a) => String(a.id) === String(form.listingAgentId))?.userName
                      || (form.listingAgentId ? `Agente asignado #${form.listingAgentId}` : 'Sin agente asignado')}
                  </span>
                </div>
                <div className={styles.form__summaryItem}>
                  <span className={styles.form__summaryLabel}>Comisión de la operación</span>
                  <span className={styles.form__summaryValue}>{form.commissionPct || '0.00'}%</span>
                </div>
              </div>
              {commissionError && <p className={styles.form__error}>{commissionError}</p>}
            </fieldset>
          )}

          <fieldset className={styles.form__section}>
            <legend className={styles.form__sectionTitle}>Vigencia</legend>
            <div className={styles.form__grid2}>
              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="cc-start">
                  Fecha inicio <span className={styles.form__required}>*</span>
                </label>
                <input
                  id="cc-start"
                  type="date"
                  name="startDate"
                  className={styles.form__input}
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="cc-end">
                  Fecha fin
                </label>
                <input
                  id="cc-end"
                  type="date"
                  name="endDate"
                  className={styles.form__input}
                  value={form.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </fieldset>
        </div>

        <div className={styles.page__sidebar}>
          <div className={styles.terms}>
            <div className={styles.terms__header}>
              <h2 className={styles.terms__title}>Términos y Condiciones</h2>
              <p className={styles.terms__subtitle}>Selecciona las cláusulas aplicables</p>
              <div className={styles.terms__actions}>
                <button type="button" className={styles.terms__actionBtn} onClick={selectAllClauses}>Todas</button>
                <button type="button" className={styles.terms__actionBtn} onClick={clearAllClauses}>Limpiar</button>
              </div>
            </div>
            <div className={styles.terms__list}>
              {availableClauses.map((clause) => {
                const checked = selectedClauses.includes(clause.id);
                return (
                  <label key={clause.id} className={`${styles.terms__clause} ${checked ? styles['terms__clause--active'] : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleClause(clause.id)} className={styles.terms__checkbox} />
                    <div className={styles.terms__clauseContent}>
                      <span className={styles.terms__clauseLabel}>{clause.label}</span>
                      <p className={styles.terms__clauseText}>{clause.text}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className={styles.terms__custom}>
              <label className={styles.form__label}>Condiciones adicionales</label>
              <textarea
                className={`${styles.form__input} ${styles['form__input--textarea']}`}
                value={customTerms}
                onChange={(e) => setCustomTerms(e.target.value)}
                rows={8}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.page__footer} ${isPublicContractsFlow ? styles['page__footer--public'] : ''}`}>
        <div className={`${styles.page__footerActions} ${isPublicContractsFlow ? styles['page__footerActions--public'] : ''}`}>
          <button
            type="button"
            className={`${styles.btn} ${styles['btn--ghost']}`}
            onClick={() => navigate(contractsHomePath)}
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles['btn--secondary']}`}
            onClick={() => handleSubmit(false)}
            disabled={isPending}
          >
            <FiSave /> Guardar borrador
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles['btn--primary']}`}
            onClick={() => handleSubmit(true)}
            disabled={isPending}
          >
            <FiSend /> {isPending ? 'Enviando...' : 'Crear y enviar'}
          </button>
        </div>
      </div>
    </div>
  );

  if (isPublicContractsFlow) {
    return (
      <>
        <CustomNavbar />
        <div className={styles.pageShell}>
          <Container className={styles.pageShell__container}>
            {pageContent}
          </Container>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {pageContent}
    </>
  );
}
