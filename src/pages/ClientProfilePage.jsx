import React, { useState, useEffect, useCallback, useRef } from "react";
import { IoArrowForwardOutline } from "react-icons/io5";
import { useParams, Navigate, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import ProfileHeader from "../components/Clients/ProfileHeader";
import ProfileStats from "../components/Clients/ProfileStats";
import ProfileDetails from "../components/Clients/ProfileDetails";
import ClientInteractionsPanel from "../components/Clients/ClientInteractionsPanel";
import clientApi from "../services/clients/clientApi";

const ClientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isCancelledRef = useRef(false);

  const type = searchParams.get("type") || "AGENT";

  const fetchClient = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setError(null);
        setLoading(true);
      }

      let data;
      if (type === "EXTERNAL") {
        data = await clientApi.getExternalClientProfile(id);
        data = {
          ...data,
          userName: data.name,
          userEmail: data.email,
          userPhone: data.phone,
          isExternal: true,
        };
      } else {
        data = await clientApi.getClientProfile(id);
      }

      if (isCancelledRef.current) {
        return;
      }

      setClient(data);
    } catch (err) {
      if (isCancelledRef.current) {
        return;
      }

      if (err.response?.status === 404 || err.response?.status === 403) {
        navigate("/404", { replace: true });
      } else if (!silent && err.response?.status !== 401) {
        setError("No se pudo cargar el perfil del cliente.");
      }
    } finally {
      if (!silent && !isCancelledRef.current) {
        setLoading(false);
      }
    }
  }, [id, navigate, type]);

  useEffect(() => {
    isCancelledRef.current = false;
    if (isAuthenticated) {
      fetchClient();
    }

    return () => {
      isCancelledRef.current = true;
    };
  }, [fetchClient, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <CustomNavbar />
      <Container className="py-5" style={{ animation: 'fadeIn 0.8s var(--ease-out) both' }}>
        <button 
            onClick={() => navigate(-1)}
            className="btn d-inline-flex align-items-center gap-2 mb-4 px-3 py-2"
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
            Volver
        </button>
        
        <ProfileHeader client={client} onClientUpdate={fetchClient} />
        <ProfileStats client={client} />
        <div className="mb-4">
          <ProfileDetails client={client} />
        </div>
        <ClientInteractionsPanel
          client={client}
          clientId={id}
          onRefreshClient={() => fetchClient({ silent: true })}
        />
      </Container>
      <Footer />
    </div>
  );
};

export default ClientProfilePage;
