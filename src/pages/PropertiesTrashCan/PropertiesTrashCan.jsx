import { Col, Container, Row } from "react-bootstrap";
import TrashPropertyCard from "../../components/properties/TrashPropertyCard"; 
import Navbar from "../../components/Landing/Navbar";

// sample data, replace later
    const deletedProperties = [
    { 
        id: 1, 
        title: "Vivienda Unifamiliar",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        daysLeft: 10 
    },
    { 
        id: 2, 
        title: "Terreno de 1 Ha. en Cambyretá",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
        daysLeft: 8  
    },
    { 
        id: 3, 
        title: "Departamento Zona Costanera",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        daysLeft: 7  
    },
    { 
        id: 4, 
        title: "Dúplex Zona Centro",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        daysLeft: 5  
    },
    { 
        id: 5, 
        title: "Campo de 10 Has. en Alto Verá",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        daysLeft: 3  
    },
    { 
        id: 6, 
        title: "Lote en el Centro de Encarnación",
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        daysLeft: 1  
    },
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
