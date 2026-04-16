import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiSend } from 'react-icons/fi';
import Swal from 'sweetalert2';
import propertyApi from '../../services/properties/propertyApi';
import { searchClients } from '../../services/clients/clientApi';
import { getAllAgents } from '../../services/agents/agentApi';
import { useCreateContract, useUpdateContractStatus } from '../../hooks/useContracts';
import { useAuth } from '../../hooks/useAuth';
import {
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_TYPE,
} from '../../constants/contractConstants';
import styles from './ContractCreatePage.module.scss';

/* ─── Cláusulas predefinidas por tipo de contrato ────────────────────────────── */

const SALE_CLAUSES = [
  {
    id: 'sale_title',
    label: 'Título de propiedad limpio',
    text: 'El vendedor declara que el inmueble se encuentra libre de gravámenes, hipotecas, embargos, litigios pendientes y cualquier limitación de dominio. En caso de existir algún vicio oculto en el título, el vendedor será responsable de su saneamiento.',
  },
  {
    id: 'sale_delivery',
    label: 'Entrega del inmueble',
    text: 'El vendedor se compromete a entregar el inmueble en las mismas condiciones en que fue mostrado al comprador, incluyendo instalaciones fijas, accesorios y mejoras existentes, en un plazo no mayor a 30 días hábiles contados a partir de la firma de la escritura pública.',
  },
  {
    id: 'sale_payment',
    label: 'Forma de pago',
    text: 'El comprador se obliga a realizar el pago del precio pactado según el calendario de pagos acordado. El incumplimiento de cualquier pago en la fecha estipulada generará intereses moratorios del 1.5% mensual sobre el monto vencido.',
  },
  {
    id: 'sale_expenses',
    label: 'Gastos de escrituración',
    text: 'Los gastos notariales, registrales, impuestos de transferencia y cualquier otro costo asociado a la escrituración serán cubiertos de la siguiente manera: 50% por el vendedor y 50% por el comprador, salvo acuerdo diferente entre las partes.',
  },
  {
    id: 'sale_warranty',
    label: 'Vicios ocultos',
    text: 'El vendedor garantiza que el inmueble no presenta vicios ocultos estructurales. En caso de descubrirse defectos no visibles dentro de los 6 meses posteriores a la entrega, el vendedor asumirá los costos de reparación o, a elección del comprador, se reducirá proporcionalmente el precio de venta.',
  },
  {
    id: 'sale_penalty',
    label: 'Cláusula penal por incumplimiento',
    text: 'En caso de incumplimiento por cualquiera de las partes, la parte incumplidora deberá pagar como penalidad el equivalente al 10% del valor total del contrato, sin perjuicio de las acciones legales que correspondan.',
  },
  {
    id: 'sale_arbitration',
    label: 'Resolución de controversias',
    text: 'Cualquier controversia derivada del presente contrato será resuelta mediante arbitraje ante el centro de arbitraje de la localidad, conforme a su reglamento vigente. Las partes renuncian a cualquier otro fuero que pudiera corresponderles.',
  },
];

const RENT_CLAUSES = [
  {
    id: 'rent_use',
    label: 'Uso del inmueble',
    text: 'El inquilino se compromete a utilizar el inmueble exclusivamente para uso habitacional/comercial según lo pactado. Queda prohibido destinar el inmueble a actividades distintas, subarrendar total o parcialmente, o ceder el contrato sin autorización escrita del propietario.',
  },
  {
    id: 'rent_payment',
    label: 'Pago de renta',
    text: 'El inquilino pagará la renta mensual dentro de los primeros 5 días de cada mes. El retraso en el pago generará un recargo del 5% sobre el monto mensual por cada semana de atraso. Dos meses consecutivos de impago facultarán al propietario para rescindir el contrato.',
  },
  {
    id: 'rent_deposit',
    label: 'Depósito de garantía',
    text: 'Al momento de la firma, el inquilino entregará un depósito equivalente a 2 meses de renta como garantía. Dicho depósito será devuelto al término del contrato, previa verificación del estado del inmueble y deducción de adeudos pendientes, en un plazo no mayor a 30 días.',
  },
  {
    id: 'rent_maintenance',
    label: 'Mantenimiento y reparaciones',
    text: 'Las reparaciones menores y el mantenimiento ordinario del inmueble serán responsabilidad del inquilino. Las reparaciones mayores de tipo estructural, instalaciones eléctricas principales, plomería y techos serán responsabilidad del propietario, salvo que el daño sea causado por negligencia del inquilino.',
  },
  {
    id: 'rent_inspection',
    label: 'Inspecciones periódicas',
    text: 'El propietario podrá realizar inspecciones al inmueble con previo aviso de 48 horas al inquilino. Las inspecciones se realizarán en horario hábil y con una frecuencia no mayor a una vez por trimestre, salvo situaciones de emergencia.',
  },
  {
    id: 'rent_termination',
    label: 'Terminación anticipada',
    text: 'Cualquiera de las partes podrá dar por terminado el contrato antes de su vencimiento, notificando por escrito con al menos 60 días de anticipación. En caso de terminación anticipada por parte del inquilino, este perderá el depósito de garantía como penalización.',
  },
  {
    id: 'rent_return',
    label: 'Devolución del inmueble',
    text: 'Al término del contrato, el inquilino deberá devolver el inmueble en las mismas condiciones en que lo recibió, descontando el desgaste normal por el uso. Se levantará un acta de entrega firmada por ambas partes donde se detalle el estado del inmueble.',
  },
];

