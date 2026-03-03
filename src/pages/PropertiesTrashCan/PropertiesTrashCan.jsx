import { Col, Container, Row } from "react-bootstrap";
import TrashPropertyCard from "../../components/properties/TrashPropertyCard"; 
import Navbar from "../../components/Landing/Navbar";

// saple data replace later
const deletedProperties = [
    { id: 1, title: "Vivienda Unifamiliar",            image: "/assets/house1.jpg", daysLeft: 10 },
    { id: 2, title: "Terreno de 1 Ha. en Cambyretá",  image: "/assets/house2.jpg", daysLeft: 8  },
    { id: 3, title: "Departamento Zona Costanera",     image: "/assets/house3.jpg", daysLeft: 7  },
    { id: 4, title: "Dúplex Zona Centro",              image: "/assets/house4.jpg", daysLeft: 5  },
    { id: 5, title: "Campo de 10 Has. en Alto Verá",   image: "/assets/house5.jpg", daysLeft: 3  },
    { id: 6, title: "Lote en el Centro de Encarnación",image: "/assets/house6.jpg", daysLeft: 1  },
];

export default function PropertiesTrashCan() {
    function handleRestore(id) {
        // restore logic
    }

    function handleDelete(id) {
        // delete logic
    }

    return (
        <>
            <Navbar /> 

            <Container className="py-5">
                {/* Encabezado */}
                <div className="mb-4">
                    <h2 className="fw-bold mb-1" style={{ color: "var(--dark, #1e293b)" }}>
                        Papelera de Propiedades
                    </h2>
                    <p className="text-muted mb-0" style={{ fontSize: "0.92rem" }}>
                        Las propiedades borradas se mantendrán aquí durante 10 días, en caso de que desees recuperarlas.
                    </p>
                </div>

                {/* Grid de tarjetas */}
                {deletedProperties.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <p>No hay propiedades en la papelera.</p>
                    </div>
                ) : (
                    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                        {deletedProperties.map((property) => (
                            <Col key={property.id}>
                                <TrashPropertyCard
                                    property={property}
                                    onRestore={handleRestore}
                                    onDelete={handleDelete}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </>
    );
}
