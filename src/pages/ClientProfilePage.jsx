import React, { useState, useEffect, useCallback, useRef } from "react";
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
    <div className="bg-light min-vh-100" style={{ fontFamily: '"Poppins", sans-serif' }}>
      <CustomNavbar />
      <Container className="py-5">
        <p className="text-muted mb-4">Perfil de Cliente (de un Agente)</p>
        <ProfileHeader client={client} />
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