const GENERAL_CLAUSES = [
  {
    id: 'gen_force_majeure',
    label: 'Fuerza mayor',
    text: 'Ninguna de las partes será responsable por el incumplimiento de sus obligaciones cuando este se deba a causas de fuerza mayor o caso fortuito, entendiéndose como tales: desastres naturales, pandemias, guerras, actos de autoridad gubernamental u otras circunstancias imprevisibles e inevitables.',
  },
  {
    id: 'gen_confidentiality',
    label: 'Confidencialidad',
    text: 'Las partes se comprometen a mantener en estricta confidencialidad los términos económicos y condiciones del presente contrato, así como cualquier información personal o financiera intercambiada durante la negociación.',
  },
  {
    id: 'gen_modifications',
    label: 'Modificaciones al contrato',
    text: 'Cualquier modificación al presente contrato deberá realizarse por escrito y ser firmada por todas las partes involucradas. Las modificaciones verbales no tendrán validez legal.',
  },
  {
    id: 'gen_notifications',
    label: 'Notificaciones',
    text: 'Todas las notificaciones entre las partes deberán realizarse por escrito, ya sea por correo electrónico certificado o por medio físico con acuse de recibo, a las direcciones proporcionadas en el presente contrato.',
  },
];

function getClausesForType(contractType) {
  switch (contractType) {
    case 'SALE':
    case 'OPTION_TO_BUY':
      return [...SALE_CLAUSES, ...GENERAL_CLAUSES];
    case 'RENT':
      return [...RENT_CLAUSES, ...GENERAL_CLAUSES];
    default:
      return GENERAL_CLAUSES;
  }
}

/* ─── Formulario inicial ─────────────────────────────────────────────────────── */

const INITIAL_FORM = {
  propertyId: '',
  contractType: 'SALE',
  buyerId: '',
  sellerId: '',
  listingAgentId: '',
  buyerAgentId: '',
  amount: '',
  commissionPct: '3.00',
  listingAgentCommissionPct: '3.00',
  buyerAgentCommissionPct: '0.00',
  startDate: '',
  endDate: '',
  terms: '',
};

