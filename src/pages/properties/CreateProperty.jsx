import { useState } from "react";
import { Container, Card, Form, Alert, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { usePropertyForm } from "../../hooks/usePropertyForm";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import ConfirmDialog from "../../components/commons/ConfirmDialog";
import {
  BasicInfoSection,
  PropertyFeaturesSection,
  ConstructionSection,
  InteriorAndRoomsSection,
  AgentSelectionSection,
  FormActionsSection,
} from "./sections";

export default function CreateProperty() {
  const { id } = useParams();


  const [showConfirm, setShowConfirm] = useState(false);

  const {
    form,
    loading,
    fetchLoading,
    error,
    isEditMode,
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
    handleSubmit,
    dismissError,
  } = usePropertyForm(id);

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
            <BasicInfoSection form={form} set={set} fieldErrors={fieldErrors} />
            <PropertyFeaturesSection
              form={form}
              set={set}
              setArr={setArr}
              addMedia={addMedia}
              removeMedia={removeMedia}
              setPrimaryMedia={setPrimaryMedia}
              uploadingMedia={uploadingMedia}
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
            {!isEditMode && <AgentSelectionSection form={form} set={set} />}
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
