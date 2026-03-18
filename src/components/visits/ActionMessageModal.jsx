import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Check2Circle } from 'react-bootstrap-icons';

const ActionMessageModal = ({ show, onHide, title, description, buttons = [] }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="py-5 text-center px-4">
        <div className="mb-4 d-inline-flex p-3 rounded-circle" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
          <Check2Circle size={64} className="text-success" />
        </div>
        
        <h3 className="fw-bold mb-3">{title}</h3>
        <p className="text-muted mb-4">{description}</p>
        
        <div className="d-flex justify-content-center gap-3">
          {buttons.length > 0 ? (
            buttons.map((btn, idx) => (
              <Button 
                key={idx} 
                variant={btn.variant || 'primary'} 
                onClick={btn.onClick}
                className="rounded-pill px-4"
              >
                {btn.label}
              </Button>
            ))
          ) : (
            <Button variant="primary" onClick={onHide} className="rounded-pill px-4">
              Cerrar
            </Button>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ActionMessageModal;
