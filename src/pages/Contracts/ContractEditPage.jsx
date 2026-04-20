import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiSend } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { getAllAgents } from '../../services/agents/agentApi';
import PriceInput from '../../components/commons/PriceInput';
import { useContractDetail, useUpdateContract, useUpdateContractStatus } from '../../hooks/useContracts';
import {
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_TYPE,
} from '../../constants/contractConstants';
import { getClausesForType } from './contractClauses';
import contractTemplateApi from '../../services/contracts/contractTemplateApi';
import { htmlToPlainText, hasMeaningfulHtmlContent, plainTextToTipTapHtml } from '../../utils/htmlToPlainText';
import ContractTemplateRichEditor from '../../components/admin/ContractTemplateRichEditor';
import styles from './ContractCreatePage.module.scss';

export default function ContractEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: contractRes, isLoading: loadingContract } = useContractDetail(id);
  const contract = contractRes?.data;

  const [form, setForm] = useState(null);
  const [sellerName, setSellerName] = useState('');
  const [agents, setAgents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [commissionError, setCommissionError] = useState('');
  const [selectedClauses, setSelectedClauses] = useState([]);
  const [customTerms, setCustomTerms] = useState('');
  const [activeTemplates, setActiveTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const updateContract = useUpdateContract();
  const updateStatus   = useUpdateContractStatus();

  // Cargar agentes
  useEffect(() => {
    let cancelled = false;
    getAllAgents({ page: 0, size: 100 })
      .then((res) => {
        if (!cancelled) {
          const raw = res?.data ?? res ?? {};
          setAgents(raw.content ?? []);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingData(false); });
    return () => { cancelled = true; };
  }, []);

  // Pre-cargar form cuando llegan los datos del contrato
  useEffect(() => {
    if (!contract) return;

    if (contract.status !== 'DRAFT') {
      Swal.fire({
        icon: 'warning',
        title: 'No editable',
        text: 'Solo puedes editar contratos en estado Borrador (DRAFT).',
      }).then(() => navigate('/agent/contratos'));
      return;
    }

    setSellerName(contract.sellerName ?? '');
    setForm({
      propertyId:                contract.propertyId ?? '',
      buyerId:                   contract.buyerId ?? '',
      sellerId:                  contract.sellerId ?? '',
      contractType:              contract.contractType ?? 'SALE',
      listingAgentId:            contract.listingAgentId ?? '',
      buyerAgentId:              contract.buyerAgentId ?? '',
      amount:                    contract.amount ? Math.floor(contract.amount) : '', // PriceInput expects integer values

      commissionPct:             contract.commissionPct ?? '3.00',
      listingAgentCommissionPct: contract.listingAgentCommissionPct ?? '3.00',
      buyerAgentCommissionPct:   contract.buyerAgentCommissionPct ?? '0.00',
      startDate:                 contract.startDate ?? '',
      endDate:                   contract.endDate ?? '',
      templateId:                contract.templateId != null ? String(contract.templateId) : '',
    });

    // Restaurar términos: separar cláusulas detectables del texto libre
    const fullTerms = contract.terms || '';
    const clauses = getClausesForType(contract.contractType);
    const detectedIds = [];
    
    // Buscar qué cláusulas están presentes en el texto basándose en su etiqueta
    clauses.forEach(c => {
      // Buscamos el patrón "N. ETIQUETA" que usamos al guardar
      if (fullTerms.toUpperCase().includes(c.label.toUpperCase())) {
        detectedIds.push(c.id);
      }
    });

    setSelectedClauses(detectedIds);

    // Intentar extraer solo las condiciones adicionales si existen
    const additionalMatch = fullTerms.match(/CONDICIONES ADICIONALES\n([\s\S]*)$/i);
    if (additionalMatch && additionalMatch[1]) {
      setCustomTerms(plainTextToTipTapHtml(additionalMatch[1].trim()));
    } else if (detectedIds.length === 0) {
      // Si no detectamos ninguna cláusula estándar, asumimos que todo es custom
      setCustomTerms(plainTextToTipTapHtml(fullTerms));
    } else {
      setCustomTerms('');
    }
  }, [contract, navigate]);

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
      return `La comisión total (${total}%) debe igualar listador (${listing}%) + comprador (${buyer}%).`;
    return '';
  }, []);

  useEffect(() => {
    if (!form?.contractType) return;
    let cancelled = false;
    setLoadingTemplates(true);
    contractTemplateApi
      .listActive(form.contractType)
      .then((list) => {
        if (!cancelled) setActiveTemplates(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setActiveTemplates([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingTemplates(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form?.contractType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'listingAgentId' && !value) updated.listingAgentCommissionPct = '0.00';
      if (name === 'buyerAgentId'   && !value) updated.buyerAgentCommissionPct   = '0.00';
      setCommissionError(validateCommission(updated));
      return updated;
    });
  };

  const handleContractTypeChange = (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const updated = { ...prev, contractType: value, templateId: '' };
      setCommissionError(validateCommission(updated));
      return updated;
    });
    setCustomTerms('');
    setSelectedClauses([]);
  };

  const handleTemplateChange = (e) => {
    const tplId = e.target.value;
    setForm((prev) => ({ ...prev, templateId: tplId }));
    if (!tplId) return;
    const tpl = activeTemplates.find((t) => String(t.id) === tplId);
    if (tpl?.content) {
      setCustomTerms(tpl.content);
      Swal.fire({
        icon: 'info',
        title: 'Plantilla aplicada',
        text: 'El contenido de la plantilla se ha copiado en condiciones adicionales; puedes editarlo con el mismo editor que en administración.',
        timer: 2600,
        showConfirmButton: false,
      });
    }
  };

  const toggleClause = (clauseId) => {
    setSelectedClauses((prev) =>
      prev.includes(clauseId) ? prev.filter((id) => id !== clauseId) : [...prev, clauseId],
    );
  };

  const buildTermsText = useCallback(() => {
    const clauses = getClausesForType(form?.contractType);
    const selected = clauses.filter((c) => selectedClauses.includes(c.id));
    const parts = selected.map((c, i) => `${i + 1}. ${c.label.toUpperCase()}\n${c.text}`);
    if (hasMeaningfulHtmlContent(customTerms)) {
      const block = htmlToPlainText(customTerms).trim();
      parts.push(`${parts.length + 1}. CONDICIONES ADICIONALES\n${block}`);
    }
    return parts.join('\n\n');
  }, [form?.contractType, selectedClauses, customTerms]);

  const handleSubmit = async (sendAfterSave = false) => {
    if (!form) return;
    const err = validateCommission(form);
    if (err) { setCommissionError(err); return; }

    const terms = buildTermsText();

    const payload = {
      id: parseInt(id, 10),
      propertyId:                parseInt(form.propertyId, 10),
      buyerId:                   parseInt(form.buyerId, 10),
      sellerId:                  parseInt(form.sellerId, 10),
      contractType:              form.contractType,
      listingAgentId:            form.listingAgentId ? parseInt(form.listingAgentId, 10) : null,
      buyerAgentId:              form.buyerAgentId   ? parseInt(form.buyerAgentId,   10) : null,
      amount:                    parseFloat(form.amount) || null,
      commissionPct:             parseFloat(form.commissionPct)               || 0,
      listingAgentCommissionPct: parseFloat(form.listingAgentCommissionPct)   || 0,
      buyerAgentCommissionPct:   parseFloat(form.buyerAgentCommissionPct)     || 0,
      startDate:  form.startDate || null,
      endDate:    form.endDate   || null,
      terms:      terms          || null,
      templateId: form.templateId ? parseInt(form.templateId, 10) : null,
    };

    try {
      await updateContract.mutateAsync(payload);

      if (sendAfterSave) {
        try {
          await updateStatus.mutateAsync({ id: parseInt(id, 10), status: 'SENT' });
          Swal.fire({
            icon: 'success',
            title: 'Guardado y enviado',
            text: 'El contrato fue actualizado y enviado a las partes.',
            timer: 2500,
            showConfirmButton: false,
          });
        } catch {
          Swal.fire({
            icon: 'warning',
            title: 'Guardado',
            text: 'Se guardaron los cambios pero no se pudo cambiar a "Enviado".',
            timer: 3000,
            showConfirmButton: false,
          });
        }
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Borrador actualizado',
          text: 'Los cambios fueron guardados.',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      navigate('/agent/contratos');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err?.response?.data?.message ?? 'No se pudo guardar el contrato.',
      });
    }
  };

  const isPending = updateContract.isPending || updateStatus.isPending;
  const availableClauses = getClausesForType(form?.contractType);

  if (loadingContract || !form) {
    return (
      <div className={styles.page}>
        <p className={styles.form__loadingNote}>Cargando contrato…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.page__header}>
        <button
          type="button"
          className={styles.page__back}
          onClick={() => navigate('/agent/contratos')}
        >
          <FiArrowLeft /> Volver a contratos
        </button>
        <h1 className={styles.page__title}>Editar Borrador #{id}</h1>
        <p className={styles.page__subtitle}>
          Modifica el contrato. Vendedor, comprador y propiedad no pueden cambiarse.
        </p>
      </div>

      {/* Info no editable */}
      <div className={styles.form__section} style={{ marginBottom: '0' }}>
        <legend className={styles.form__sectionTitle}>Partes (solo lectura)</legend>
        <div className={styles.form__grid2}>
          <div className={styles.form__row}>
            <label className={styles.form__label}>Propiedad</label>
            <input
              readOnly
              className={styles.form__input}
              value={contract?.propertyTitle ?? ''}
            />
          </div>
          <div className={styles.form__row}>
            <label className={styles.form__label}>Vendedor / Propietario</label>
            <input readOnly className={styles.form__input} value={sellerName} />
          </div>
          <div className={styles.form__row}>
            <label className={styles.form__label}>Comprador / Inquilino</label>
            <input readOnly className={styles.form__input} value={contract?.buyerName ?? ''} />
          </div>
        </div>
      </div>

      <div className={styles.page__content}>
        {/* COLUMNA IZQUIERDA */}
        <div className={styles.page__main}>

          {/* Tipo y monto */}
          <fieldset className={styles.form__section}>
            <legend className={styles.form__sectionTitle}>Tipo y monto</legend>
            <div className={styles.form__grid2}>
              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="ce-type">
                  Tipo de contrato <span className={styles.form__required}>*</span>
                </label>
                <select
                  id="ce-type"
                  name="contractType"
                  className={styles.form__select}
                  value={form.contractType}
                  onChange={handleContractTypeChange}
                >
                  {CONTRACT_TYPE_OPTIONS.map((label) => (
                    <option key={label} value={CONTRACT_TYPE[label]}>{label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="ce-amount">
                  Monto (USD) <span className={styles.form__required}>*</span>
                </label>
                <PriceInput
                  id="ce-amount"
                  name="amount"
                  className={styles.form__input}
                  value={form.amount}
                  // PriceInput handles formatting; we ensure the value passed to handleChange is what we want to store/submit
                  onChange={(e) => handleChange({ target: { name: 'amount', value: e.target.value } })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className={styles.form__row}>
              <label className={styles.form__label} htmlFor="ce-template">
                Plantilla base (opcional)
              </label>
              <select
                id="ce-template"
                className={styles.form__select}
                value={form.templateId}
                onChange={handleTemplateChange}
                disabled={loadingTemplates}
              >
                <option value="">
                  {loadingTemplates ? 'Cargando plantillas…' : '— Sin plantilla —'}
                </option>
                {activeTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.templateVersion ? ` (v${t.templateVersion})` : ''}
                  </option>
                ))}
              </select>
              <p className={styles.form__hint}>
                Al elegir una plantilla activa, su texto sustituye el bloque de condiciones adicionales para que lo revises.
              </p>
            </div>
          </fieldset>

          {/* Agentes */}
          <fieldset className={styles.form__section}>
            <legend className={styles.form__sectionTitle}>Agentes (opcionales)</legend>
            <div className={styles.form__grid2}>
              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="ce-listing-agent">Agente listador</label>
                <select
                  id="ce-listing-agent"
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
                <label className={styles.form__label} htmlFor="ce-buyer-agent">Agente del comprador</label>
                <select
                  id="ce-buyer-agent"
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

          {/* Comisiones */}
          <fieldset className={styles.form__section}>
            <legend className={styles.form__sectionTitle}>Comisiones (%)</legend>
            <div className={styles.form__grid3}>
              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="ce-comm">Total comisión</label>
                <input
                  id="ce-comm"
                  type="number"
                  name="commissionPct"
                  className={styles.form__input}
                  value={form.commissionPct}
                  onChange={handleChange}
                  min="0" max="100" step="0.01"
                />
              </div>
              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="ce-comm-listing">Agente listador</label>
                <input
                  id="ce-comm-listing"
                  type="number"
                  name="listingAgentCommissionPct"
                  className={styles.form__input}
                  value={form.listingAgentCommissionPct}
                  onChange={handleChange}
                  min="0" max="100" step="0.01"
                  disabled={!form.listingAgentId}
                />
              </div>
              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="ce-comm-buyer">Agente comprador</label>
                <input
                  id="ce-comm-buyer"
                  type="number"
                  name="buyerAgentCommissionPct"
                  className={styles.form__input}
                  value={form.buyerAgentCommissionPct}
                  onChange={handleChange}
                  min="0" max="100" step="0.01"
                  disabled={!form.buyerAgentId}
                />
              </div>
            </div>
            {commissionError && (
              <p className={styles.form__error}>{commissionError}</p>
            )}
          </fieldset>

          {/* Fechas */}
          <fieldset className={styles.form__section}>
            <legend className={styles.form__sectionTitle}>Vigencia</legend>
            <div className={styles.form__grid2}>
              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="ce-start">Fecha inicio</label>
                <input
                  id="ce-start"
                  type="date"
                  name="startDate"
                  className={styles.form__input}
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.form__row}>
                <label className={styles.form__label} htmlFor="ce-end">Fecha fin</label>
                <input
                  id="ce-end"
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

        {/* COLUMNA DERECHA — Términos */}
        <div className={styles.page__sidebar}>
          <div className={styles.terms}>
            <div className={styles.terms__header}>
              <h2 className={styles.terms__title}>Términos y Condiciones</h2>
              <p className={styles.terms__subtitle}>Selecciona las cláusulas a incluir</p>
              <div className={styles.terms__actions}>
                <button
                  type="button"
                  className={styles.terms__actionBtn}
                  onClick={() => setSelectedClauses(availableClauses.map((c) => c.id))}
                >
                  Seleccionar todas
                </button>
                <button
                  type="button"
                  className={styles.terms__actionBtn}
                  onClick={() => setSelectedClauses([])}
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

            <div className={styles.terms__custom}>
              <label className={styles.form__label}>
                Condiciones adicionales
              </label>
              <div className={styles.terms__customEditor}>
                <ContractTemplateRichEditor
                  value={customTerms}
                  onChange={setCustomTerms}
                  placeholder="Cláusulas personalizadas, acuerdos específicos o condiciones adicionales…"
                  disabled={loadingContract || loadingData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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
            {isPending ? 'Enviando…' : 'Guardar y enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
