import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Dropdown, Spinner, Alert } from 'react-bootstrap';
import CustomNavbar from '../components/Landing/Navbar';
import Footer from '../components/Landing/Footer';
import StatsCards from '../components/visits/StatsCards';
import VisitCard from '../components/visits/VisitCard';
import SuggestTimeModal from '../components/visits/SuggestTimeModal';
import ActionMessageModal from '../components/visits/ActionMessageModal';
import {
  getMyVisitRequestsAsAgent,
  acceptVisitRequest,
  rejectVisitRequest,
  counterProposeVisitRequest,
} from '../services/visits/visitApi';

const FILTER_OPTIONS = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Aceptadas', value: 'ACCEPTED' },
  { label: 'Contra-propuestas', value: 'COUNTER_PROPOSED' },
  { label: 'Rechazadas', value: 'REJECTED' },
  { label: 'Canceladas', value: 'CANCELLED' },
];

const VisitRequests = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [successConfig, setSuccessConfig] = useState({ title: '', description: '', buttons: [] });

  // ─── Fetch visits ────────────────────────────────────────────
  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyVisitRequestsAsAgent();
      setVisits(data);
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || 'No se pudieron cargar las solicitudes de visita. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // ─── Stats ───────────────────────────────────────────────────
  const stats = useMemo(() => ({
    pending: visits.filter(v => v.status === 'PENDING').length,
    accepted: visits.filter(v => v.status === 'ACCEPTED').length,
    rejected: visits.filter(v => v.status === 'REJECTED').length,
    total: visits.length,
  }), [visits]);

  // ─── Filtered list ──────────────────────────────────────────
  const filteredVisits = useMemo(() => {
    if (filter === 'ALL') return visits;
    return visits.filter(v => v.status === filter);
  }, [visits, filter]);

  // ─── Actions ─────────────────────────────────────────────────
  const handleConfirm = async (id) => {
    try {
      setActionLoading(true);
      const updated = await acceptVisitRequest(id);
      setVisits(prev => prev.map(v => v.id === id ? updated : v));
      setSuccessConfig({
        title: 'La confirmación ha sido enviada',
        description: 'Esta visita fue agregada a tu agenda',
        buttons: [
          { label: 'Ver mi agenda', variant: 'outline-primary', onClick: () => setShowSuccessModal(false) },
          { label: 'Cerrar', variant: 'primary', onClick: () => setShowSuccessModal(false) },
        ],
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error al aceptar solicitud:', err);
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || 'Error al confirmar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(true);
      const updated = await rejectVisitRequest(id);
      setVisits(prev => prev.map(v => v.id === id ? updated : v));
      setShowRejectModal(true);
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || 'Error al rechazar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuggest = (visit) => {
    setSelectedVisit(visit);
    setShowSuggestModal(true);
  };

  const handleSaveSuggestion = async (id, formData) => {
    try {
      setActionLoading(true);
      const payload = {
        counterProposedAt: formData.counterProposedAt,
        counterProposeMessage: formData.counterProposeMessage || null,
      };
      const updated = await counterProposeVisitRequest(id, payload);
      setVisits(prev => prev.map(v => v.id === id ? updated : v));
      setShowSuggestModal(false);
      setSuccessConfig({
        title: 'Sugerencia enviada',
        description: 'El solicitante será informado sobre tu propuesta de nuevo horario',
        buttons: [
          { label: 'Cerrar', variant: 'primary', onClick: () => setShowSuccessModal(false) },
        ],
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error al contra-proponer:', err);
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || 'Error al enviar la sugerencia');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Active filter label ────────────────────────────────────
  const activeFilterLabel = FILTER_OPTIONS.find(o => o.value === filter)?.label || 'Todas';

  return (
    <div className="visit-requests-page">
      <CustomNavbar />

      <Container className="py-5">
        <header className="visit-requests-header">
          <h1 className="fw-bold mb-2">Solicitudes de Visitas</h1>
          <p className="text-muted mb-0">Revisa y aprueba las solicitudes de visitas a sus propiedades</p>
        </header>

        <StatsCards stats={stats} />

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
            {error}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4 mt-5">
          <Dropdown className="visit-requests-filter">
            <Dropdown.Toggle variant="link" className="text-dark fw-bold text-decoration-none p-0 h4 mb-0 d-flex align-items-center">
              {activeFilterLabel} <span className="ms-2 small">▼</span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow border-0">
              {FILTER_OPTIONS.map(opt => (
                <Dropdown.Item
                  key={opt.value}
                  className="py-2"
                  active={filter === opt.value}
                  onClick={() => setFilter(opt.value)}
                >
                  {opt.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <section>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-3">Cargando solicitudes...</p>
            </div>
          ) : filteredVisits.length > 0 ? (
            filteredVisits.map(visit => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onConfirm={handleConfirm}
                onReject={handleReject}
                onSuggest={handleSuggest}
                disabled={actionLoading}
              />
            ))
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No hay solicitudes de visitas {filter !== 'ALL' ? `con estado "${activeFilterLabel}"` : 'en este momento'}.</p>
            </div>
          )}
        </section>
      </Container>

      <Footer />

      {/* Modals */}
      {selectedVisit && (
        <SuggestTimeModal
          show={showSuggestModal}
          onHide={() => setShowSuggestModal(false)}
          visit={selectedVisit}
          onSave={handleSaveSuggestion}
        />
      )}

      <ActionMessageModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        title={successConfig.title}
        description={successConfig.description}
        buttons={successConfig.buttons}
      />

      <ActionMessageModal
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        title="Se ha rechazado la solicitud"
        description="El solicitante será informado sobre tu decisión"
      />
    </div>
  );
};

export default VisitRequests;
