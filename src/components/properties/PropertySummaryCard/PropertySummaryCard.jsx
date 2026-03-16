import { Card, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { tagColors, STATUS_LABELS } from "../../../data/propertiesData";
import { PROPERTY_TYPE_LABELS } from "../../../constants/propertyEnums";
import PLACEHOLDER_IMAGE from "../../../assets/placeholder_img.png";
import "./PropertySummaryCard.scss";

export default function PropertySummaryCard({ property }) {
    const tag = STATUS_LABELS[property.status] ?? property.tag ?? "—";
    const numericPrice = Number(property.price);
    const formattedPrice = Number.isFinite(numericPrice)
        ? `Gs ${numericPrice.toLocaleString()}`
        : "—";
    const image = property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE;

    return (
        <Link to={`/properties/${property.id}`} className="summary-card__link">
            <Card className="summary-card h-100">
                <div className="position-relative">
                    <Card.Img
                        variant="top"
                        src={image}
                        className="summary-card__image"
                        alt={property.title}
                        loading="lazy"
                    />
                </div>

                <Card.Body className="summary-card__body">
                    <p className="summary-card__price">{formattedPrice}</p>
                    <p className="summary-card__title">{property.title}</p>
                </Card.Body>
            </Card>
        </Link>
    );
}