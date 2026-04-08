import { useState, useEffect } from "react";
import { Container, Card, Form, Alert, Spinner, Stack, Button } from "react-bootstrap";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import {
    PersonalInfoSection,
    InternalInfoSection,
    SearchPreferencesSection,
} from "./sections";
import clientApi from "../../services/clients/clientApi";
import { EMPTY_FORM, clientToForm, formToPayload } from "./utils/clientFormUtils";


export default function EditClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();

    const type = searchParams.get('type') || 'AGENT';

    const [form, setForm] = useState(EMPTY_FORM);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    // ── Fetch existing client data ──────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        const fetchPromise = type === 'EXTERNAL'
            ? clientApi.getExternalClientProfile(id)
            : clientApi.getClientProfile(id);

        fetchPromise
            .then((data) => {
                if (!cancelled) setForm(clientToForm(data));
            })
            .catch((err) => {
                if (!cancelled) {
                    if (err.response?.status === 404 || err.response?.status === 403) {
                        navigate("/404", { replace: true });
                    } else if (err.response?.status !== 401) {
                        setError("No se pudo cargar la información del cliente.");
                    }
                }
            })
            .finally(() => {
                if (!cancelled) setFetchLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [id, type, navigate]);



    // ── Setters (same pattern as RegisterClient / usePropertyForm) ─────────────
    const set = (field) => (e) => {
        const value = e?.target !== undefined ? e.target.value : e;
        setForm((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => {
            if (!Object.prototype.hasOwnProperty.call(prev, field)) return prev;
            const { [field]: _omit, ...rest } = prev;
            return rest;
        });
    };

    const setArr = (field) => (value) => {
        if (typeof value === "function") {
            setForm((prev) => ({ ...prev, [field]: value(prev[field]) }));
        } else {
            setForm((prev) => ({ ...prev, [field]: value }));
        }
        setFieldErrors(prev => {
            const copy = { ...prev };
            delete copy[field];
            return copy;
        });
    };

    // ── Validation ──────────────────────────────────────────────────────────────
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

    // ── Submit ──────────────────────────────────────────────────────────────────
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
            
            if (type === 'EXTERNAL') {
                payload.name = [payload.firstName, payload.lastName].filter(Boolean).join(" ");
                payload.email = payload.userEmail;
                payload.phone = payload.userPhone;
                
                await clientApi.updateExternalClientProfile(id, payload);
            } else {
                await clientApi.updateClientProfile(id, payload);
            }
            
            console.log("Cliente actualizado exitosamente.");
            navigate(-1);
        } catch (err) {
            const serverMsg =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.[0] ||
                err?.message ||
                "Ocurrió un error al actualizar el cliente.";
            console.error("Error al actualizar cliente:", err?.response?.data ?? err);
            setError(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    // ── Loading skeleton while fetching ────────────────────────────────────────
    if (fetchLoading) {
        return (
            <>
                <CustomNavbar />
                <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
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
                <Container>
                    <Card className="text-start border-0 shadow-sm rounded-4 p-4 p-md-5">
                        <h3 className="fw-semibold mb-4 text-start">
                            {type === 'EXTERNAL' ? 'Editar Cliente Externo' : 'Editar Cliente'}
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
                                        "Guardar cambios"
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