export default function ContractCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [sellerName, setSellerName] = useState('');
  const [selectedClauses, setSelectedClauses] = useState([]);
  const [customTerms, setCustomTerms] = useState('');
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [commissionError, setCommissionError] = useState('');

  const { user } = useAuth();
  const isAgent = user?.role === 'AGENT';
  const createContract = useCreateContract();
  const updateStatus = useUpdateContractStatus();

  // ─── Cargar datos para los selects ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingData(true);
      try {
        const propsPromise = isAgent
          ? propertyApi.getMyAssignments()
          : propertyApi.getMe({ page: 0, size: 100, status: 'PUBLISHED' });

        const [propsRes, clientsRes, agentsRes] = await Promise.all([
          propsPromise,
          searchClients({ page: 0, size: 100, sort: 'created_at,desc' }),
          getAllAgents({ page: 0, size: 100 }),
        ]);
        if (cancelled) return;

        if (isAgent) {
          const raw = propsRes?.data?.data ?? propsRes?.data ?? [];
          const list = Array.isArray(raw) ? raw : [];
          setProperties(list.map((a) => ({ id: a.propertyId, title: a.propertyTitle })));
        } else {
          const raw = propsRes?.data?.data ?? propsRes?.data ?? {};
          setProperties(raw.content ?? []);
        }

        setClients(clientsRes?.content ?? []);
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
  }, [isAgent]);

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
        contractType: prop.category === 'RENT' ? 'RENT' : prev.contractType,
      }));
      setSellerName(prop.ownerName ?? '');
    } catch {
      // mantener propId seleccionado
    }
  };

  // ─── Validar comisiones ────────────────────────────────────────────────────
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

  // ─── Toggle cláusulas ──────────────────────────────────────────────────────
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

  // ─── Compilar términos finales ─────────────────────────────────────────────
  const buildTermsText = useCallback(() => {
    const clauses = getClausesForType(form.contractType);
    const selected = clauses.filter((c) => selectedClauses.includes(c.id));
    const parts = selected.map((c, i) => `${i + 1}. ${c.label.toUpperCase()}\n${c.text}`);
    if (customTerms.trim()) {
      parts.push(`${parts.length + 1}. CONDICIONES ADICIONALES\n${customTerms.trim()}`);
    }
    return parts.join('\n\n');
  }, [form.contractType, selectedClauses, customTerms]);

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (sendAfterCreate = false) => {
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
      const res = await createContract.mutateAsync(payload);
      const contractId = res?.data?.id ?? res?.id;

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

      navigate('/agent/contratos');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear contrato',
        text: err?.response?.data?.message ?? 'No se pudo crear el contrato.',
      });
    }
  };

  // ─── Cláusulas disponibles ─────────────────────────────────────────────────
  const availableClauses = getClausesForType(form.contractType);
  const isPending = createContract.isPending || updateStatus.isPending;

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.page__header}>
        <button
          type="button"
          className={styles.page__back}
          onClick={() => navigate('/agent/contratos')}
        >
          <FiArrowLeft /> Volver a contratos
        </button>
        <h1 className={styles.page__title}>Nuevo Contrato</h1>
        <p className={styles.page__subtitle}>
          Completa la información del contrato. Se guardará como borrador hasta que lo envíes.
        </p>
      </div>

      <div className={styles.page__content}>
        {loadingData && (
          <p className={styles.form__loadingNote}>Cargando datos…</p>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* COLUMNA IZQUIERDA — Datos del contrato */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className={styles.page__main}>
          {/* ── Propiedad y tipo ── */}
          <fieldset className={styles.form__section}>
            <legend className={styles.form__sectionTitle}>Propiedad y tipo</legend>

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
                      {p.title} ({p.type ?? p.propertyType ?? ''})
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
              <input
                id="cc-amount"
                type="number"
                name="amount"
                className={styles.form__input}
                value={form.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </fieldset>

          {/* ── Partes del contrato ── */}
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
                        {c.name ?? c.userName} ({c.email ?? c.userEmail})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* ── Agentes ── */}
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

          {/* ── Comisiones ── */}
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
            {commissionError && (
              <p className={styles.form__error}>{commissionError}</p>
            )}
          </fieldset>

          {/* ── Fechas ── */}
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

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* COLUMNA DERECHA — Términos y condiciones */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className={styles.page__sidebar}>
          <div className={styles.terms}>
            <div className={styles.terms__header}>
              <h2 className={styles.terms__title}>Términos y Condiciones</h2>
              <p className={styles.terms__subtitle}>
                Selecciona las cláusulas que aplican a este contrato
              </p>
              <div className={styles.terms__actions}>
                <button
                  type="button"
                  className={styles.terms__actionBtn}
                  onClick={selectAllClauses}
                >
                  Seleccionar todas
                </button>
                <button
                  type="button"
                  className={styles.terms__actionBtn}
                  onClick={clearAllClauses}
                >
                  Limpiar
                </button>
              </div>
            </div>

            <div className={styles.terms__list}>
              {availableClauses.map((clause) => {
                const checked = selectedClauses.includes(clause.id);
                return (
                  <label
                    key={clause.id}
                    className={`${styles.terms__clause} ${checked ? styles['terms__clause--active'] : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleClause(clause.id)}
                      className={styles.terms__checkbox}
                    />
                    <div className={styles.terms__clauseContent}>
                      <span className={styles.terms__clauseLabel}>{clause.label}</span>
                      <p className={styles.terms__clauseText}>{clause.text}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* ── Condiciones adicionales libres ── */}
            <div className={styles.terms__custom}>
              <label className={styles.form__label} htmlFor="cc-custom-terms">
                Condiciones adicionales
              </label>
              <textarea
                id="cc-custom-terms"
                className={`${styles.form__input} ${styles['form__input--textarea']}`}
                value={customTerms}
                onChange={(e) => setCustomTerms(e.target.value)}
                rows={4}
                placeholder="Escribe condiciones especiales adicionales…"
              />
            </div>

            {/* ── Vista previa ── */}
            {(selectedClauses.length > 0 || customTerms.trim()) && (
              <div className={styles.terms__preview}>
                <h3 className={styles.terms__previewTitle}>
                  Vista previa ({selectedClauses.length} cláusula{selectedClauses.length !== 1 ? 's' : ''})
                </h3>
                <pre className={styles.terms__previewText}>{buildTermsText()}</pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer con acciones ── */}
      <div className={styles.page__footer}>
        <button
          type="button"
          className={`${styles.btn} ${styles['btn--ghost']}`}
          onClick={() => navigate('/agent/contratos')}
          disabled={isPending}
        >
          Cancelar
        </button>
        <div className={styles.page__footerActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles['btn--secondary']}`}
            onClick={() => handleSubmit(false)}
            disabled={isPending || !!commissionError}
          >
            <FiSave />
            {isPending ? 'Guardando…' : 'Guardar borrador'}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles['btn--primary']}`}
            onClick={() => handleSubmit(true)}
            disabled={isPending || !!commissionError}
          >
            <FiSend />
            {isPending ? 'Enviando…' : 'Crear y enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
