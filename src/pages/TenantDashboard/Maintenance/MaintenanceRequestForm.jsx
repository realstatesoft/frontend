import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUpload, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Button from '../../../components/common/Button/Button';
import { uploadImage } from '../../../services/images/imageApi';
import styles from './MaintenanceRequestForm.module.scss';

const CATEGORIES = [
  { value: 'PLUMBING', label: 'Plomería' },
  { value: 'ELECTRICAL', label: 'Electricidad' },
  { value: 'HVAC', label: 'Aire Acondicionado / Calefacción' },
  { value: 'APPLIANCE', label: 'Electrodomésticos' },
  { value: 'STRUCTURAL', label: 'Estructural' },
  { value: 'PEST_CONTROL', label: 'Control de Plagas' },
  { value: 'LANDSCAPING', label: 'Jardinería' },
  { value: 'CLEANING', label: 'Limpieza' },
  { value: 'OTHER', label: 'Otro' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'EMERGENCY', label: 'Urgencia / Emergencia' },
];

export default function MaintenanceRequestForm({ onSubmit, onCancel, isSubmitting, leases = [] }) {
  const { t } = useTranslation('tenant');
  const [formData, setFormData] = useState({
    leaseId: leases.length === 1 ? leases[0].id : '',
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    permissionToEnter: false,
  });
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const previewUrlsRef = useRef([]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Tipo de archivo no válido. Solo JPG, PNG o WEBP.';
    }
    if (file.size > maxSize) {
      return 'El archivo es demasiado grande. Máximo 5MB.';
    }
    return null;
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    if (images.length + newFiles.length > 5) {
      setError('Máximo 5 imágenes permitidas.');
      return;
    }

    const validFiles = [];
    const previews = [];

    for (const file of newFiles) {
      const err = validateFile(file);
      if (err) {
        setError(err);
        return;
      }
      validFiles.push(file);
      const url = URL.createObjectURL(file);
      previews.push(url);
      previewUrlsRef.current.push(url);
    }

    setImages((prev) => [...prev, ...previews]);
    setImageFiles((prev) => [...prev, ...validFiles]);
    setError('');
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    const urlToRevoke = images[index];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
      previewUrlsRef.current = previewUrlsRef.current.filter((u) => u !== urlToRevoke);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leaseId || !formData.title || !formData.description || !formData.category) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    setError('');
    try {
      // 1. Upload images
      const imageUrls = [];
      for (const file of imageFiles) {
        const res = await uploadImage(file, 'maintenance');
        imageUrls.push(res.data.data.url);
      }

      // 2. Submit request
      await onSubmit({ ...formData, images: imageUrls });
    } catch (err) {
      setError('Error al enviar la solicitud. Por favor intenta de nuevo.');
      console.error(err);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>Reportar Problema</h2>
      <p className={styles.formSubtitle}>Describe el problema detalladamente para que podamos ayudarte lo antes posible.</p>

      {error && (
        <div className={styles.errorMessage}>
          <FiAlertCircle /> {error}
        </div>
      )}

      {leases.length > 1 && (
        <div className={styles.field}>
          <label htmlFor="leaseId">Propiedad *</label>
          <select
            id="leaseId"
            name="leaseId"
            value={formData.leaseId}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>Selecciona la propiedad afectada</option>
            {leases.map((lease) => (
              <option key={lease.id} value={lease.id}>
                {lease.propertyTitle || lease.propertyAddress}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="title">Título de la solicitud *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Ej: Filtración de agua en baño"
          required
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="category">Categoría *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>Selecciona una categoría</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="priority">Prioridad</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
          >
            {PRIORITIES.map((pri) => (
              <option key={pri.value} value={pri.value}>{pri.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Descripción detallada *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe el problema, cuándo comenzó y su ubicación exacta..."
          rows={4}
          required
        />
      </div>

      <div className={styles.field}>
        <label>Fotos (Máx 5)</label>
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Subir fotos de mantenimiento"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            multiple
            accept="image/*"
            style={{ display: 'none' }}
          />
          <FiUpload className={styles.dropzoneIcon} />
          <p>Arrastra imágenes aquí o haz clic para seleccionar</p>
          <span>Soporta JPG, PNG, WEBP (Máx 5MB)</span>
        </div>

        {images.length > 0 && (
          <div className={styles.previewGrid}>
            {images.map((src, index) => (
              <div key={index} className={styles.previewItem}>
                <img src={src} alt={`Preview ${index}`} />
                <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(index); }}>
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.checkboxField}>
        <input
          type="checkbox"
          id="permissionToEnter"
          name="permissionToEnter"
          checked={formData.permissionToEnter}
          onChange={handleInputChange}
        />
        <label htmlFor="permissionToEnter">
          Doy permiso de entrada a la propiedad en mi ausencia para realizar la reparación.
        </label>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
        </Button>
      </div>
    </form>
  );
}
