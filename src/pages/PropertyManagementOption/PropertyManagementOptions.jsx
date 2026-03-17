import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import agentImage from "../../assets/PublishWithAgentCard.png";
import selfImage from "../../assets/SelfPublish.png";
import "./PropertyManagementOptions.scss";

export default function PropertyManagementOptions() {
    const navigate = useNavigate();

    return (
        <>
            <CustomNavbar />
            <div className="property-management-page">
                <Container className="py-0">
                    <h1 className="property-management-page__title">
                        Elige cómo quieres gestionar tu propiedad.
                    </h1>

                    <div className="property-management-page__grid">
                        <Card className="property-management-card">
                            <Card.Body className="property-management-card__body">
                                {/* 1. El título ahora va arriba */}
                                <Card.Title className="property-management-card__title">
                                    Publicar con un agente
                                </Card.Title>

                                <div className="property-management-card__image">
                                    <img src={agentImage} alt="Publicar con un agente" />
                                </div>

                                {/* 2. Se agrega la sección de Beneficios */}
                                <div className="property-management-card__benefits">
                                    <p className="mb-2 text-start">Beneficios:</p>
                                    
                                    {/* 3. Se quitaron los íconos 'bi' para usar viñetas normales */}
                                    <ul className="property-management-card__list">
                                        <li>Mayor visibilidad y confianza para los compradores</li>
                                        <li>Ahorro de tiempo en la gestión de propiedades</li>
                                        <li>Mayor conocimiento del mercado inmobiliario</li>
                                        <li>Experiencia en negociación y cierre</li>
                                    </ul>
                                </div>

                                <Button
                                    variant="primary"
                                    className="property-management-card__button"
                                    onClick={() => navigate("")}
                                >
                                    Buscar un agente
                                </Button>
                            </Card.Body>
                        </Card>

                        <Card className="property-management-card">
                            <Card.Body className="property-management-card__body">
                                <Card.Title className="property-management-card__title">
                                    Publicar por mi cuenta
                                </Card.Title>

                                <div className="property-management-card__image">
                                    <img src={selfImage} alt="Publicar por mi cuenta" />
                                </div>

                                <div className="property-management-card__benefits">
                                    <p className="mb-2 text-start">Beneficios:</p>
                                    
                                    <ul className="property-management-card__list">
                                        <li>Control total sobre la publicación</li>
                                        <li>Sin intermediarios</li>
                                        <li>Sin costos de comisión</li>
                                        <li>Ideal si prefieres manejar la negociación directamente</li>
                                    </ul>
                                </div>

                                <Button
                                    variant="primary"
                                    className="property-management-card__button"
                                    onClick={() => navigate("/create-property")}
                                >
                                    Publicar directamente
                                </Button>
                            </Card.Body>
                        </Card>
                    </div>
                </Container>
            </div>
            <Footer />
        </>
    );
}