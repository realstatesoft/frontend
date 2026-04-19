import { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { ChatLeftText } from 'react-bootstrap-icons';
import offerApi from '../../services/offers/offerApi';
import Swal from 'sweetalert2';
import { formatPrice, parsePriceInput } from '../../utils/priceFormat';

export default function CreateOfferModal({ show, onHide, property, onSuccess, offerToEdit = null }) {
  const [displayAmount, setDisplayAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
    
    if (!numericAmount || numericAmount <= 0) {
      Swal.fire('Error', 'Por favor ingresa un monto válido mayor a 0', 'error');
      return;
    }

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
          title: '¡Oferta actualizada!',
          text: 'Tu propuesta ha sido modificada correctamente.',
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
          title: '¡Oferta enviada!',
          text: 'Tu propuesta ha sido enviada al propietario/agente.',
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
      Swal.fire('Error', error.response?.data?.message || 'No se pudo procesar la oferta. Intenta de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!offerToEdit;

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">{isEditing ? 'Editar Oferta' : 'Realizar Oferta'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="pt-3">
          <div className="mb-4 p-3 bg-light rounded-3">
            <p className="text-muted small mb-1">Propiedad:</p>
            <h6 className="text-dark fw-bold mb-0">{property?.title || offerToEdit?.propertyTitle}</h6>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Monto Propuesto</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0 fw-bold text-dark">
                ₲
              </InputGroup.Text>
              <Form.Control
                type="text"
                inputMode="numeric"
                placeholder="Ej: 500.000.000"
                value={displayAmount}
                onChange={handleAmountChange}
                required
                className="border-start-0 ps-0 fw-bold"
                style={{ fontSize: '1.1rem' }}
              />
            </InputGroup>
            {property && (
              <Form.Text className="text-muted">
                Precio de lista: ₲ {formatPrice(property.price)}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Mensaje o Condiciones (Opcional)</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0 align-items-start pt-2">
                <ChatLeftText className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Escribe aquí cualquier condición adicional..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-start-0 ps-0"
              />
            </InputGroup>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={onHide} disabled={loading} className="px-4 border-0">
            Cancelar
          </Button>
          <Button variant="dark" type="submit" disabled={loading} className="px-5 rounded-3">
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {isEditing ? 'Guardando...' : 'Enviando...'}
              </>
            ) : (
              isEditing ? 'Guardar Cambios' : 'Enviar Oferta'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
