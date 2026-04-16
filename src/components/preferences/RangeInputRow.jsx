/**
 * RangeInputRow — fila con inputs numéricos de mínimo y máximo.
 *
 * @param {{
 *   label: string,
 *   unit?: string,
 *   minValue: string | number | null,
 *   maxValue: string | number | null,
 *   onMinChange: (val: string) => void,
 *   onMaxChange: (val: string) => void,
 *   fieldName: string,
 * }} props
 */
export default function RangeInputRow({
  label,
  unit,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  fieldName,
}) {
  return (
    <div className="pref-range">
      <div className="pref-range__header">
        <span className="pref-range__label">{label}</span>
        {unit && <span className="pref-range__unit">{unit}</span>}
      </div>
      <div className="pref-range__inputs">
        <div className="pref-range__input-wrap">
          <label htmlFor={`range-${fieldName}-min`} className="pref-range__sublabel">
            Mínimo
          </label>
          <input
            id={`range-${fieldName}-min`}
            type="number"
            className="pref-range__input"
            placeholder="0"
            min={0}
            value={minValue ?? ""}
            onChange={(e) => onMinChange(e.target.value)}
          />
        </div>

        <span className="pref-range__separator">—</span>

        <div className="pref-range__input-wrap">
          <label htmlFor={`range-${fieldName}-max`} className="pref-range__sublabel">
            Máximo
          </label>
          <input
            id={`range-${fieldName}-max`}
            type="number"
            className="pref-range__input"
            placeholder="Sin límite"
            min={0}
            value={maxValue ?? ""}
            onChange={(e) => onMaxChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}