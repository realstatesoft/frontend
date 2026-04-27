import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, 
  FiHome, FiLayers, FiCalendar, FiBox, FiMaximize,
  FiZap, FiInfo, FiMessageSquare,
  FiClock, FiActivity
} from 'react-icons/fi';
import { 
  MdOutlineBed, MdOutlineBathtub,
  MdOutlineGarage, MdOutlinePool
} from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLead } from '../../hooks/useLeads';
import styles from './LeadDetailPage.module.scss';

// Fix for default leaflet marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LeadDetailPage = () => {
  const { id } = useParams();
  const { data: lead, isLoading, error } = useLead(id);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <FiActivity />
        </motion.div>
        <p>Cargando ficha del prospecto...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className={styles.error}>
        <FiInfo />
        <p>No se pudo cargar el prospecto.</p>
        <Link to="/leads">Volver al listado</Link>
      </div>
    );
  }

  const { metadata } = lead;

  const renderMetadataCard = (icon, label, value) => (
    <motion.div 
      className={styles.leadDetail__card}
      whileHover={{ y: -5 }}
    >
      <div className={styles.icon}>{icon}</div>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value || '—'}</span>
    </motion.div>
  );

  return (
    <div className={styles.leadDetail}>
      {/* Header */}
      <header className={styles.leadDetail__header}>
        <div>
          <Link to="/dashboard" className={styles.backBtn}>
            <FiArrowLeft /> Volver
          </Link>
          <h1>{lead.name}</h1>
          <p style={{ color: '#64748b', margin: 0 }}>ID de Prospecto: #{lead.id} · Captado vía {lead.source}</p>
        </div>
        <div 
          className={styles.leadDetail__badge} 
          style={{ backgroundColor: `${lead.statusColor}20`, color: lead.statusColor }}
        >
          {lead.status}
        </div>
      </header>

      <div className={styles.leadDetail__grid}>
        {/* Columna Principal */}
        <main>
          {/* Ficha Técnica del Wizard */}
          <section className={styles.leadDetail__section}>
            <h2><FiHome /> Ficha Técnica de la Propiedad</h2>
            <div className={styles.leadDetail__infoCards}>
              {renderMetadataCard(<FiMaximize />, "Terreno", metadata.surfaceArea ? `${metadata.surfaceArea} m²` : null)}
              {renderMetadataCard(<FiLayers />, "Construido", metadata.builtArea ? `${metadata.builtArea} m²` : null)}
              {renderMetadataCard(<MdOutlineBed />, "Habitaciones", metadata.bedrooms)}
              {renderMetadataCard(<MdOutlineBathtub />, "Baños", (metadata.halfBath || metadata.threeQuarterBath) ? (metadata.halfBath || 0) + (metadata.threeQuarterBath || 0) : null)}
              {renderMetadataCard(<MdOutlineGarage />, "Cocheras", metadata.parkingSpaces)}
              {renderMetadataCard(<FiCalendar />, "Año Const.", metadata.yearBuilt)}
            </div>

            <div className={styles.leadDetail__conditions}>
              <div className={styles.leadDetail__condition}>
                <span>Cocina:</span>
                <span>{metadata.kitchenCondition || 'Desconocido'}</span>
              </div>
              <div className={styles.leadDetail__condition}>
                <span>Exterior:</span>
                <span>{metadata.exteriorCondition || 'Desconocido'}</span>
              </div>
              <div className={styles.leadDetail__condition}>
                <span>Living:</span>
                <span>{metadata.livingRoomCondition || 'Desconocido'}</span>
              </div>
              <div className={styles.leadDetail__condition}>
                <span>Baños:</span>
                <span>{metadata.bathroomCondition || 'Desconocido'}</span>
              </div>
            </div>
          </section>

          {/* Detalles Extras */}
          <section className={styles.leadDetail__section}>
            <h2><FiBox /> Características Adicionales</h2>
            <div className={styles.leadDetail__infoCards}>
              {metadata.hasPool && renderMetadataCard(<MdOutlinePool />, "Piscina", "Sí")}
              {metadata.hasBasement && renderMetadataCard(<FiBox />, "Sótano", metadata.basementArea ? `${metadata.basementArea} m²` : 'Sí')}
              {metadata.hasSecureEntry && renderMetadataCard(<FiZap />, "Seguridad", "Sí")}
              {metadata.hasHOA && renderMetadataCard(<FiInfo />, "Expensas/HOA", "Sí")}
            </div>
            
            {(metadata.address || (Array.isArray(metadata.specialConditions) ? metadata.specialConditions.length > 0 : !!metadata.specialConditions)) && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                {metadata.address && (
                  <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>Ubicación Exacta:</h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{metadata.address}</p>
                    
                    {metadata.latitude && metadata.longitude && (
                      <div style={{ height: '250px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 1 }}>
                        <MapContainer 
                          center={[metadata.latitude, metadata.longitude]} 
                          zoom={16} 
                          scrollWheelZoom={false}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <Marker position={[metadata.latitude, metadata.longitude]}>
                            <Popup>
                              Ubicación de la propiedad <br /> {metadata.address}
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}
                  </div>
                )}
                
                {(Array.isArray(metadata.specialConditions) ? metadata.specialConditions.length > 0 : !!metadata.specialConditions) && (
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>Condiciones Especiales:</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(Array.isArray(metadata.specialConditions) ? metadata.specialConditions : [metadata.specialConditions]).map((cond, i) => (
                        <span key={i} style={{ padding: '0.25rem 0.75rem', background: '#dbeafe', color: '#1e40af', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                          {cond.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Notas del Sistema */}
          <section className={styles.leadDetail__section}>
            <h2><FiMessageSquare /> Notas del Wizard</h2>
            <div className={styles.leadDetail__notes}>
              {lead.notes}
            </div>
          </section>
        </main>

        {/* Barra Lateral */}
        <aside>
          {/* Acciones Rápidas */}
          <section className={styles.leadDetail__section} style={{ border: '2px solid #3b82f6' }}>
            <h2><FiZap /> Acciones de Gestión</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g,'')}`, '_blank', 'noopener,noreferrer')}
                style={{ width: '100%', padding: '0.75rem', background: '#25d366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <FiMessageSquare /> Contactar por WhatsApp
              </button>
              <button 
                style={{ width: '100%', padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <FiHome /> Convertir en Propiedad
              </button>
            </div>
          </section>

          {/* Contacto */}
          <section className={styles.leadDetail__section}>
            <h2><FiUser /> Contacto Directo</h2>
            <div className={styles.leadDetail__contact}>
              <a href={`mailto:${lead.email}`}><FiMail /> {lead.email}</a>
              <a href={`tel:${lead.phone}`}><FiPhone /> {lead.phone}</a>
            </div>
          </section>

          {/* Urgencia */}
          <section className={styles.leadDetail__section}>
            <h2><FiClock /> Expectativas</h2>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #10b981' }}>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, textTransform: 'uppercase' }}>Tiempo de venta esperado</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#064e3b', marginTop: '0.5rem' }}>
                {metadata.timeline === 'asap' ? 'Lo antes posible' : 
                 metadata.timeline === '1_month' ? 'En 1 mes' :
                 metadata.timeline === '2_3_months' ? 'En 2-3 meses' :
                 metadata.timeline === '4_plus' ? 'En 4+ meses' : 'Explorando'}
              </div>
            </div>
          </section>

          {/* Línea de Tiempo */}
          <section className={styles.leadDetail__section}>
            <h2><FiActivity /> Línea de Tiempo</h2>
            <div className={styles.leadDetail__timeline}>
              {lead.interactions?.length > 0 ? (
                lead.interactions.map((event) => (
                  <div key={event.id} className={styles.leadDetail__event}>
                    <span className={styles.date}>{new Date(event.createdAt).toLocaleString()}</span>
                    <p className={styles.type}>{event.subject || event.type}</p>
                    {event.note && <p className={styles.note}>{event.note}</p>}
                  </div>
                ))
              ) : (
                <div className={styles.leadDetail__event}>
                  <span className={styles.date}>{new Date(lead.createdAt).toLocaleString()}</span>
                  <p className={styles.type}>Captación inicial</p>
                  <p className={styles.note}>Prospecto generado a través del Sell Wizard.</p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default LeadDetailPage;
