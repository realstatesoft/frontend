import { useState } from "react";
import { Container, Card, Form, Alert } from "react-bootstrap";
import { useCreatePropertyForm } from "../../hooks/useCreatePropertyForm";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import ConfirmDialog from "../../components/commons/ConfirmDialog";
import {
  BasicInfoSection,
  PropertyFeaturesSection,
  ConstructionSection,
  InteriorAndRoomsSection,
  FormActionsSection,
} from "./sections";

export default function CreateProperty() {
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    form,
    loading,
    error,
    success,
    fieldErrors,
    validateForm,
    set,
    setArr,
    updateRoom,
    addRoom,
    removeRoom,
    handleSubmit,
    dismissError,
    dismissSuccess,
  } = useCreatePropertyForm();

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    // Validar antes de mostrar el diálogo de confirmación
    const ok = validateForm();
    if (!ok) {
      // Asegurarnos de que el usuario vea el mensaje y los campos marcados
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmCreate = () => {
    // Ejecutar la lógica de submit (ya validado previamente)
    handleSubmit({ preventDefault: () => {} });
    setShowConfirm(false);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  return (
    <>
    <CustomNavbar />
    <div className="bg-light min-vh-100 py-4">
      <Container style={{ maxWidth: "auto" }}>
        <Card className="text-start border-0 shadow-sm rounded-4 p-4 p-md-5">
          <h3 className="fw-bold mb-4 text-start">Registrar Propiedad</h3>

          {success && (
            <Alert variant="success" onClose={dismissSuccess} dismissible>
              <i className="bi bi-check-circle-fill me-2" />
              Propiedad registrada exitosamente.
            </Alert>
          )}
          {error && (
            <Alert variant="danger" onClose={dismissError} dismissible>
              <i className="bi bi-exclamation-triangle-fill me-2" />
              {error}
            </Alert>
          )}

          <Form onSubmit={handleOpenConfirm} noValidate>
            <BasicInfoSection form={form} set={set} fieldErrors={fieldErrors} />
            <PropertyFeaturesSection form={form} set={set} setArr={setArr} />
            <ConstructionSection form={form} set={set} />
            <InteriorAndRoomsSection
              form={form}
              set={set}
              updateRoom={updateRoom}
              addRoom={addRoom}
              removeRoom={removeRoom}
            />
            <FormActionsSection loading={loading} />
          </Form>

          <ConfirmDialog
            show={showConfirm}
            onHide={handleCancelConfirm}
            onConfirm={handleConfirmCreate}
            title="Confirmar creación de propiedad"
            message="¿Estás seguro que deseas guardar esta propiedad con la información cargada?"
            confirmText="Sí, guardar"
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
