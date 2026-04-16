import { useState } from 'react';
import { FiEdit3, FiFileText, FiCamera } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useSignContract } from '../../hooks/useContracts';
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS } from '../../constants/contractConstants';
import Badge from '../../components/common/Badge/Badge';
import styles from './ContractsPage.module.scss';

const SIGNATURE_TYPES = [
  {
    value: 'ELECTRONIC',
    label: 'Firma Electrónica',
    icon: <FiEdit3 />,
    description: 'Confirmo mi aceptación haciendo clic. Válida legalmente como firma electrónica simple.',
    requiresData: false,
  },
  {
    value: 'DIGITAL',
    label: 'Firma Digital',
    icon: <FiFileText />,
    description: 'Ingresa el hash o identificador de tu certificado digital.',
    requiresData: true,
    placeholder: 'Hash o ID del certificado digital…',
  },
  {
    value: 'HANDWRITTEN_SCAN',
    label: 'Firma Escaneada',
    icon: <FiCamera />,
    description: 'Sube una imagen de tu firma manuscrita (se convierte a base64).',
    requiresData: true,
    isFile: true,
  },
];

const SIGNATURE_ROLES = [
  { value: 'BUYER',   label: 'Comprador / Inquilino' },
  { value: 'SELLER',  label: 'Vendedor / Propietario' },
  { value: 'AGENT',   label: 'Agente' },
  { value: 'WITNESS', label: 'Testigo' },
];

export default function ContractSignModal({ contract, onClose, onSuccess }) {
  const [signatureType, setSignatureType] = useState('ELECTRONIC');
  const [role, setRole] = useState('BUYER');
  const [signatureData, setSignatureData] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const signMutation = useSignContract();

  const selectedType = SIGNATURE_TYPES.find((t) => t.value === signatureType);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSignatureData(reader.result);
    reader.readAsDataURL(file);
  };

  const isValid = () => {
    if (signatureType === 'ELECTRONIC') return confirmed;
    if (signatureType === 'DIGITAL') return signatureData.trim().length > 0;
    if (signatureType === 'HANDWRITTEN_SCAN') return signatureData.length > 0;
    return false;
  };

  const handleSign = async () => {
    const result = await Swal.fire({
      title: '¿Confirmar firma?',
      html: `<p>Estás a punto de firmar el contrato <strong>#${contract.id}</strong>.<br/>Esta acción no se puede deshacer.</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, firmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1a3c5e',
    });

    if (!result.isConfirmed) return;

    try {
      await signMutation.mutateAsync({
        id: contract.id,
        signatureType,
        role,
        signatureData: signatureType === 'ELECTRONIC' ? 'ELECTRONIC_CONFIRMED' : signatureData,
      });

      Swal.fire({
        icon: 'success',
        title: '¡Firma registrada!',
        text: 'Tu firma ha sido registrada exitosamente.',
        timer: 2500,
        showConfirmButton: false,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al firmar',
        text: err?.response?.data?.message ?? 'No se pudo registrar la firma. Intenta de nuevo.',
      });
    }
  };

  if (!contract) return null;

  return (
    <div className={styles.modal__backdrop} onClick={onClose}>
      <div
        className={`${styles.modal__box} ${styles['modal__box--wide']}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Firmar contrato"
      >
        {/* Header */}
        <div className={styles.modal__header}>
          <h2 className={styles.modal__title}>Firmar Contrato #{contract.id}</h2>
          <button className={styles.modal__close} onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <div className={styles.modal__body}>
          {/* Resumen del contrato */}
          <div className={styles.sign__summary}>
            <p className={styles.sign__summaryProp}><strong>{contract.propertyTitle}</strong></p>
            <div className={styles.sign__summaryRow}>
              <span>Estado actual:</span>
              <Badge variant={CONTRACT_STATUS_COLORS[contract.status] || 'neutral'}>
                {CONTRACT_STATUS_LABELS[contract.status] || contract.status}
              </Badge>
            </div>
            <div className={styles.sign__summaryRow}>
              <span>Vendedor:</span>
              <span>{contract.sellerName || '—'}</span>
            </div>
            <div className={styles.sign__summaryRow}>
              <span>Comprador:</span>
              <span>{contract.buyerName || '—'}</span>
            </div>
          </div>

          {/* Rol del firmante */}
          <div className={styles.form__section}>
            <div className={styles.form__row}>
              <label className={styles.form__label} htmlFor="sign-role">
                Tu rol en este contrato <span className={styles.form__required}>*</span>
              </label>
              <select
                id="sign-role"
                className={styles.form__select}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {SIGNATURE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de firma */}
          <div className={styles.sign__typeGrid}>
            {SIGNATURE_TYPES.map((type) => (
              <label
                key={type.value}
                className={`${styles.sign__typeCard} ${signatureType === type.value ? styles['sign__typeCard--active'] : ''}`}
              >
                <input
                  type="radio"
                  name="signatureType"
                  value={type.value}
                  checked={signatureType === type.value}
                  onChange={() => {
                    setSignatureType(type.value);
                    setSignatureData('');
                    setConfirmed(false);
                  }}
                  className={styles.sign__typeRadio}
                />
                <span className={styles.sign__typeIcon}>{type.icon}</span>
                <span className={styles.sign__typeLabel}>{type.label}</span>
              </label>
            ))}
          </div>

          <p className={styles.sign__typeDesc}>{selectedType?.description}</p>

          {/* Input según tipo */}
          {signatureType === 'ELECTRONIC' && (
            <label className={styles.sign__confirm}>
              <input
                type="checkbox"
                id="sign-confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>
                Confirmo que he leído y acepto los términos del contrato. Entiendo que esta acción
                tiene valor legal como firma electrónica.
              </span>
            </label>
          )}

          {signatureType === 'DIGITAL' && (
            <div className={styles.form__row}>
              <label className={styles.form__label} htmlFor="sign-cert">
                Hash / ID del certificado <span className={styles.form__required}>*</span>
              </label>
              <input
                id="sign-cert"
                type="text"
                className={styles.form__input}
                value={signatureData}
                onChange={(e) => setSignatureData(e.target.value)}
                placeholder="Ej: SHA256:abc123def456..."
              />
            </div>
          )}

          {signatureType === 'HANDWRITTEN_SCAN' && (
            <div className={styles.form__row}>
              <label className={styles.form__label} htmlFor="sign-file">
                Imagen de firma manuscrita <span className={styles.form__required}>*</span>
              </label>
              <input
                id="sign-file"
                type="file"
                accept="image/*"
                className={styles.form__input}
                onChange={handleFileChange}
              />
              {signatureData && (
                <img
                  src={signatureData}
                  alt="Vista previa de firma"
                  className={styles.sign__preview}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modal__footer}>
          <button
            className={styles.modal__btnClose}
            onClick={onClose}
            disabled={signMutation.isPending}
          >
            Cancelar
          </button>
          <button
            className={styles.modal__btnConfirm}
            onClick={handleSign}
            disabled={!isValid() || signMutation.isPending}
          >
            {signMutation.isPending ? 'Firmando…' : '✍️ Firmar contrato'}
          </button>
        </div>
      </div>
    </div>
  );
}
