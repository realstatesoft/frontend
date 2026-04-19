import React from "react";
import "./PropertyVirtualTour.css";

const PropertyVirtualTour = ({ url, title }) => {
  const safeUrl = React.useMemo(() => {
    if (!url) return null;
    try {
      // Validar que sea una URL absoluta y segura
      const parsed = new URL(url);
      if (parsed.protocol === "https:" || parsed.href === "about:blank") {
        return parsed.href;
      }
      console.warn("URL de tour virtual bloqueada por protocolo no seguro:", url);
      return null;
    } catch (e) {
      return null;
    }
  }, [url]);

  if (!safeUrl) return null;

  return (
    <div className="property-virtual-tour">
      {title && <h6 className="property-virtual-tour__title">{title}</h6>}
      <div className="property-virtual-tour__container">
        <iframe
          src={safeUrl}
          title={title || "Tour Virtual 360°"}
          className="property-virtual-tour__iframe"
          allowFullScreen
          allow="accelerometer; gyroscope; magnetometer; xr-spatial-tracking"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="strict-origin-when-cross-origin"
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
