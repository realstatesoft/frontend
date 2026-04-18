import React from "react";
import "./PropertyVirtualTour.css";

const PropertyVirtualTour = ({ url, title }) => {
  if (!url) return null;

  return (
    <div className="property-virtual-tour">
      {title && <h6 className="property-virtual-tour__title">{title}</h6>}
      <div className="property-virtual-tour__container">
        <iframe
          src={url}
          title={title || "Tour Virtual 360°"}
          className="property-virtual-tour__iframe"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          frameBorder="0"
        />
      </div>
      <div className="property-virtual-tour__footer">
        <p className="text-muted small mb-0">
          <i className="bi bi-arrows-fullscreen me-1"></i>
          Podés ver el tour en pantalla completa usando el icono del proveedor.
        </p>
      </div>
    </div>
  );
};

export default PropertyVirtualTour;
