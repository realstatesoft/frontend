import { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { ChatLeftText } from 'react-bootstrap-icons';
import offerApi from '../../services/offers/offerApi';
import Swal from 'sweetalert2';
import { formatPrice, parsePriceInput } from '../../utils/priceFormat';
import { useTranslation } from 'react-i18next';
import { useFormValidation } from '../../hooks/useFormValidation';

export default function CreateOfferModal({ show, onHide, property, onSuccess, offerToEdit = null }) {
  const { t } = useTranslation('offers');
  const [displayAmount, setDisplayAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { fieldErrors, validate, clearFieldError } = useFormValidation();

  // Inicializar modo edición si se provee una oferta
  useEffect(() => {
    if (offerToEdit) {
      setDisplayAmount(formatPrice(offerToEdit.amount));
      setMessage(offerToEdit.message || '');
    } else {
      setDisplayAmount('');
      setMessage('');
    }
  }, [offerToEdit, show]);

  const handleAmountChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatPrice(rawValue);
    setDisplayAmount(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(parsePriceInput(displayAmount));
    
    const valid = validate({
      amount: { value: numericAmount && numericAmount > 0 ? String(numericAmount) : "", label: t('modal.amountLabel'), required: true },
    });
    if (!valid) return;

    setLoading(true);
    try {
      if (offerToEdit) {
        await offerApi.updateOffer(offerToEdit.id, {
          propertyId: property ? property.id : offerToEdit.propertyId,
          amount: numericAmount,
          message: message
        });
        Swal.fire({
          icon: 'success',
          title: t('modal.updateSuccessTitle'),
          text: t('modal.updateSuccessText'),
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await offerApi.createOffer({
          propertyId: property.id,
          amount: numericAmount,
          message: message
        });
        Swal.fire({
          icon: 'success',
          title: t('modal.createSuccessTitle'),
          text: t('modal.createSuccessText'),
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      onSuccess?.();
      onHide();
    } catch (error) {
      console.error('Error with offer:', {
        message: error?.message,
        status: error?.response?.status,
        apiMessage: error?.response?.data?.message,
      });
      Swal.fire(t('modal.invalidAmountTitle'), error.response?.data?.message || t('modal.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!offerToEdit;

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">{isEditing ? t('modal.editTitle') : t('modal.createTitle')}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="pt-3">
          <div className="mb-4 p-3 bg-light rounded-3">
            <p className="text-muted small mb-1">{t('modal.propertyLabel')}</p>
            <h6 className="text-dark fw-bold mb-0">{property?.title || offerToEdit?.propertyTitle}</h6>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">{t('modal.amountLabel')}</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0 fw-bold text-dark">
                ₲
              </InputGroup.Text>
              <Form.Control
                type="text"
                inputMode="numeric"
                placeholder={t('modal.amountPlaceholder')}
                value={displayAmount}
                onChange={(e) => { handleAmountChange(e); clearFieldError('amount'); }}
                className={`border-start-0 ps-0 fw-bold ${fieldErrors.amount ? 'field-error' : ''}`}
                style={{ fontSize: '1.1rem' }}
              />
            </InputGroup>
            {fieldErrors.amount && <div className="field-error-msg">{fieldErrors.amount}</div>}
            {property && (
              <Form.Text className="text-muted">
                {t('modal.priceLabel', { price: `₲ ${formatPrice(property.price)}` })}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">{t('modal.messageLabel')}</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0 align-items-start pt-2">
                <ChatLeftText className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={t('modal.messagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-start-0 ps-0"
              />
            </InputGroup>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={onHide} disabled={loading} className="px-4 border-0">
            {t('modal.cancel')}
          </Button>
          <Button variant="dark" type="submit" disabled={loading} className="px-5 rounded-3">
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {isEditing ? t('modal.saving') : t('modal.sending')}
              </>
            ) : (
              isEditing ? t('modal.save') : t('modal.send')
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
