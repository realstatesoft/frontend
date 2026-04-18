import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import propertyApi from '../../services/properties/propertyApi';
import { searchClients } from '../../services/clients/clientApi';
import { getAllAgents } from '../../services/agents/agentApi';
import { useCreateContract } from '../../hooks/useContracts';
import { useAuth } from '../../hooks/useAuth';
import {
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_TYPE,
} from '../../constants/contractConstants';
import styles from './ContractsPage.module.scss';

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

export default function ContractCreateModal({ onClose }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [sellerName, setSellerName] = useState('');
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [commissionError, setCommissionError] = useState('');

  const { user } = useAuth();
  const isAgent = user?.role === 'AGENT';
  const createContract = useCreateContract();

  // ─── Cargar datos para los selects ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingData(true);
      try {
        // Agents load their assigned properties; owners load their own
        const propsPromise = isAgent
          ? propertyApi.getMyAssignments()
          : propertyApi.getMe({ page: 0, size: 100, status: 'PUBLISHED' });

        const [propsRes, clientsRes, agentsRes] = await Promise.all([
          propsPromise,
          searchClients({ page: 0, size: 100, sort: 'created_at,desc' }),
          getAllAgents({ page: 0, size: 100 }),
        ]);
        if (cancelled) return;

        // Agents: assignments → [{ propertyId, propertyTitle, ... }] → map to { id, title }
        // Owners: ApiResponse → data → Page → content
        if (isAgent) {
          const assignmentsRaw = propsRes?.data?.data ?? propsRes?.data ?? [];
          const list = Array.isArray(assignmentsRaw) ? assignmentsRaw : [];
          setProperties(list.map((a) => ({ id: a.propertyId, title: a.propertyTitle })));
        } else {
          const propsRaw = propsRes?.data?.data ?? propsRes?.data ?? {};
          setProperties(propsRaw.content ?? []);
        }

        // Clients: already unwrapped (searchClients returns .data?.data)
        setClients(clientsRes?.content ?? []);
        // Agents: getAllAgents returns ApiResponse wrapper
        const agentsRaw = agentsRes?.data ?? agentsRes ?? {};
        setAgents(agentsRaw.content ?? []);
      } catch {
        // No bloquear el modal si fallan los selects
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isAgent]);

  // ─── Auto-fill al seleccionar propiedad ───────────────────────────────────
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
      // mantener propId seleccionado aunque falle el detalle
    }
  };

  // ─── Validar comisiones en tiempo real ────────────────────────────────────
  const validateCommission = (updated) => {
    const total   = parseFloat(updated.commissionPct) || 0;
    const listing = parseFloat(updated.listingAgentCommissionPct) || 0;
    const buyer   = parseFloat(updated.buyerAgentCommissionPct) || 0;
    const diff    = Math.abs(total - (listing + buyer));

    if (!updated.listingAgentId && listing > 0) {
      return 'Si no hay agente listador, su comisión debe ser 0.';
    }
    if (!updated.buyerAgentId && buyer > 0) {
      return 'Si no hay agente del comprador, su comisión debe ser 0.';
    }
    if (diff > 0.01 && (updated.listingAgentId || updated.buyerAgentId)) {
      return `La comisión total (${total}%) debe ser igual a la suma de listador (${listing}%) + comprador (${buyer}%).`;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Si se borra un agente, poner su comisión en 0
      if (name === 'listingAgentId' && !value) {
        updated.listingAgentCommissionPct = '0.00';
      }
      if (name === 'buyerAgentId' && !value) {
        updated.buyerAgentCommissionPct = '0.00';
      }
      setCommissionError(validateCommission(updated));
      return updated;
    });
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validateCommission(form);
    if (err) { setCommissionError(err); return; }

    const payload = {
      propertyId:                  parseInt(form.propertyId, 10) || null,
      contractType:                form.contractType,
      buyerId:                     parseInt(form.buyerId, 10) || null,
      sellerId:                    parseInt(form.sellerId, 10) || null,
      listingAgentId:              form.listingAgentId ? parseInt(form.listingAgentId, 10) : null,
      buyerAgentId:                form.buyerAgentId   ? parseInt(form.buyerAgentId,   10) : null,
      amount:                      parseFloat(form.amount) || null,
      commissionPct:               parseFloat(form.commissionPct)               || 0,
      listingAgentCommissionPct:   parseFloat(form.listingAgentCommissionPct)   || 0,
      buyerAgentCommissionPct:     parseFloat(form.buyerAgentCommissionPct)     || 0,
      startDate:    form.startDate || null,
      endDate:      form.endDate   || null,
      terms:        form.terms     || null,
    };

    try {
      await createContract.mutateAsync(payload);
      Swal.fire({
        icon: 'success',
        title: 'Contrato creado',
        text: 'El contrato fue creado correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
      onClose();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear contrato',
        text: err?.response?.data?.message ?? 'No se pudo crear el contrato.',
      });
    }
  };

  return (
    <div className={styles.modal__backdrop} onClick={onClose}>
      <div
        className={`${styles.modal__box} ${styles['modal__box--wide']}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Nuevo contrato"
      >
        {/* Header */}
        <div className={styles.modal__header}>
          <h2 className={styles.modal__title}>Nuevo Contrato</h2>
          <button className={styles.modal__close} onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className={styles.modal__body}>
            {loadingData && (
              <p className={styles.form__loadingNote}>Cargando propiedades y clientes…</p>
            )}

            {/* ── Propiedad y tipo ── */}
            <fieldset className={styles.form__section}>
              <legend className={styles.form__sectionTitle}>Propiedad y tipo</legend>

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
                  onChange={handleChange}
                  required
                >
                  {CONTRACT_TYPE_OPTIONS.map((label) => (
                    <option key={label} value={CONTRACT_TYPE[label]}>
                      {label}
                    </option>
                  ))}
                </select>
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
                  placeholder="Se completa automáticamente al elegir propiedad"
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
            </fieldset>

            {/* ── Agentes ── */}
            <fieldset className={styles.form__section}>
              <legend className={styles.form__sectionTitle}>Agentes (opcionales)</legend>

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
            </fieldset>

            {/* ── Comisiones ── */}
            <fieldset className={styles.form__section}>
              <legend className={styles.form__sectionTitle}>Comisiones (%)</legend>

              <div className={styles.form__cols}>
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
                    Comisión agente listador
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
                    Comisión agente comprador
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

            {/* ── Fechas y términos ── */}
            <fieldset className={styles.form__section}>
              <legend className={styles.form__sectionTitle}>Vigencia y condiciones</legend>

              <div className={styles.form__cols}>
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

              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="cc-terms">
                  Términos y condiciones
                </label>
                <textarea
                  id="cc-terms"
                  name="terms"
                  className={`${styles.form__input} ${styles['form__input--textarea']}`}
                  value={form.terms}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Condiciones especiales del contrato…"
                />
              </div>
            </fieldset>
          </div>

          {/* Footer */}
          <div className={styles.modal__footer}>
            <button
              type="button"
              className={`${styles.btn} ${styles['btn--ghost']}`}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles['btn--primary']}`}
              disabled={createContract.isPending || !!commissionError}
            >
              {createContract.isPending ? 'Guardando…' : 'Crear contrato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
