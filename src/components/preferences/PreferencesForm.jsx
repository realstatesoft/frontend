import { useState, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { IoWarning } from "react-icons/io5";
import SelectableChip from "./SelectableChip";
import RangeInputRow from "./RangeInputRow";
import ValidationError from "./ValidationError";

// Códigos de categorías que tienen selección única
const SINGLE_SELECT_CODES = ["WATER_CONNECTION", "SANITARY_INSTALLATION"];

// Códigos de categorías que son rangos numéricos (no chips)
const RANGE_CODES = {
  PRICE: { label: "Precio", unit: "USD", fieldName: "PRICE" },
  SURFACE: { label: "Superficie", unit: "m²", fieldName: "SURFACE" },
  BEDROOMS: { label: "Dormitorios", unit: null, fieldName: "BEDROOMS" },
};

/**
 * Inicializa el estado de rangos a partir de las preferencias existentes.
 * @param {import('../../types/preferences').RangePreference[]} existingRanges
 */
function initRanges(existingRanges = []) {
  const base = { PRICE: { min: "", max: "" }, SURFACE: { min: "", max: "" }, BEDROOMS: { min: "", max: "" } };
  existingRanges.forEach(({ fieldName, minValue, maxValue }) => {
    if (base[fieldName]) {
      base[fieldName] = {
        min: minValue != null ? String(minValue) : "",
        max: maxValue != null ? String(maxValue) : "",
      };
    }
  });
  return base;
}

/**
 * Inicializa el conjunto de IDs seleccionados a partir de las preferencias existentes.
 * @param {import('../../types/preferences').PreferenceOption[]} selectedOptions
 */
function initSelected(selectedOptions = []) {
  return new Set(selectedOptions.map((o) => o.id));
}

/**
 * PreferencesForm — formulario completo de preferencias del usuario.
 *
 * @param {{
 *   options: import('../../types/preferences').PreferenceCategory[] | null,
 *   optionsLoading: boolean,
 *   error: string | null,
 *   onRetry: () => void,
 *   initialPreferences?: import('../../types/preferences').UserPreferenceResponse | null,
 *   onSubmit: (data: { selectedOptionIds: number[], ranges: import('../../types/preferences').RangePreference[] }) => Promise<void>,
 *   isSaving: boolean,
 *   submitLabel?: string,
 *   onSkip?: () => void,
 *   skipLabel?: string,
 * }} props
 */
export default function PreferencesForm({
  options,
  optionsLoading,
  error,
  onRetry,
  initialPreferences = null,
  onSubmit,
  isSaving,
  submitLabel = "Guardar preferencias",
  onSkip,
  skipLabel = "Saltar por ahora, lo haré después",
}) {
  const { t } = useTranslation("preferences");
  const [selectedIds, setSelectedIds] = useState(
    () => initSelected(initialPreferences?.selectedOptions)
  );
  const [ranges, setRanges] = useState(
    () => initRanges(initialPreferences?.ranges)
  );
  const [validationError, setValidationError] = useState(null);

  // ── Handlers de chips ──────────────────────────────────────────────────────

  const toggleMulti = useCallback((optionId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(optionId) ? next.delete(optionId) : next.add(optionId);
      return next;
    });
    setValidationError(null);
  }, []);

  const toggleSingle = useCallback((categoryOptions, optionId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      // Quitar cualquier otra opción de esta categoría
      categoryOptions.forEach((o) => next.delete(o.id));
      // Si estaba seleccionado, quedó removido (deselección) — si no, seleccionarlo
      if (!prev.has(optionId)) next.add(optionId);
      return next;
    });
    setValidationError(null);
  }, []);

  // ── Handlers de rangos ─────────────────────────────────────────────────────

  const setRangeValue = useCallback((fieldName, key, value) => {
    setRanges((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], [key]: value },
    }));
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      setValidationError(t("validationRequired"));
      return;
    }

    setValidationError(null);

    const rangesPayload = Object.entries(ranges)
      .map(([fieldName, { min, max }]) => ({
        fieldName,
        minValue: min !== "" ? Number(min) : null,
        maxValue: max !== "" ? Number(max) : null,
      }))
      .filter(({ minValue, maxValue }) => minValue != null || maxValue != null);

    await onSubmit({
      selectedOptionIds: Array.from(selectedIds),
      ranges: rangesPayload,
    });
  };

  // ── Skeleton ───────────────────────────────────────────────────────────────

  if (optionsLoading) {
    return (
      <div className="pref-skeleton">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="pref-skeleton__block">
            <div className="pref-skeleton__title" />
            <div className="pref-skeleton__chips">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="pref-skeleton__chip" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="pref-error">
        <span className="pref-error__icon"><IoWarning /></span>
        <p className="pref-error__msg">{error}</p>
        <button type="button" className="pref-error__retry" onClick={onRetry}>
          {t("retry")}
        </button>
      </div>
    );
  }

  if (!options || options.length === 0) return null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="pref-form">
      <div className="pref-form__body">
        {options.map((category) => {
          const isRange = Boolean(RANGE_CODES[category.code]);
          const isSingle = SINGLE_SELECT_CODES.includes(category.code);

          if (isRange) {
            const rangeDef = RANGE_CODES[category.code];
            return (
              <div key={category.id} className="pref-form__category">
                <h3 className="pref-form__category-title">{category.name}</h3>
                <RangeInputRow
                  label={rangeDef.label}
                  unit={rangeDef.unit}
                  fieldName={rangeDef.fieldName}
                  minValue={ranges[category.code]?.min ?? ""}
                  maxValue={ranges[category.code]?.max ?? ""}
                  onMinChange={(val) => setRangeValue(category.code, "min", val)}
                  onMaxChange={(val) => setRangeValue(category.code, "max", val)}
                />
              </div>
            );
          }

          return (
            <div key={category.id} className="pref-form__category">
              <h3 className="pref-form__category-title">
                {category.name}
                {isSingle && (
                  <span className="pref-form__category-hint">· {t("singleSelect")}</span>
                )}
              </h3>
              <div className="pref-form__chips">
                {category.options.map((option) => (
                  <SelectableChip
                    key={option.id}
                    label={option.label}
                    selected={selectedIds.has(option.id)}
                    onClick={() =>
                      isSingle
                        ? toggleSingle(category.options, option.id)
                        : toggleMulti(option.id)
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ValidationError message={validationError} />

      {/* Sticky footer con acciones */}
      <div className="pref-form__footer">
        <button
          type="button"
          className="pref-form__submit"
          onClick={handleSubmit}
          disabled={isSaving}
          id="pref-submit-btn"
        >
          {isSaving ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {t("saving")}
            </>
          ) : (
            submitLabel
          )}
        </button>

        {onSkip && (
          <button
            type="button"
            className="pref-form__skip"
            onClick={onSkip}
            disabled={isSaving}
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
}
