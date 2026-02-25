import { useState, useCallback } from "react";
import propertyApi from "../services/properties/propertyApi";
import { buildCreatePropertyPayload } from "../services/properties/propertyFormMapper";
import { getInitialRoom, DEFAULT_OWNER_ID } from "../constants/createPropertyConstants";

const getInitialForm = () => ({
  title: "",
  category: "Venta",
  visibility: "Pública",
  address: "",
  geolocation: { lat: null, lng: null },
  description: "",
  propertyType: "Casa",
  price: "",
  surfaceArea: "",
  builtArea: "",
  availability: "Inmediata",
  electricityInstallation: "Trifásica",
  waterConnection: "Agua corriente",
  sanitaryInstallation: "Red pública",
  exteriorFeatures: [],
  year: "",
  construction_status: "Usada",
  structureMaterial: "Hormigón",
  wallsMaterial: "Ladrillo",
  floorMaterial: "Azulejos",
  roofMaterial: "Tejas",
  parkingSpaces: "",
  floorsCount: "",
  bedrooms: "",
  halfBathrooms: "",
  fullBathrooms: "",
  rooms: [getInitialRoom(0), getInitialRoom(1)],
  media: [],
});

const validateForm = (form) => {
  if (!form.title?.trim()) return "El título es obligatorio.";
  if (!form.address?.trim()) return "La dirección es obligatoria.";
  if (form.price === "" || form.price == null) return "El precio es obligatorio.";
  const priceNum = Number(form.price);
  if (isNaN(priceNum) || priceNum <= 0) return "El precio debe ser un número mayor a 0.";
  return null;
};

const getErrorMessage = (err) =>
  err.response?.data?.message ??
  err.response?.data?.errors?.[0] ??
  "No se pudo conectar con el servidor. Verificá que el backend esté activo.";

/**
 * Hook con toda la lógica del formulario de crear propiedad:
 * estado del form, actualizadores, validación y envío al backend.
 */
export function useCreatePropertyForm() {
  const [form, setForm] = useState(getInitialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const set = useCallback((key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target ? e.target.value : e }));
  }, []);

  const setArr = useCallback((key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const updateRoom = useCallback((index, field, value) => {
    setForm((f) => ({
      ...f,
      rooms: f.rooms.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }));
  }, []);

  const addRoom = useCallback(() => {
    setForm((f) => ({ ...f, rooms: [...f.rooms, getInitialRoom(f.rooms.length)] }));
  }, []);

  const removeRoom = useCallback((index) => {
    setForm((f) => ({ ...f, rooms: f.rooms.filter((_, i) => i !== index) }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = buildCreatePropertyPayload(form, { ownerId: DEFAULT_OWNER_ID });

    try {
      setLoading(true);
      const { data } = await propertyApi.create(payload);
      if (data?.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(data?.message ?? "Ocurrió un error al guardar la propiedad.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [form]);

  const dismissError = useCallback(() => setError(null), []);
  const dismissSuccess = useCallback(() => setSuccess(false), []);

  return {
    form,
    loading,
    error,
    success,
    set,
    setArr,
    updateRoom,
    addRoom,
    removeRoom,
    handleSubmit,
    dismissError,
    dismissSuccess,
  };
}
