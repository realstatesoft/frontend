import { useState } from "react";
import { Container, Card, Form, Alert, Spinner, Stack, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import {
  PersonalInfoSection,
  InternalInfoSection,
  SearchPreferencesSection,
} from "./sections";
import { useAuth } from "../../hooks/useAuth";
import { createExternalClient } from "../../services/clients/clientApi";
import { EMPTY_FORM, formToPayload } from "./utils/clientFormUtils";

export default function RegisterClient() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Generic setter factory — same pattern as usePropertyForm
  const set = (field) => (e) => {
    const value = e?.target !== undefined ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Array setter factory
  const setArr = (field) => (value) => {
    if (typeof value === "function") {
      setForm((prev) => ({ ...prev, [field]: value(prev[field]) }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = "El nombre es requerido.";
    if (!form.lastName.trim()) errors.lastName = "El apellido es requerido.";
    if (!form.phone.trim()) errors.phone = "El teléfono es requerido.";
    if (form.propertyTypes.length === 0)
      errors.propertyTypes = "Selecciona al menos un tipo de propiedad.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = formToPayload(form);

      // Combine firstName + lastName into `name` for the external-client endpoint
      payload.name = [payload.firstName, payload.lastName].filter(Boolean).join(" ");
      // Map fields expected by external-client endpoint
      payload.email = payload.userEmail;
      payload.phone = payload.userPhone;
      // Inject the logged-in agent's ID
      payload.agentId = user?.userId ?? null;

      await createExternalClient(payload);

      await Swal.fire({
        icon: "success",
        title: "Prospecto registrado",
        text: "El cliente externo fue creado exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate(-1);
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err?.message ||
        "Ocurrió un error al guardar el cliente.";

      console.error("Error al registrar prospecto:", err?.response?.data ?? err);

      // Show detailed error via SweetAlert2
      await Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: serverMsg,
      });

      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomNavbar />
      <div className="bg-light min-vh-100 py-4">
        <Container>
          <Card className="text-start border-0 shadow-sm rounded-4 p-4 p-md-5">
            <h3 className="fw-semibold mb-4 text-start">
              Registrar un Cliente Externo
            </h3>

            {error && (
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                <i className="bi bi-exclamation-triangle-fill me-2" />
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} noValidate>
              <PersonalInfoSection
                form={form}
                set={set}
                fieldErrors={fieldErrors}
              />

              <hr className="my-4" />

              <InternalInfoSection
                form={form}
                set={set}
                setArr={setArr}
              />

              <hr className="my-4" />

              <SearchPreferencesSection
                form={form}
                set={set}
                setArr={setArr}
                fieldErrors={fieldErrors}
              />

              <Stack
                direction="horizontal"
                gap={2}
                className="justify-content-end pt-3 border-top"
              >
                <Button
                  variant="secondary"
                  type="button"
                  className="px-4"
                  disabled={loading}
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </Stack>
            </Form>
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
}
