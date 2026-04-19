import { useState, useEffect } from 'react';
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  ALLOWED_STATUS_TRANSITIONS,
} from '../../constants/contractConstants';
import Badge from '../../components/common/Badge/Badge';
import styles from './ContractsPage.module.scss';

export default function ContractStatusModal({ contract, onConfirm, onClose, loading }) {
  const [selected, setSelected] = useState('');

  const transitions = ALLOWED_STATUS_TRANSITIONS[contract?.status] || [];

  // Sincronizar selección si el contrato o sus transiciones permitidas cambian
  useEffect(() => {
    setSelected(transitions[0] || '');
  }, [contract?.status, transitions.length]);

  if (!contract) return null;

  const handleConfirm = () => {
    if (selected) onConfirm(contract.id, selected);
  };

  return (
    <div className={styles.modal__backdrop} onClick={onClose}>
      <div
        className={`${styles.modal__box} ${styles['modal__box--sm']}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cambiar estado del contrato"
      >
        <div className={styles.modal__header}>
          <h2 className={styles.modal__title}>Cambiar estado</h2>
          <button className={styles.modal__close} onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <div className={styles.modal__body}>
          <p className={styles.modal__statusInfo}>
            Estado actual:{' '}
            <Badge variant={CONTRACT_STATUS_COLORS[contract.status] || 'neutral'}>
              {CONTRACT_STATUS_LABELS[contract.status] || contract.status}
            </Badge>
          </p>

          {transitions.length === 0 ? (
            <p className={styles.modal__noTransitions}>
              Este contrato está en un estado final y no puede modificarse.
            </p>
          ) : (
            <div className={styles.modal__statusOptions}>
              {transitions.map((s) => (
                <label key={s} className={styles.modal__statusOption}>
                  <input
                    type="radio"
                    name="nextStatus"
                    value={s}
                    checked={selected === s}
                    onChange={() => setSelected(s)}
                  />
                  <Badge variant={CONTRACT_STATUS_COLORS[s] || 'neutral'}>
                    {CONTRACT_STATUS_LABELS[s] || s}
                  </Badge>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modal__footer}>
          <button className={styles.modal__btnClose} onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          {transitions.length > 0 && (
            <button
              className={styles.modal__btnConfirm}
              onClick={handleConfirm}
              disabled={!selected || loading}
            >
              {loading ? 'Guardando...' : 'Confirmar cambio'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
