/**
 * Reverse geocoding usando Nominatim (OpenStreetMap).
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<Object>} Dirección en texto y datos estructurados
 */
export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "OpenRoof/1.0 (realstatesoft)",
    },
  });
  if (!res.ok) {
    throw new Error(`Reverse geocoding failed with HTTP ${res.status}`);
  }
  const data = await res.json();
  return {
    displayName: data.display_name || "",
    city: data.address?.city || data.address?.town || data.address?.village || "",
    department: data.address?.state || "",
    country: data.address?.country || ""
  };
}
