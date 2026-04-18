import { useState, useEffect, useCallback } from "react";
import { Container, Card, Form, Alert, Spinner, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { usePropertyForm } from "../../hooks/usePropertyForm";
import { useAuth } from "../../hooks/useAuth";
import { searchClients } from "../../services/clients/clientApi";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import ConfirmDialog from "../../components/commons/ConfirmDialog";
import { FormSectionTitle, FormLabel } from "../../components/properties/FormComponents";
import {
  BasicInfoSection,
  PropertyFeaturesSection,
  ConstructionSection,
  InteriorAndRoomsSection,
  FormActionsSection,
} from "./sections";

export default function CreateProperty() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAgent = user?.role === "AGENT";

  const [showConfirm, setShowConfirm] = useState(false);
  // Clientes del agente (solo se cargan cuando el usuario es AGENT)
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientLoadError, setClientLoadError] = useState(false);

  const {
    form,
    loading,
    fetchLoading,
    error,
    isEditMode,
    ownerClientId,
    setOwnerClient,
    fieldErrors,
    validateForm,
    set,
    setArr,
    setFloorsCount,
    setBedrooms,
    setHalfBathrooms,
    setFullBathrooms,
    updateRoom,
    addExtraRoom,
    removeExtraRoom,
    addMedia,
    removeMedia,
    setPrimaryMedia,
    uploadingMedia,
    addModel3D,
    uploadingModel3D,
    addTour360Image,
    addTourConfig,
    uploadingTour,
    handleSubmit,
    dismissError,
  } = usePropertyForm(id);

  // Cargar clientes del agente al montar (solo en modo creación y si es agente)
  useEffect(() => {
    if (!isAgent || isEditMode) return;
    let cancelled = false;
    setLoadingClients(true);
    setClientLoadError(false);
    searchClients({ page: 0, size: 100, sort: "created_at,desc" })
      .then((res) => {
        if (!cancelled) {
          // Only show clients who have a real user account (userId != null)
          const all = res?.content ?? [];
          setClients(all.filter((c) => c.userId != null));
        }
      })
      .catch(() => { if (!cancelled) setClientLoadError(true); })
      .finally(() => { if (!cancelled) setLoadingClients(false); });
    return () => { cancelled = true; };
  }, [isAgent, isEditMode]);

  const handleOwnerChange = useCallback((e) => {
    const val = e.target.value;
    setOwnerClient(val ? Number(val) : null);
  }, [setOwnerClient]);

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    const ok = validateForm();
    if (!ok) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    handleSubmit({ preventDefault: () => {} });
    setShowConfirm(false);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  if (fetchLoading) {
    return (
      <>
        <CustomNavbar />
        <div className="bg-light min-vh-100 py-5 d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="primary" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
    <CustomNavbar />
    <div className="bg-light min-vh-100 py-4">
      <Container style={{ maxWidth: "auto" }}>
        <Card className="text-start border-0 shadow-sm rounded-4 p-4 p-md-5">
          <h3 className="semibold mb-4 text-start text-size-[30px]">
            {isEditMode ? "Editar Propiedad" : "Registrar Propiedad"}
          </h3>

          {error && (
            <Alert variant="danger" onClose={dismissError} dismissible>
              <i className="bi bi-exclamation-triangle-fill me-2" />
              {error}
            </Alert>
          )}

          <Form onSubmit={handleOpenConfirm} noValidate className="create-property-form">
            {/* ── Sección: propietario del inmueble (solo agentes, solo en creación) ── */}
            {isAgent && !isEditMode && (
              <>
                <FormSectionTitle title="Propietario del inmueble" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <FormLabel>Cliente propietario</FormLabel>
                      {loadingClients ? (
                        <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: 14 }}>
                          <Spinner animation="border" size="sm" /> Cargando clientes...
                        </div>
                      ) : clientLoadError ? (
                        <Alert variant="warning" className="py-2 mb-0" style={{ fontSize: 14 }}>
                          No se pudieron cargar los clientes. Verificá la conexión con el servidor.
                        </Alert>
                      ) : (
                        <Form.Select
                          value={ownerClientId ?? ""}
                          onChange={handleOwnerChange}
                        >
                          <option value="">— Yo soy el propietario —</option>
                          {clients.map((c) => (
                            <option key={c.id} value={c.userId}>
                              {c.name} ({c.email})
                            </option>
                          ))}
                        </Form.Select>
                      )}
                      <Form.Text className="text-muted">
                        Si publicás en nombre de un cliente, seleccionalo aquí. De lo contrario la propiedad quedará a tu nombre.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
            <BasicInfoSection form={form} set={set} fieldErrors={fieldErrors} />
            <PropertyFeaturesSection
              form={form}
              set={set}
              setArr={setArr}
              addMedia={addMedia}
              removeMedia={removeMedia}
              setPrimaryMedia={setPrimaryMedia}
              uploadingMedia={uploadingMedia}
              addModel3D={addModel3D}
              uploadingModel3D={uploadingModel3D}
              addTour360Image={addTour360Image}
              addTourConfig={addTourConfig}
              uploadingTour={uploadingTour}
            />
            <ConstructionSection form={form} set={set} />
            <InteriorAndRoomsSection
              form={form}
              setFloorsCount={setFloorsCount}
              setBedrooms={setBedrooms}
              setHalfBathrooms={setHalfBathrooms}
              setFullBathrooms={setFullBathrooms}
              updateRoom={updateRoom}
              addExtraRoom={addExtraRoom}
              removeExtraRoom={removeExtraRoom}
              fieldErrors={fieldErrors}
            />
            {/* Agentes sugeridos eliminado: no mostrar sección en CreateProperty */}
            <FormActionsSection loading={loading} />
          </Form>

          <ConfirmDialog
            show={showConfirm}
            onHide={handleCancelConfirm}
            onConfirm={handleConfirmSubmit}
            title={isEditMode ? "Confirmar actualización" : "Confirmar creación de propiedad"}
            message={isEditMode ? "¿Estás seguro que deseas guardar los cambios?" : "¿Estás seguro que deseas guardar esta propiedad con la información cargada?"}
            confirmText={isEditMode ? "Sí, guardar cambios" : "Sí, guardar"}
            cancelText="Cancelar"
            variant="primary"
            loading={loading}
          />
        </Card>
      </Container>
    </div>
    <Footer />
    </>
  );
}
