import { IoCheckmark } from "react-icons/io5";

/**
 * SelectableChip — chip de selección para el formulario de preferencias.
 *
 * @param {{ label: string, selected: boolean, onClick: () => void, disabled?: boolean }} props
 */
export default function SelectableChip({ label, selected, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className={`pref-chip${selected ? " pref-chip--selected" : ""}${disabled ? " pref-chip--disabled" : ""}`}
      onClick={disabled ? undefined : onClick}
      aria-pressed={selected}
      disabled={disabled}
    >
      {selected && (
        <span className="pref-chip__check" aria-hidden="true">
          <IoCheckmark />
        </span>
      )}
      {label}
    </button>
  );
}
