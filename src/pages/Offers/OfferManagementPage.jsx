import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Container, Card, Badge, Button, Tabs, Tab, Table, Spinner, Pagination } from 'react-bootstrap';
import { Clock, Person, House, CheckCircle, XCircle, InfoCircle, PencilSquare, Whatsapp } from 'react-bootstrap-icons';
import offerApi from '../../services/offers/offerApi';
import contractApi from '../../services/contracts/contractApi';
import Swal from 'sweetalert2';
import { formatPrice } from '../../utils/priceFormat';
import { getWhatsAppLink } from '../../utils/whatsapp';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useContractsAsListingAgent, useContractsAsSeller } from '../../hooks/useContracts';
import CustomNavbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';
import CreateOfferModal from '../../components/offers/CreateOfferModal';
import { FiMessageSquare } from 'react-icons/fi';
import styles from './OfferManagementPage.module.scss';

export default function OfferManagementPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isStandalone = location.pathname === '/ofertas';
  const role = user?.role?.toUpperCase();
  
  const [sentOffers, setSentOffers] = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [creatingContractKeys, setCreatingContractKeys] = useState([]);
  
  // Paginación
  const [sentPagination, setSentPagination] = useState({ current: 0, total: 0 });
  const [receivedPagination, setReceivedPagination] = useState({ current: 0, total: 0 });
  const PAGE_SIZE = 10;

  // Estado para edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const { data: sellerContractsRes } = useContractsAsSeller(['OWNER', 'USER', 'AGENT', 'ADMIN'].includes(role));
  const { data: listingContractsRes } = useContractsAsListingAgent(role === 'AGENT');

  const receivedPropertyIds = useMemo(
    () => [...new Set(receivedOffers.map((offer) => offer?.propertyId).filter(Boolean))],
    [receivedOffers]
  );

  const shouldFetchContractsByProperty = ['AGENT', 'ADMIN', 'OWNER', 'USER'].includes(role);
  const propertyContractsQueries = useQueries({
    queries: receivedPropertyIds.map((propertyId) => ({
      queryKey: ['contracts', 'property', propertyId],
      queryFn: () => contractApi.getByProperty(propertyId),
      enabled: shouldFetchContractsByProperty,
      staleTime: 1000 * 30,
    })),
  });

  const getOfferBuyerName = useCallback((offer) => (
    offer?.buyerName
    || offer?.buyerUserName
    || offer?.buyerFullName
    || offer?.clientName
    || offer?.userName
    || offer?.buyer?.name
    || offer?.buyer?.userName
    || offer?.buyer?.fullName
    || ''
  ), []);

  const escapeHtml = useCallback((value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;'), []);

  const getOfferBuyerEmail = useCallback((offer) => (
    offer?.buyerEmail
    || offer?.clientEmail
    || offer?.userEmail
    || offer?.buyer?.email
    || ''
  ), []);

  const getOfferBuyerPhone = useCallback((offer) => (
    offer?.buyerPhone
    || offer?.clientPhone
    || offer?.userPhone
    || offer?.buyer?.phone
    || ''
  ), []);

  const getOfferContractKey = useCallback((offer) => {
    const propertyId = offer?.propertyId ?? '';
    const buyerId = offer?.buyerId ?? '';
    const buyerName = getOfferBuyerName(offer).trim().toLowerCase();
    return `${propertyId}:${buyerId || buyerName}`;
  }, [getOfferBuyerName]);

  const normalizeName = useCallback((value) => (
    String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
  ), []);

  const propertyContractsByProperty = useMemo(() => {
    const map = new Map();

    receivedPropertyIds.forEach((propertyId, index) => {
      const queryData = propertyContractsQueries[index]?.data;
      map.set(propertyId, Array.isArray(queryData) ? queryData : []);
    });

    return map;
  }, [propertyContractsQueries, receivedPropertyIds]);

  const loadingPropertyContracts = useMemo(() => {
    const map = new Map();

    receivedPropertyIds.forEach((propertyId, index) => {
      const query = propertyContractsQueries[index];
      map.set(propertyId, Boolean(query?.isPending || query?.isFetching));
    });

    return map;
  }, [propertyContractsQueries, receivedPropertyIds]);

  const getContractCreatePath = useCallback((offer) => {
    const basePath = role === 'AGENT' ? '/agent/contratos/nuevo' : '/contratos/nuevo';
    const buyerName = getOfferBuyerName(offer);
    const buyerEmail = getOfferBuyerEmail(offer);
    const params = new URLSearchParams({
      propertyId: offer.propertyId?.toString() ?? '',
      buyerId: offer.buyerId?.toString() ?? '',
      amount: offer.amount?.toString() ?? '',
    });

    if (buyerName) params.set('buyerName', buyerName);
    if (buyerEmail) params.set('buyerEmail', buyerEmail);

    return `${basePath}?${params.toString()}`;
  }, [getOfferBuyerEmail, getOfferBuyerName, role]);

  const getOfferContactLink = useCallback((offer) => {
    const buyerPhone = getOfferBuyerPhone(offer);
    const buyerName = getOfferBuyerName(offer) || 'cliente';
    const propertyTitle = offer?.propertyTitle || 'la propiedad';
    const whatsappMessage = `Hola ${buyerName}, te contacto por tu oferta sobre ${propertyTitle}. Me gustaría avanzar formalmente con la operación.`;
    const whatsappUrl = getWhatsAppLink(buyerPhone, '595', whatsappMessage);

    if (whatsappUrl) {
      return { href: whatsappUrl, external: true, channel: 'whatsapp' };
    }

    return null;
  }, [getOfferBuyerName, getOfferBuyerPhone]);

  const existingContractKeys = useCallback(() => {
    const contractLists = [
      sellerContractsRes?.data,
      listingContractsRes?.data,
    ].filter(Array.isArray);

    return new Set(
      contractLists
        .flat()
        .map((contract) => {
          const propertyId = contract?.propertyId ?? '';
          const buyerId = contract?.buyerId ?? '';
          const buyerName = String(contract?.buyerName ?? '').trim().toLowerCase();
          return `${propertyId}:${buyerId || buyerName}`;
        })
    );
  }, [listingContractsRes, sellerContractsRes]);

  const hasExistingContract = useCallback((offer) => {
    const key = getOfferContractKey(offer);
    if (existingContractKeys().has(key)) return true;

    const propertyId = offer?.propertyId;
    const propertyContracts = propertyContractsByProperty.get(propertyId) ?? [];
    if (!propertyContracts.length) return false;

    const offerBuyerName = normalizeName(getOfferBuyerName(offer));

    return propertyContracts.some((contract) => {
      const contractBuyerName = normalizeName(contract?.buyerName);
      if (offerBuyerName && contractBuyerName) {
        return contractBuyerName === offerBuyerName;
      }

      return ['SENT', 'PARTIALLY_SIGNED', 'SIGNED'].includes(contract?.status);
    });
  }, [existingContractKeys, getOfferBuyerName, getOfferContractKey, normalizeName, propertyContractsByProperty]);

  const isCheckingPropertyContracts = useCallback((offer) => {
    if (!shouldFetchContractsByProperty) return false;
    return loadingPropertyContracts.get(offer?.propertyId) ?? false;
  }, [loadingPropertyContracts, shouldFetchContractsByProperty]);

  const isCreatingContract = useCallback((offer) => {
    const key = getOfferContractKey(offer);
    return creatingContractKeys.includes(key);
  }, [creatingContractKeys, getOfferContractKey]);

  const fetchOffers = useCallback(async (tab = activeTab, page = 0) => {
    setLoading(true);
    try {
      const needsReceivedOffers = role === 'AGENT' || role === 'OWNER' || role === 'ADMIN' || role === 'USER';
      
      const [sentRes, receivedRes] = await Promise.all([
        offerApi.getMyOffers(tab === 'sent' ? page : sentPagination.current, PAGE_SIZE),
        needsReceivedOffers 
          ? offerApi.getReceivedOffers(tab === 'received' ? page : receivedPagination.current, PAGE_SIZE) 
          : Promise.resolve({ data: { data: { content: [], totalPages: 0 } } })
      ]);
      
      // Manejar estructura de Page de Spring
      const sentData = sentRes.data?.data;
      const receivedData = receivedRes.data?.data;

      setSentOffers(sentData?.content || []);
      setSentPagination({ current: sentData?.number || 0, total: sentData?.totalPages || 0 });

      setReceivedOffers(receivedData?.content || []);
      setReceivedPagination({ current: receivedData?.number || 0, total: receivedData?.totalPages || 0 });
      
      // Si estamos en la carga inicial y no hay recibidas pero sí enviadas, cambiar de tab
      if (tab === 'received' && (receivedData?.content?.length === 0 || !needsReceivedOffers) && sentData?.content?.length > 0) {
        setActiveTab('sent');
      }
    } catch (error) {
      console.error('Error al cargar ofertas:', error);
      Swal.fire('Error', 'No se pudieron cargar las ofertas.', 'error');
    } finally {
      setLoading(false);
    }
  }, [role, activeTab, sentPagination.current, receivedPagination.current]);

  useEffect(() => {
    fetchOffers();
  }, [role]);

  const handlePageChange = (tab, newPage) => {
    setActiveTab(tab);
    fetchOffers(tab, newPage);
  };

  const handleUpdateStatus = async (offerId, status, rejectionReason = '') => {
    const actionText = status === 'ACCEPTED' ? 'aceptar' : 'rechazar';
    const confirmColor = status === 'ACCEPTED' ? '#2563eb' : '#ef4444';

    const result = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Deseas ${actionText} esta propuesta económica.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: confirmColor,
      input: status === 'REJECTED' ? 'textarea' : null,
      inputPlaceholder: 'Motivo del rechazo (opcional)...',
    });

    if (result.isConfirmed) {
      try {
        await offerApi.updateOfferStatus(offerId, {
          status,
          rejectionReason: result.value || rejectionReason
        });
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: `La oferta ha sido ${status === 'ACCEPTED' ? 'aceptada' : 'rechazada'}.`,
          timer: 2000,
          showConfirmButton: false
        });
        fetchOffers();
      } catch (error) {
        console.error('Error al actualizar oferta:', error);
        Swal.fire('Error', 'No se pudo actualizar el estado de la oferta.', 'error');
      }
    }
  };

  const handleEditClick = (offer) => {
    setEditingOffer(offer);
    setShowEditModal(true);
  };

  const getStatusBadge = (status) => {
    const configs = {
      SENT: { bg: 'primary', label: 'Enviada' },
      VIEWED: { bg: 'info', label: 'Vista' },
      ACCEPTED: { bg: 'success', label: 'Aceptada' },
      REJECTED: { bg: 'danger', label: 'Rechazada' },
      NEGOTIATING: { bg: 'warning', label: 'En Negociación', text: 'dark' },
      EXPIRED: { bg: 'secondary', label: 'Expirada' }
    };
    const config = configs[status] || { bg: 'light', label: status, text: 'dark' };
    return <Badge bg={config.bg} text={config.text} className={styles.offersPage__badge}>{config.label}</Badge>;
  };

  const OfferTable = ({ offers, isReceived, pagination }) => (
    <div className={styles.offersPage__tableWrapper}>
      <Table responsive className={styles.offersPage__table}>
        <thead>
          <tr>
            <th>Propiedad</th>
            <th>{isReceived ? 'Interesado' : 'Dueño / Agente'}</th>
            <th className="text-center">Monto Ofertado</th>
            <th>Fecha</th>
            {!isReceived && <th>Estado</th>}
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {offers.length === 0 ? (
            <tr>
              <td colSpan={isReceived ? "5" : "6"} className={styles.offersPage__empty}>
                <div className="py-5">
                  <InfoCircle size={40} className="text-muted mb-3" />
                  <p>No hay ofertas para mostrar en esta sección.</p>
                </div>
              </td>
            </tr>
          ) : (
            offers.map((offer) => (
              <tr key={offer.id}>
                <td>
                  <div className={styles.offersPage__propertyInfo}>
                    <div className={styles.offersPage__propertyIcon}>
                       <House size={18} />
                    </div>
                    <div>
                      <div className={styles.offersPage__propertyName}>{offer.propertyTitle}</div>
                      <div className={styles.offersPage__propertyId}>#{offer.propertyId}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.offersPage__personInfo}>
                    <Person size={16} />
                    <span>{isReceived ? (getOfferBuyerName(offer) || `Cliente #${offer.buyerId}`) : 'Vendedor'}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.offersPage__amount}>
                    ₲ {formatPrice(offer.amount.toString())}
                  </div>
                </td>
                <td>
                  <div className={styles.offersPage__date}>
                    <Clock size={14} />
                    {new Date(offer.createdAt).toLocaleDateString()}
                  </div>
                </td>
                {!isReceived && <td>{getStatusBadge(offer.status)}</td>}
                <td className="text-end">
                  <div className={styles.offersPage__actions}>
                    {isReceived && offer.status === 'SENT' ? (
                      <>
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          onClick={() => handleUpdateStatus(offer.id, 'ACCEPTED')}
                          className={styles.offersPage__btnAction}
                        >
                          <CheckCircle size={16} />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => handleUpdateStatus(offer.id, 'REJECTED')}
                          className={styles.offersPage__btnAction}
                        >
                          <XCircle size={16} />
                        </Button>
                      </>
                    ) : (
                      <div className="d-flex gap-2 justify-content-end flex-wrap">
                        {(() => {
                          const contactLink = getOfferContactLink(offer);

                          return (
                            <>
                        {isReceived && offer.status === 'ACCEPTED' && !isCheckingPropertyContracts(offer) && !hasExistingContract(offer) && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className={styles.offersPage__btnContract}
                            disabled={isCreatingContract(offer)}
                            onClick={() => {
                              const key = getOfferContractKey(offer);
                              setCreatingContractKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
                              navigate(getContractCreatePath(offer));
                            }}
                          >
                            {isCreatingContract(offer) ? 'Abriendo...' : 'Generar Contrato'}
                          </Button>
                        )}
                        {isReceived && offer.status === 'ACCEPTED' && contactLink && (
                          <Button
                            as="a"
                            variant="success"
                            className={`${styles.offersPage__btnContact} d-flex align-items-center gap-1`}
                            size="sm"
                            href={contactLink.href}
                            target={contactLink.external ? '_blank' : undefined}
                            rel={contactLink.external ? 'noopener noreferrer' : undefined}
                          >
                            <Whatsapp size={16} />
                            WhatsApp
                          </Button>
                        )}
                        {isReceived && offer.status === 'ACCEPTED' && (
                          <Button
                            variant="info"
                            className="text-white d-flex align-items-center gap-1"
                            size="sm"
                            onClick={() => {
                              const messagesPath = role === 'AGENT' ? '/agent/mensajes' : role === 'OWNER' ? '/owner/mensajes' : '/mensajes';
                              navigate(messagesPath, { 
                                state: { 
                                  openNewConversation: true, 
                                  preSelectedAgent: { 
                                    id: offer.buyerId, 
                                    name: getOfferBuyerName(offer), 
                                    email: getOfferBuyerEmail(offer) 
                                  } 
                                } 
                              });
                            }}
                          >
                            <FiMessageSquare size={16} />
                            Mensaje
                          </Button>
                        )}
                        {!isReceived && (offer.status === 'SENT' || offer.status === 'VIEWED') && (
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className={styles.offersPage__btnAction}
                            title="Editar Oferta"
                            onClick={() => handleEditClick(offer)}
                          >
                            <PencilSquare size={16} />
                          </Button>
                        )}
                            </>
                          );
                        })()}
                        <Button 
                          variant="light" 
                          size="sm" 
                          className={styles.offersPage__btnDetail}
                          onClick={() => {
                            const safePropertyTitle = escapeHtml(offer.propertyTitle);
                            const safeMessage = escapeHtml(offer.message || 'Sin mensaje adicional.');
                            const safeRejectionReason = offer.rejectionReason
                              ? escapeHtml(offer.rejectionReason)
                              : '';

                            Swal.fire({
                              title: 'Detalle de Oferta',
                              html: `
                                <div class="text-start">
                                  <p class="mb-2"><strong>Propiedad:</strong> ${safePropertyTitle}</p>
                                  <p class="mb-2"><strong>Monto:</strong> <span class="text-primary fw-bold">₲ ${formatPrice(offer.amount.toString())}</span></p>
                                  <hr/>
                                  <p class="mb-0 text-muted"><strong>Mensaje:</strong></p>
                                  <p class="mt-1">${safeMessage}</p>
                                  ${safeRejectionReason ? `<div class="mt-3 p-2 bg-danger-subtle rounded"><p class="mb-0 text-danger small"><strong>Motivo del rechazo:</strong></p><p class="mb-0 small">${safeRejectionReason}</p></div>` : ''}
                                </div>
                              `,
                              confirmButtonText: 'Cerrar',
                              confirmButtonColor: '#1e293b'
                            });
                          }}
                        >
                          Ver Detalle
                        </Button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      
      {pagination.total > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev 
              disabled={pagination.current === 0} 
              onClick={() => handlePageChange(isReceived ? 'received' : 'sent', pagination.current - 1)} 
            />
            {[...Array(pagination.total)].map((_, idx) => (
              <Pagination.Item 
                key={idx} 
                active={idx === pagination.current}
                onClick={() => handlePageChange(isReceived ? 'received' : 'sent', idx)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next 
              disabled={pagination.current === pagination.total - 1} 
              onClick={() => handlePageChange(isReceived ? 'received' : 'sent', pagination.current + 1)}
            />
          </Pagination>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isStandalone && <CustomNavbar />}
      <Container className={`${styles.offersPage} ${isStandalone ? 'py-5' : ''}`}>
        <div className={styles.offersPage__header}>
          <h1>Gestión de Ofertas</h1>
          <p>Controla las propuestas económicas y el seguimiento de tus negociaciones.</p>
        </div>

        {loading ? (
          <div className={styles.offersPage__loading}>
            <Spinner animation="grow" variant="primary" />
            <p>Cargando propuestas...</p>
          </div>
        ) : (
          <Card className={styles.offersPage__card}>
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className={styles.offersPage__tabs}
              >
                {(user?.role?.toUpperCase() === 'AGENT' || user?.role?.toUpperCase() === 'OWNER' || user?.role?.toUpperCase() === 'ADMIN' || receivedOffers.length > 0) && (
                  <Tab 
                    eventKey="received" 
                    title={
                      <div className="d-flex align-items-center gap-2">
                        Ofertas Recibidas
                        {receivedOffers.length > 0 && <span className={styles.offersPage__count}>{receivedOffers.length}</span>}
                      </div>
                    }
                  >
                    <OfferTable offers={receivedOffers} isReceived={true} pagination={receivedPagination} />
                  </Tab>
                )}
                <Tab 
                  eventKey="sent" 
                  title={
                    <div className="d-flex align-items-center gap-2">
                      Mis Ofertas Enviadas
                      {sentOffers.length > 0 && <span className={styles.offersPage__count}>{sentOffers.length}</span>}
                    </div>
                  }
                >
                  <OfferTable offers={sentOffers} isReceived={false} pagination={sentPagination} />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        )}
      </Container>
      {isStandalone && <Footer />}

      {/* Modal para Editar Oferta */}
      {showEditModal && (
        <CreateOfferModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setEditingOffer(null);
          }}
          offerToEdit={editingOffer}
          onSuccess={fetchOffers}
        />
      )}
    </>
  );
}
