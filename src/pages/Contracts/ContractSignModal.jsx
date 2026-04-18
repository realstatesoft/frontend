import { useState, useEffect } from 'react';
import { FiEdit3, FiFileText, FiCamera } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useSignContract, useContractSignatures } from '../../hooks/useContracts';
import { useAuth } from '../../hooks/useAuth';
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
  { value: 'LISTING_AGENT', label: 'Agente Listador' },
  { value: 'BUYER_AGENT',   label: 'Agente del Comprador' },
  { value: 'WITNESS', label: 'Testigo' },
];

export default function ContractSignModal({ contract, onClose, onSuccess }) {
  const { user } = useAuth();
  const { data: signaturesRes, isLoading: loadingSigs } = useContractSignatures(contract?.id);
  const [role, setRole] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  const signMutation = useSignContract();

  // Autodetectar el rol del usuario logueado
  useEffect(() => {
    if (signaturesRes?.data && user && !role) {
      const pendingSigs = signaturesRes.data.filter(s => !s.signed);
      // Buscar si el usuario actual coincide con alguno de los que DEBEN firmar
      const myPendingRole = pendingSigs.find(s => s.userId === user.id || s.email === user.email);

      if (myPendingRole) {
        setRole(myPendingRole.role);
        setAutoDetected(true);
      }
    }
  }, [signaturesRes?.data, user, role]);

  const handleSign = async () => {
    if (!role) {
      Swal.fire('Error', 'No se ha podido detectar o seleccionar tu rol en este contrato.', 'error');
      return;
    }

    const result = await Swal.fire({
      title: '¿Confirmar firma?',
      html: `<p>Estás a punto de firmar como <strong>${SIGNATURE_ROLES.find(r => r.value === role)?.label || role}</strong>.<br/>Esta acción tiene validez legal.</p>`,
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
        signatureType: 'ELECTRONIC',
        role,
        signatureData: 'ELECTRONIC_CONFIRMED',
      });

      Swal.fire({
        icon: 'success',
        title: '¡Contrato firmado!',
        text: 'Tu firma electrónica ha sido registrada exitosamente.',
        timer: 2000,
        showConfirmButton: false,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al firmar',
        text: err?.response?.data?.message ?? 'No se pudo registrar la firma.',
      });
    }
  };

  if (!contract || loadingSigs) return null;

  return (
    <div className={styles.modal__backdrop} onClick={onClose}>
      <div
        className={styles.modal__box}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modal__header}>
          <h2 className={styles.modal__title}>Firmar documento</h2>
          <button className={styles.modal__close} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.modal__body}>
          <div className={styles.sign__summary} style={{ marginBottom: '1.5rem' }}>
            <p><strong>{contract.propertyTitle}</strong></p>
            <p className={styles.sign__summaryProp}>Contrato de {CONTRACT_STATUS_LABELS[contract.status]}</p>
          </div>

          {!autoDetected ? (
            <div className={styles.form__row}>
              <label className={styles.form__label}>Selecciona tu rol:</label>
              <select
                className={styles.form__select}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">-- Seleccionar rol --</option>
                {SIGNATURE_ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className={styles.autoRoleBox} style={{
              background: '#f0f9ff',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #bae6fd',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: 0, color: '#0369a1', fontSize: '0.9rem' }}>
                Detectamos tu identidad como: <strong>{SIGNATURE_ROLES.find(r => r.value === role)?.label}</strong>
              </p>
            </div>
          )}

          <label className={styles.sign__confirm} style={{ display: 'flex', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
            <span style={{ fontSize: '0.9rem', color: '#475569' }}>
              Acepto los términos del contrato y entiendo que mi clic tiene valor de firma electrónica legal.
            </span>
          </label>
        </div>

        <div className={styles.modal__footer}>
          <button className={styles.modal__btnClose} onClick={onClose}>Cancelar</button>
          <button
            className={styles.modal__btnConfirm}
            onClick={handleSign}
            disabled={!confirmed || !role || signMutation.isPending}
            style={{
              backgroundColor: confirmed && role ? '#1a3c5e' : '#cbd5e1',
              transition: 'all 0.3s'
            }}
          >
            {signMutation.isPending ? 'Procesando...' : 'Confirmar y Firmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
