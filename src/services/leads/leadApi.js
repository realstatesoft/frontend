import api from "../api";

/**
 * Envía los datos del wizard de venta/alquiler para crear un Lead.
 * @param {Object} wizardData - Datos recopilados del wizard
 * @returns {Promise<Object>} - Respuesta del servidor con el Lead creado
 */
export async function createLeadFromWizard(wizardData) {
  // Mapear los datos del wizard al formato esperado por el backend
  const payload = {
    agentId: wizardData.selectedAgentId,
    
    // Contacto
    firstName: wizardData.firstName,
    lastName: wizardData.lastName,
    phone: wizardData.phone,
    email: wizardData.email,
    
    // Ubicación
    address: wizardData.address,
    latitude: wizardData.latitude,
    longitude: wizardData.longitude,
    
    // Propiedad
    propertyType: wizardData.propertyType, // HOUSE, APARTMENT, etc.
    category: wizardData.category, // SALE o RENT
    
    // Detalles
    surfaceArea: wizardData.surfaceArea,
    builtArea: wizardData.builtArea,
    yearBuilt: wizardData.yearBuilt,
    bedrooms: wizardData.bedrooms,
    halfBath: wizardData.halfBath,
    threeQuarterBath: wizardData.threeQuarterBath,
    floors: wizardData.floors,
    
    // Features
    hasPool: wizardData.hasPool,
    parkingSpaces: wizardData.parkingSpaces,
    hasSecureEntry: wizardData.hasSecureEntry,
    hasBasement: wizardData.hasBasement,
    basementArea: wizardData.basementArea,
    
    // Condiciones
    exteriorCondition: wizardData.exteriorCondition,
    livingRoomCondition: wizardData.livingRoomCondition,
    bathroomCondition: wizardData.bathroomCondition,
    kitchenCondition: wizardData.kitchenCondition,
    countertopType: wizardData.countertopType,
    
    // HOA & Special
    hasHOA: wizardData.hasHOA,
    specialConditions: wizardData.specialConditions,
    
    // Relación y timeline
    agentRelationship: wizardData.agentRelationship,
    timeline: wizardData.timeline,
  };
  
  const response = await api.post("/leads/wizard", payload);
  // Normalización defensiva: extrae .data.data o .data directamente
  return response.data?.data ?? response.data;
}

/**
 * Obtiene el detalle de un Lead por ID.
 * @param {number|string} id - ID del Lead
 * @returns {Promise<Object>} - Detalle del Lead
 */
export async function getLeadById(id) {
  const encodedId = encodeURIComponent(id);
  const response = await api.get(`/leads/${encodedId}`);
  // Normalización defensiva: extrae .data.data o .data directamente
  return response.data?.data ?? response.data;
}

/**
 * Obtiene los leads asignados a un agente (paginado).
 * @param {number} agentId - ID del agente (AgentProfile)
 * @param {Object} params  - page, size, sort
 * @returns {Promise<Object>} Page de LeadResponse
 */
export async function getLeadsByAgent(agentId, params = {}) {
  const response = await api.get(`/leads/agent/${agentId}`, { params });
  return response.data;
}

export default {
  createLeadFromWizard,
  getLeadById,
  getLeadsByAgent,
};
