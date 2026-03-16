import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import CustomNavbar from '../components/Landing/Navbar';
import Footer from '../components/Landing/Footer';
import ProfileHeader from '../components/Clients/ProfileHeader';
import ProfileStats from '../components/Clients/ProfileStats';
import ProfileDetails from '../components/Clients/ProfileDetails';
import clientApi from '../services/clients/clientApi';

const ClientProfilePage = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const data = await clientApi.getClientProfile(id);
        setClient(data);
      } catch (err) {
        console.error('Error fetching client profile:', err);
        setError('No se pudo cargar el perfil del cliente.');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

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
