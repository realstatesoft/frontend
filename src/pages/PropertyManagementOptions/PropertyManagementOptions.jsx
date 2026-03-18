import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import agentImage from "../../assets/PublishWithAgentCard.png";
import selfImage from "../../assets/SelfPublish.png";
import "./PropertyManagementOptions.scss";

const options = [
    {
        key: "agent",
        title: "Publicar con un agente",
        image: agentImage,
        alt: "Publicar con un agente",
        benefits: [
            "Mayor visibilidad y confianza para los compradores",
            "Ahorro de tiempo en la gestión de propiedades",
            "Mayor conocimiento del mercado inmobiliario",
            "Experiencia en negociación y cierre",
        ],
        buttonText: "Buscar un agente",
        route: "/sell",
    },
    {
        key: "self",
        title: "Publicar por mi cuenta",
        image: selfImage,
        alt: "Publicar por mi cuenta",
        benefits: [
            "Control total sobre la publicación",
            "Sin intermediarios",
            "Sin costos de comisión",
            "Ideal si prefieres manejar la negociación directamente",
        ],
        buttonText: "Publicar directamente",
        route: "/create-property",
    },
];

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
                        {options.map((option) => (
                            <Card key={option.key} className="property-management-card">
                                <Card.Body className="property-management-card__body">
                                    <Card.Title className="property-management-card__title">
                                        {option.title}
                                    </Card.Title>

                                    <div className="property-management-card__image">
                                        <img src={option.image} alt={option.alt} />
                                    </div>

                                    <div className="property-management-card__benefits">
                                        <p className="mb-2 text-start">Beneficios:</p>

                                        <ul className="property-management-card__list">
                                            {option.benefits.map((benefit) => (
                                                <li key={benefit}>{benefit}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button
                                        variant="primary"
                                        className="property-management-card__button"
                                        onClick={() => navigate(option.route)}
                                    >
                                        {option.buttonText}
                                    </Button>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </Container>
            </div>
            <Footer />
        </>
    );
}