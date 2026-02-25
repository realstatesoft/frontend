import { Container, Card, Form, Alert } from "react-bootstrap";
import { useCreatePropertyForm } from "../../hooks/useCreatePropertyForm";
import {
  BasicInfoSection,
  PropertyFeaturesSection,
  ConstructionSection,
  InteriorAndRoomsSection,
  FormActionsSection,
} from "./sections";

export default function CreateProperty() {
  const {
    form,
    loading,
    error,
    success,
    set,
    setArr,
    updateRoom,
    addRoom,
    removeRoom,
    handleSubmit,
    dismissError,
    dismissSuccess,
  } = useCreatePropertyForm();

  return (
    <div className="bg-light min-vh-100 py-4">
      <Container style={{ maxWidth: 920 }}>
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

          <Form onSubmit={handleSubmit} noValidate>
            <BasicInfoSection form={form} set={set} />
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
        </Card>
      </Container>
    </div>
  );
}
