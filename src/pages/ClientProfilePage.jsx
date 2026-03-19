import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import CustomNavbar from '../components/Landing/Navbar';
import Footer from '../components/Landing/Footer';
import ProfileHeader from '../components/Clients/ProfileHeader';
import ProfileStats from '../components/Clients/ProfileStats';
import ProfileDetails from '../components/Clients/ProfileDetails';
import clientApi from '../services/clients/clientApi';

const ClientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchClient = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await clientApi.getClientProfile(id);
        if (!isCancelled) {
          setClient(data);
        }
      } catch (err) {
        if (!isCancelled) {
          // Si es 404 o 403, redirigir a Not Found (seguridad por oscuridad)
          if (err.response?.status === 404 || err.response?.status === 403) {
            navigate('/404', { replace: true });
          } else if (err.response?.status !== 401) {
            // Si no es 401 (que maneja el interceptor global), mostrar error genérico
            setError('No se pudo cargar el perfil del cliente.');
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    if (isAuthenticated) {
      fetchClient();
    }

    return () => {
      isCancelled = true;
    };
  }, [id]);

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
        <ProfileDetails client={client} />
      </Container>
      <Footer />
    </div>
  );
};

export default ClientProfilePage;
