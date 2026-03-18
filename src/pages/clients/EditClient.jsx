import { useState, useEffect } from "react";
import { Container, Card, Form, Alert, Spinner, Stack, Button } from "react-bootstrap";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import {
    PersonalInfoSection,
    InternalInfoSection,
    SearchPreferencesSection,
} from "./sections";
import clientApi from "../../services/clients/clientApi";

const EMPTY_FORM = {
    // Personal
    firstName: "",
    lastName: "",
    birthDate: "",
    maritalStatus: "",
    occupation: "",
    email: "",
    phone: "",
    address: "",
    annualIncome: "",
    // Internal
    priority: "Alta",
    status: "Activo",
    originChannel: "",
    comments: "",
    tags: [],
    isSearchingProperty: false,
    // Search preferences
    budgetRange: "",
    bedrooms: "",
    bathrooms: "",
    propertyTypes: [],
    preferredZones: [],
    preferredCharacteristics: [],
};

// Enum translations ──────────────────────────────────────────────────────────
const MARITAL_STATUS_MAP = {
    SINGLE: "Soltero/a",
    MARRIED: "Casado/a",
    DIVORCED: "Divorciado/a",
    WIDOWED: "Viudo/a",
    FREE_UNION: "Unión libre",
};

const PRIORITY_MAP = {
    HIGH: "Alta",
    MEDIUM: "Media",
    LOW: "Baja",
};

const STATUS_MAP = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    ARCHIVED: "Archivado",
};

/** Map the API client object to the form shape used by the section components. */
function clientToForm(client) {
    if (!client) return EMPTY_FORM;

    // Split "Juan Pérez" into firstName / lastName (first word vs rest)
    const fullName = client.userName ?? "";
    const spaceIdx = fullName.indexOf(" ");
    const firstName = spaceIdx >= 0 ? fullName.slice(0, spaceIdx) : fullName;
    const lastName = spaceIdx >= 0 ? fullName.slice(spaceIdx + 1) : "";

    // Budget: build a readable range string from minBudget / maxBudget
    const budgetRange =
        client.minBudget != null && client.maxBudget != null
            ? `${Number(client.minBudget).toLocaleString("es")} US$ - ${Number(client.maxBudget).toLocaleString("es")} US$`
            : client.budgetRange ?? "";

    // Bedrooms / bathrooms: "min - max" string, or single value
    const bedrooms =
        client.minBedrooms != null && client.maxBedrooms != null
            ? `${client.minBedrooms} - ${client.maxBedrooms}`
            : String(client.bedrooms ?? "");

    const bathrooms =
        client.minBathrooms != null && client.maxBathrooms != null
            ? `${client.minBathrooms} - ${client.maxBathrooms}`
            : String(client.bathrooms ?? "");

    return {
        firstName,
        lastName,
        birthDate: client.birthDate ?? "",
        maritalStatus: MARITAL_STATUS_MAP[client.maritalStatus] ?? client.maritalStatus ?? "",
        occupation: client.occupation ?? "",
        email: client.userEmail ?? client.email ?? "",
        phone: client.phone ?? client.userPhone ?? "",
        address: client.address ?? "",
        annualIncome: client.annualIncome != null ? String(client.annualIncome) : "",
        priority: PRIORITY_MAP[client.priority] ?? client.priority ?? "Alta",
        status: STATUS_MAP[client.status] ?? client.status ?? "Activo",
        originChannel: client.sourceChannel ?? client.originChannel ?? client.origin_channel ?? "",
        comments: client.comments ?? "",
        tags: client.tags ?? [],
        isSearchingProperty: client.isSearchingProperty ?? client.is_searching_property ?? false,
        budgetRange,
        bedrooms,
        bathrooms,
        propertyTypes: client.preferredPropertyTypes ?? client.propertyTypes ?? [],
        preferredZones: client.preferredAreas ?? client.preferredZones ?? [],
        preferredCharacteristics: client.desiredFeatures ?? client.preferredCharacteristics ?? [],
    };
}

// Reverse enum maps (form label → Java enum value) ───────────────────────────
const PRIORITY_TO_ENUM = { "Alta": "HIGH", "Media": "MEDIUM", "Baja": "LOW" };
const STATUS_TO_ENUM = { "Activo": "ACTIVE", "Inactivo": "INACTIVE", "Archivado": "ARCHIVED", "En seguimiento": "INACTIVE" };
const MARITAL_TO_ENUM = {
    "Soltero/a": "SINGLE",
    "Casado/a": "MARRIED",
    "Divorciado/a": "DIVORCED",
    "Viudo/a": "WIDOWED",
    "Unión libre": "FREE_UNION",
};

function normalizeNumberString(str) {
    if (!str) return "";
    const normalize = (s) => s.replace(/\.(\d{3})(?=[^\d]|$)/g, "$1");
    return normalize(String(str).replace(/[^\d.]/g, ""));
}

function parseRange(str) {
    if (!str || !String(str).trim()) return { min: null, max: null };
    const parts = String(str).split("-").map((p) => parseFloat(normalizeNumberString(p)));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { min: parts[0], max: parts[1] };
    }
    const single = parts[0];
    return isNaN(single) ? { min: null, max: null } : { min: single, max: single };
}


function formToPayload(form) {
    const budgetParts = parseRange(form.budgetRange);
    const bedroomParts = parseRange(form.bedrooms);
    const bathroomParts = parseRange(form.bathrooms);
    const annualIncome = form.annualIncome ? parseFloat(normalizeNumberString(form.annualIncome)) : null;

    return {
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        phone: form.phone || null,
        email: form.email || null,
        status: STATUS_TO_ENUM[form.status] ?? form.status ?? null,
        priority: PRIORITY_TO_ENUM[form.priority] ?? form.priority ?? null,
        tags: form.tags ?? [],

        minBudget: budgetParts.min,
        maxBudget: budgetParts.max,

        minBedrooms: bedroomParts.min != null ? Math.round(bedroomParts.min) : null,
        maxBedrooms: bedroomParts.max != null ? Math.round(bedroomParts.max) : null,

        minBathrooms: bathroomParts.min != null ? Math.round(bathroomParts.min) : null,
        maxBathrooms: bathroomParts.max != null ? Math.round(bathroomParts.max) : null,

        birthDate: form.birthDate || null,
        maritalStatus: MARITAL_TO_ENUM[form.maritalStatus] ?? form.maritalStatus ?? null,
        occupation: form.occupation || null,
        annualIncome: isNaN(annualIncome) ? null : annualIncome,
        address: form.address || null,
        sourceChannel: form.originChannel || null,

        preferredPropertyTypes: form.propertyTypes ?? [],
        preferredAreas: form.preferredZones ?? [],
        desiredFeatures: form.preferredCharacteristics ?? [],

        notes: form.comments || null,
        isSearchingProperty: form.isSearchingProperty ?? false,
    };
}


export default function EditClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [form, setForm] = useState(EMPTY_FORM);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    // ── Fetch existing client data ──────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        setFetchLoading(true);
        setError(null);

        clientApi
            .getClientProfile(id)
            .then((data) => {
                if (!cancelled) setForm(clientToForm(data));
            })
            .catch((err) => {
                if (!cancelled) {
                    if (err.response?.status === 404) {
                        navigate("/404", { replace: true });
                    } else {
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
    }, [id, navigate]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

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
            await clientApi.updateClientProfile(id, payload);
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
                            Editar Cliente Externo
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
