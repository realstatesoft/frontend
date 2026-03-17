import { useState } from "react";
import { Container, Card, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import { FormMultiSelect, FormLabel } from "../components/properties/FormComponents";

// Opciones para los multi-select
const PROPERTY_TYPE_OPTIONS = [
    "Casa",
    "Departamento",
    "Terreno",
    "Local",
    "Depósito",
    "Campo",
];

const ZONES_OPTIONS = [
    "Centro",
    "Norte",
    "Sur",
    "Este",
    "Oeste",
];

const CHARACTERISTICS_OPTIONS = [
    "Piscina",
    "Jardín",
    "Garage",
    "Parrilla",
    "Seguridad",
    "Terraza",
    "Balcón",
    "Ascensor",
];

// todavía no hay hook para el cliente, si lo necesitas crea uno similar a usePropertyForm
export default function EditClient() {
    const { id } = useParams();
    const navigate = useNavigate();

    // placeholder state
    const [form, setForm] = useState({
        name: "",
        lastname: "",
        birthdate: "",
        civilStatus: "",
        occupation: "",
        email: "",
        phone: "",
        address: "",
        annualIncome: "",
        priority: "",
        status: "",
        source: "",
        comments: "",
        tags: [],
        budgetMin: "",
        budgetMax: "",
        rooms: "",
        baths: "",
        propertyTypes: [],
        zones: [],
        characteristics: [],
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    // mock fetch if id exists
    // validate and submit handlers
    const validateForm = () => {
        // implement validation
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        setLoading(true);
        // call api to save
        setTimeout(() => {
            setLoading(false);
            navigate("/clients");
        }, 1000);
    };

    const dismissError = () => setError("");

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
                            {id ? "Editar Cliente" : "Registrar un Cliente Externo"}
                        </h3>

                        {error && (
                            <Alert variant="danger" onClose={dismissError} dismissible>
                                <i className="bi bi-exclamation-triangle-fill me-2" />
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit} noValidate className="create-client-form">
                            {/* Personal information */}
                            <h5 className="mb-3">Información Personal</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Apellido *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={form.lastname}
                                    onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                                    required
                                />
                            </Form.Group>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Nacimiento</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={form.birthdate}
                                            onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estado Civil</Form.Label>
                                        <Form.Select
                                            value={form.civilStatus}
                                            onChange={(e) => setForm({ ...form, civilStatus: e.target.value })}
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="soltero">Soltero/a</option>
                                            <option value="casado">Casado/a</option>
                                            <option value="otro">Otro</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ocupación</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={form.occupation}
                                            onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Teléfono *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            required
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Dirección</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        />
                                    </Form.Group>
                                </div>
                            </div>

<Form.Group className="mb-3">
                                        <FormLabel>Ingresos Anuales</FormLabel>
                                <Form.Control
                                    type="text"
                                    value={form.annualIncome}
                                    onChange={(e) => setForm({ ...form, annualIncome: e.target.value })}
                                />
                            </Form.Group>

                            <hr />
                            <h5 className="mb-3">Información Interna del Cliente</h5>
                            <div className="row">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Prioridad</Form.Label>
                                        <Form.Select
                                            value={form.priority}
                                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="alta">Alta</option>
                                            <option value="media">Media</option>
                                            <option value="baja">Baja</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estado</Form.Label>
                                        <Form.Select
                                            value={form.status}
                                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="activo">Activo</option>
                                            <option value="inactivo">Inactivo</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Canal de Origen</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={form.source}
                                            onChange={(e) => setForm({ ...form, source: e.target.value })}
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>Comentarios</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={form.comments}
                                    onChange={(e) => setForm({ ...form, comments: e.target.value })}
                                />
                            </Form.Group>

                            <div className="row mb-3">
                                <div className="col-md-8">
                                    <Form.Group>
                                        <FormLabel>Etiquetas</FormLabel>
                                        <FormMultiSelect
                                            options={["VIP", "Potencial", "En seguimiento", "Cerrado", "Urgente"]}
                                            selected={form.tags}
                                            onChange={(newTags) => setForm({ ...form, tags: newTags })}
                                            placeholder="Seleccionar etiquetas..."
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4 d-flex align-items-center">
                                    <Form.Group className="mb-0">
                                        <Form.Check
                                            type="checkbox"
                                            label="¿el cliente está en búsqueda de una propiedad?"
                                            checked={form.searching}
                                            onChange={(e) => setForm({ ...form, searching: e.target.checked })}
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <hr />
                            <h5 className="mb-3">Preferencias de Búsqueda del Cliente</h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Rango de Presupuesto</Form.Label>
                                        <div className="d-flex gap-2">
                                            <Form.Control
                                                type="text"
                                                placeholder="Mín"
                                                value={form.budgetMin}
                                                onChange={(e) =>
                                                    setForm({ ...form, budgetMin: e.target.value })
                                                }
                                            />
                                            <Form.Control
                                                type="text"
                                                placeholder="Máx"
                                                value={form.budgetMax}
                                                onChange={(e) =>
                                                    setForm({ ...form, budgetMax: e.target.value })
                                                }
                                            />
                                        </div>
                                    </Form.Group>
                                </div>
                                <div className="col-md-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cantidad de Habitaciones</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={form.rooms}
                                            onChange={(e) => setForm({ ...form, rooms: e.target.value })}
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cantidad de Baños</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={form.baths}
                                            onChange={(e) => setForm({ ...form, baths: e.target.value })}
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <FormLabel>Tipos de Propiedad *</FormLabel>
                                        <FormMultiSelect
                                            options={PROPERTY_TYPE_OPTIONS}
                                            selected={form.propertyTypes}
                                            onChange={(newTypes) => setForm({ ...form, propertyTypes: newTypes })}
                                            placeholder="Seleccionar tipos..."
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <FormLabel>Zonas Preferidas</FormLabel>
                                        <FormMultiSelect
                                            options={ZONES_OPTIONS}
                                            selected={form.zones}
                                            onChange={(newZones) => setForm({ ...form, zones: newZones })}
                                            placeholder="Seleccionar zonas..."
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <Form.Group className="mb-4">
                                <FormLabel>Características Preferidas</FormLabel>
                                <FormMultiSelect
                                    options={CHARACTERISTICS_OPTIONS}
                                    selected={form.characteristics}
                                    onChange={(newChars) => setForm({ ...form, characteristics: newChars })}
                                    placeholder="Seleccionar características..."
                                />
                            </Form.Group>

                            <div className="d-flex justify-content-end gap-2">
                                <Form.Control
                                    type="button"
                                    value="Cancelar"
                                    onClick={() => navigate(-1)}
                                    className="btn btn-outline-secondary"
                                />
                                <Form.Control
                                    type="submit"
                                    value={loading ? "Guardando..." : "Guardar"}
                                    className="btn btn-primary"
                                    disabled={loading}
                                />
                            </div>
                        </Form>
                    </Card>
                </Container>
            </div>
            <Footer />
        </>
    );
}
