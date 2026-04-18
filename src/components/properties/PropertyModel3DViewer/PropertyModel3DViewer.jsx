import React, { useEffect, useRef } from "react";
import "./PropertyModel3DViewer.css";

const PropertyModel3DViewer = ({ src, alt, poster, title }) => {
  const modelRef = useRef(null);

  useEffect(() => {
    // Importación dinámica para asegurar que el custom element esté registrado
    import("@google/model-viewer").catch(err => console.error("Error loading model-viewer", err));
  }, []);

  return (
    <div className="property-3d-viewer">
      {title && <h6 className="property-3d-viewer__title">{title}</h6>}
      <div className="property-3d-viewer__container">
        <model-viewer
          ref={modelRef}
          src={src}
          alt={alt || "Modelo 3D de la propiedad"}
          poster={poster}
          camera-controls
          auto-rotate
          ar
          ar-modes="webxr scene-viewer quick-look"
          shadow-intensity="1"
          environment-image="neutral"
          exposure="1"
          interaction-prompt="auto"
          className="property-3d-viewer__model"
        >
          <div className="property-3d-viewer__progress-bar" slot="progress-bar">
            <div className="property-3d-viewer__update-bar"></div>
          </div>
          <button className="property-3d-viewer__ar-button" slot="ar-button">
            👋 Ver en tu espacio (AR)
          </button>
          <div id="ar-prompt">
            <img src="https://modelviewer.dev/shared-assets/icons/hand.png" alt="Icono de mano" />
          </div>
        </model-viewer>
      </div>
      <div className="property-3d-viewer__footer">
        <p className="text-muted small mb-0">
          <i className="bi bi-info-circle me-1"></i>
          Usá el mouse (o dedos) para rotar y zoom. Clic en el botón AR para móviles compatibles.
        </p>
      </div>
    </div>
  );
};

export default PropertyModel3DViewer;
