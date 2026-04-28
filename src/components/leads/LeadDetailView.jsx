import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, 
  FiHome, FiLayers, FiCalendar, FiBox, FiMaximize,
  FiZap, FiInfo, FiMessageSquare,
  FiClock, FiActivity, FiMessageCircle
} from 'react-icons/fi';
import { 
  MdOutlineBed, MdOutlineBathtub,
  MdOutlineGarage, MdOutlinePool
} from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Swal from 'sweetalert2';
import { useLead } from '../../hooks/useLeads';
import NewConversationModal from '../messages/NewConversationModal';
import styles from './LeadDetailView.module.scss';

// Fix for default leaflet marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
if (L.Marker.prototype.options) {
  L.Marker.prototype.options.icon = DefaultIcon;
}

const LeadDetailView = ({ lead: initialLead, leadId, onContactClick }) => {
  const { data: fetchedLead, isLoading, error } = useLead(leadId);
  const [showMessageModal, setShowMessageModal] = React.useState(false);

  const lead = initialLead || fetchedLead;

  if (isLoading && !initialLead) {
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

  if ((error || !lead) && !initialLead) {
    return (
      <div className={styles.error}>
        <FiInfo />
        <p>No se pudo cargar el prospecto.</p>
      </div>
    );
  }

  const metadata = lead?.metadata || {};
  const sanitizedPhone = lead?.phone ? String(lead.phone).replace(/\D/g, '') : null;
  const safeEmail = lead?.email ? String(lead.email) : null;

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
      <div className={styles.leadDetail__grid}>
        {/* Columna Principal */}
        <main className={styles.leadDetail__main}>
          {/* Ficha Técnica del Wizard */}
          <section className={styles.leadDetail__section}>
            <h2 className={styles.sectionTitle}><FiHome /> Ficha Técnica de la Propiedad</h2>
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
                <span className={styles.condLabel}>Cocina:</span>
                <span className={styles.condValue}>{metadata.kitchenCondition || 'Desconocido'}</span>
              </div>
              <div className={styles.leadDetail__condition}>
                <span className={styles.condLabel}>Exterior:</span>
                <span className={styles.condValue}>{metadata.exteriorCondition || 'Desconocido'}</span>
              </div>
              <div className={styles.leadDetail__condition}>
                <span className={styles.condLabel}>Living:</span>
                <span className={styles.condValue}>{metadata.livingRoomCondition || 'Desconocido'}</span>
              </div>
              <div className={styles.leadDetail__condition}>
                <span className={styles.condLabel}>Baños:</span>
                <span className={styles.condValue}>{metadata.bathroomCondition || 'Desconocido'}</span>
              </div>
            </div>
          </section>

          {/* Detalles Extras */}
          <section className={styles.leadDetail__section}>
            <h2 className={styles.sectionTitle}><FiBox /> Características Adicionales</h2>
            <div className={styles.leadDetail__infoCards}>
              {metadata.hasPool && renderMetadataCard(<MdOutlinePool />, "Piscina", "Sí")}
              {metadata.hasBasement && renderMetadataCard(<FiBox />, "Sótano", metadata.basementArea ? `${metadata.basementArea} m²` : 'Sí')}
              {metadata.hasSecureEntry && renderMetadataCard(<FiZap />, "Seguridad", "Sí")}
              {metadata.hasHOA && renderMetadataCard(<FiInfo />, "Expensas/HOA", "Sí")}
            </div>
            
            {(metadata.address || (metadata.latitude && metadata.longitude)) && (
              <div className={styles.addressSection}>
                {metadata.address && (
                  <div className={styles.addressHeader}>
                    <h4 className={styles.subTitle}>Ubicación Exacta:</h4>
                    <p className={styles.addressText}>{metadata.address}</p>
                    
                    {metadata.latitude && metadata.longitude && (
                      <div className={styles.mapWrapper}>
                        <MapContainer 
                          center={[metadata.latitude, metadata.longitude]} 
                          zoom={16} 
                          scrollWheelZoom={false}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          />
                          <Marker position={[metadata.latitude, metadata.longitude]}>
                            <Popup>Ubicación de la propiedad</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Notas */}
          <section className={styles.leadDetail__section}>
            <h2 className={styles.sectionTitle}><FiMessageSquare /> Notas del Wizard</h2>
            <div className={styles.leadDetail__notes}>
              {lead.notes || 'Sin notas adicionales.'}
            </div>
          </section>
        </main>

        {/* Barra Lateral / Info de Contacto */}
        <aside className={styles.leadDetail__aside}>
          {/* Urgencia */}
          <section className={styles.leadDetail__section}>
            <h2 className={styles.sectionTitle}><FiClock /> Expectativas</h2>
            <div className={styles.timelineStatus}>
              <span className={styles.timelineLabel}>Tiempo de venta esperado</span>
              <div className={styles.timelineValue}>
                {metadata.timeline === 'asap' ? 'Lo antes posible' : 
                 metadata.timeline === '1_month' ? 'En 1 mes' :
                 metadata.timeline === '2_3_months' ? 'En 2-3 meses' :
                 metadata.timeline === '4_plus' ? 'En 4+ meses' : 'Explorando'}
              </div>
            </div>
          </section>

          {/* Contacto y Acciones */}
          <section className={styles.leadDetail__section}>
            <h2 className={styles.sectionTitle}><FiUser /> Contacto Directo</h2>
            <div className={styles.contactList}>
              <a 
                href={safeEmail ? `mailto:${safeEmail}` : '#'} 
                className={styles.contactLink}
                style={{ opacity: safeEmail ? 1 : 0.6 }}
              >
                <FiMail /> {lead.email || 'Email no disponible'}
              </a>
              <a 
                href={sanitizedPhone ? `tel:${sanitizedPhone}` : '#'} 
                className={styles.contactLink}
                style={{ opacity: sanitizedPhone ? 1 : 0.6 }}
              >
                <FiPhone /> {lead.phone || 'Teléfono no disponible'}
              </a>
            </div>

            <div className={styles.actionButtons}>
              <button 
                onClick={() => sanitizedPhone && window.open(`https://wa.me/${sanitizedPhone}`, '_blank')}
                className={styles.btnWhatsapp}
                disabled={!sanitizedPhone}
              >
                <FiMessageCircle /> WhatsApp
              </button>
              
              {lead.userId && (
                <button 
                  onClick={() => setShowMessageModal(true)}
                  className={styles.btnMessage}
                >
                  <FiMessageSquare /> Mensaje Interno
                </button>
              )}
            </div>
          </section>

          {/* Línea de Tiempo */}
          <section className={styles.leadDetail__section}>
            <h2 className={styles.sectionTitle}><FiActivity /> Línea de Tiempo</h2>
            <div className={styles.leadDetail__timeline}>
              {lead.interactions?.length > 0 ? (
                lead.interactions.map((event) => (
                  <div key={event.id} className={styles.leadDetail__event}>
                    <span className={styles.date}>{new Date(event.createdAt).toLocaleDateString()}</span>
                    <p className={styles.type}>{event.subject || event.type}</p>
                    {event.note && <p className={styles.note}>{event.note}</p>}
                  </div>
                ))
              ) : (
                <div className={styles.leadDetail__event}>
                  <span className={styles.date}>{new Date(lead.createdAt).toLocaleDateString()}</span>
                  <p className={styles.type}>Captación inicial</p>
                  <p className={styles.note}>Prospecto generado a través del Sell Wizard.</p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>

      <NewConversationModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        preSelectedAgent={{
          id: lead.userId,
          name: lead.name,
          email: lead.email,
        }}
        onSuccess={() => {
          Swal.fire({ icon: 'success', title: '¡Mensaje enviado!', timer: 2000, showConfirmButton: false });
        }}
      />
    </div>
  );
};

export default LeadDetailView;
