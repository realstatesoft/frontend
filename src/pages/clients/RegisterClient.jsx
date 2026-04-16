import { useState } from "react";
import {
  Container,
  Card,
  Form,
  Alert,
  Spinner,
  Stack,
  Button,
  Nav,
  InputGroup,
  Row,
  Col,
  Accordion,
} from "react-bootstrap";
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
import {
  createExternalClient,
  createAgentClient,
} from "../../services/clients/clientApi";
import { searchUserByEmail } from "../../services/users/userApi";
import { EMPTY_FORM, formToPayload } from "./utils/clientFormUtils";

export default function RegisterClient() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Mode: "external" (current flow) or "existing" (link existing user) ──
  const [mode, setMode] = useState("external");

  // ── Form state (shared by both modes for preferences) ──
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── "Existing user" search state ──
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // ── Setter factories ──
  const set = (field) => (e) => {
    const value = e?.target !== undefined ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setArr = (field) => (value) => {
    if (typeof value === "function") {
      setForm((prev) => ({ ...prev, [field]: value(prev[field]) }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  // ── Reset on tab change ──
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setError(null);
    setSearchEmail("");
    setSearchResult(null);
    setSearchError(null);
  };

  // ── User search (existing mode) ──
  const handleSearchUser = async () => {
    const email = searchEmail.trim();
    if (!email) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const result = await searchUserByEmail(email);

      if (Number(result.id) === Number(user?.userId)) {
        setSearchError("No puedes vincularte como tu propio cliente.");
        return;
      }

      setSearchResult(result);
    } catch (err) {
      if (err?.response?.status === 404) {
        setSearchError(
          "No se encontro un usuario con ese email. Verifica que el email sea correcto o registra un cliente externo."
        );
      } else {
        setSearchError(
          err?.response?.data?.message || "Error al buscar el usuario."
        );
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // ── Validation (external mode only) ──
  const validateExternal = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = "El nombre es requerido.";
    if (!form.lastName.trim()) errors.lastName = "El apellido es requerido.";
    if (!form.phone.trim()) errors.phone = "El telefono es requerido.";
    if (form.propertyTypes.length === 0)
      errors.propertyTypes = "Selecciona al menos un tipo de propiedad.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Validation (existing mode) — only needs a found user ──
  const validateExisting = () => {
    if (!searchResult) {
      setSearchError("Primero busca un usuario por email.");
      return false;
    }
    return true;
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "external" && !validateExternal()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (mode === "existing" && !validateExisting()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "external") {
        const payload = formToPayload(form);
        payload.name = [payload.firstName, payload.lastName]
          .filter(Boolean)
          .join(" ");
        payload.email = payload.userEmail;
        payload.phone = payload.userPhone;
        payload.agentId = user?.userId ?? null;

        await createExternalClient(payload);

        await Swal.fire({
          icon: "success",
          title: "Cliente registrado",
          text: "El cliente externo fue creado exitosamente.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const payload = formToPayload(form);
        payload.agentId = user?.agentProfileId ?? null;
        payload.userId = searchResult.id;

        await createAgentClient(payload);

        await Swal.fire({
          icon: "success",
          title: "Cliente vinculado",
          text: `${searchResult.name} fue vinculado como tu cliente.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }

      navigate(-1);
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err?.message ||
        "Ocurrio un error al guardar el cliente.";

      console.error("Error al registrar cliente:", err?.response?.data ?? err);

      // Duplicate agent_client record
      const isDuplicate = serverMsg.includes("Ya existe");
      await Swal.fire({
        icon: isDuplicate ? "info" : "error",
        title: isDuplicate
          ? "Cliente ya vinculado"
          : "Error al registrar",
        text: isDuplicate
          ? `${searchResult?.name ?? "Este usuario"} ya es tu cliente. Lo puedes encontrar en tu lista de clientes.`
          : serverMsg,
      });

      if (isDuplicate) {
        navigate(-1);
        return;
      }

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
              {mode === "external"
                ? "Registrar un Cliente Externo"
                : "Vincular un Cliente Existente"}
            </h3>

            {/* ── Mode tabs ── */}
            <Nav
              variant="tabs"
              activeKey={mode}
              onSelect={handleModeChange}
              className="mb-4"
            >
              <Nav.Item>
                <Nav.Link eventKey="external">Cliente externo</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="existing">Cliente existente</Nav.Link>
              </Nav.Item>
            </Nav>

            {error && (
              <Alert
                variant="danger"
                onClose={() => setError(null)}
                dismissible
              >
                <i className="bi bi-exclamation-triangle-fill me-2" />
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} noValidate>
              {/* ── External mode: full form (current behavior) ── */}
              {mode === "external" && (
                <>
                  <PersonalInfoSection
                    form={form}
                    set={set}
                    fieldErrors={fieldErrors}
                  />
                  <hr className="my-4" />
                </>
              )}

              {/* ── Existing mode: email search + user card ── */}
              {mode === "existing" && (
                <>
                  <div className="mb-4">
                    <h5 className="fw-semibold mb-3">
                      Buscar usuario por email
                    </h5>
                    <InputGroup>
                      <Form.Control
                        type="email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearchUser();
                          }
                        }}
                        placeholder="ejemplo@correo.com"
                      />
                      <Button
                        variant="primary"
                        onClick={handleSearchUser}
                        disabled={searchLoading || !searchEmail.trim()}
                      >
                        {searchLoading ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <i className="bi bi-search me-1" />
                            Buscar
                          </>
                        )}
                      </Button>
                    </InputGroup>

                    {searchError && (
                      <Alert variant="warning" className="mt-3">
                        <i className="bi bi-info-circle me-2" />
                        {searchError}
                      </Alert>
                    )}

                    {searchResult && (
                      <Card className="mt-3 border-success bg-success bg-opacity-10">
                        <Card.Body>
                          <Row className="align-items-center">
                            <Col>
                              <div className="d-flex align-items-center gap-3">
                                <div
                                  className="rounded-circle bg-success bg-opacity-25 d-flex align-items-center justify-content-center"
                                  style={{ width: 48, height: 48 }}
                                >
                                  <i className="bi bi-person-check fs-4 text-success" />
                                </div>
                                <div>
                                  <h6 className="mb-0 fw-semibold">
                                    {searchResult.name}
                                  </h6>
                                  <small className="text-muted">
                                    {searchResult.email}
                                  </small>
                                </div>
                              </div>
                            </Col>
                            <Col xs="auto">
                              <span className="badge bg-success">
                                Usuario encontrado
                              </span>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}
                  </div>

                  {searchResult && <hr className="my-4" />}
                </>
              )}

              {/* ── Shared sections (both modes) ── */}
              {mode === "external" && (
                <>
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
                </>
              )}

              {/* ── Existing mode: optional preferences + submit ── */}
              {mode === "existing" && searchResult && (
                <>
                  <Accordion className="mb-4">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        Informacion adicional (opcional)
                      </Accordion.Header>
                      <Accordion.Body>
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
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>

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
                          Vinculando...
                        </>
                      ) : (
                        "Vincular cliente"
                      )}
                    </Button>
                  </Stack>
                </>
              )}
            </Form>
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
}
