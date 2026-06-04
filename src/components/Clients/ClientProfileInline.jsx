import React, { useState, useEffect, useCallback, useRef } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { IoArrowForwardOutline } from "react-icons/io5";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileDetails from "./ProfileDetails";
import ClientInteractionsPanel from "./ClientInteractionsPanel";
import clientApi from "../../services/clients/clientApi";

const ClientProfileInline = ({ show, onHide, clientId, type = "AGENT" }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isCancelledRef = useRef(false);

  const fetchClient = useCallback(async ({ silent = false } = {}) => {
    if (!clientId) return;
    try {
      if (!silent) {
        setError(null);
        setLoading(true);
      }

      let data;
      if (type === "EXTERNAL") {
        data = await clientApi.getExternalClientProfile(clientId);
        data = {
          ...data,
          userName: data.name,
          userEmail: data.email,
          userPhone: data.phone,
          isExternal: true,
        };
      } else {
        data = await clientApi.getClientProfile(clientId);
      }

      if (isCancelledRef.current) return;
      setClient(data);
    } catch (err) {
      if (isCancelledRef.current) return;
      if (!silent && err.response?.status !== 401) {
        setError("No se pudo cargar el perfil del cliente.");
      }
    } finally {
      if (!silent && !isCancelledRef.current) {
        setLoading(false);
      }
    }
  }, [clientId, type]);

  useEffect(() => {
    isCancelledRef.current = false;
    if (show && clientId) {
      fetchClient();
    }
    return () => {
      isCancelledRef.current = true;
    };
  }, [fetchClient, show, clientId]);

  if (!show) return null;

  return (
    <div style={{ animation: 'fadeIn 0.4s var(--ease-out) both' }}>
      <div className="d-flex align-items-center mb-4">
        <button 
          onClick={onHide}
          className="btn d-inline-flex align-items-center gap-2 px-3 py-2"
          style={{ 
              background: '#fff', 
              border: '1px solid var(--border-color-soft, #f1f5f9)', 
              borderRadius: '999px',
              color: 'var(--text-muted, #64748b)',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s var(--ease-out)',
              boxShadow: 'var(--shadow-sm)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-color-soft)';
          }}
        >
          <IoArrowForwardOutline style={{ transform: 'rotate(180deg)' }} />
          Volver a la lista
        </button>
      </div>

      <div className="bg-light p-4 rounded-4 shadow-sm border-0">

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : client ? (
          <>
            <ProfileHeader client={client} onClientUpdate={fetchClient} />
            <ProfileStats client={client} />
            <div className="mb-4">
              <ProfileDetails client={client} />
            </div>
            <ClientInteractionsPanel client={client} clientId={clientId} onRefreshClient={fetchClient} />
          </>
        ) : (
          <p className="text-muted text-center py-5">No se ha cargado el cliente.</p>
        )}
      </div>
    </div>
  );
};

export default ClientProfileInline;
