import { useState, useCallback } from "react";
import Swal from "sweetalert2";
import propertyApi from "../services/properties/propertyApi";
import { buildCreatePropertyPayload } from "../services/properties/propertyFormMapper";
import { getInitialRoom, DEFAULT_OWNER_ID } from "../constants/createPropertyConstants";
import { createPropertySchema } from "../validation/createPropertySchema";

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
   // Errores por campo (ej. { title: 'El título es obligatorio' })
  const [fieldErrors, setFieldErrors] = useState({});

  const set = useCallback((key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
    // Si el campo tenía error, lo limpiamos al modificarlo;
    // una nueva validación lo volverá a marcar si sigue siendo inválido.
    setFieldErrors((prev) => {
      if (!prev || !Object.prototype.hasOwnProperty.call(prev, key)) return prev;
      const { [key]: _ignored, ...rest } = prev;
      return rest;
    });
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

  const validateForm = useCallback(() => {
    const dataToValidate = {
      title: form.title,
      address: form.address,
      price: form.price,
      propertyType: form.propertyType,
      category: form.category,
      geolocation: form.geolocation,
    };

    const result = createPropertySchema.safeParse(dataToValidate);

    if (!result.success) {
      // Usamos flatten() para obtener un objeto { fieldErrors, formErrors }
      const { fieldErrors: zodFieldErrors } = result.error.flatten();
      const nextErrors = Object.fromEntries(
        Object.entries(zodFieldErrors).map(([key, messages]) => [
          key,
          messages?.[0] ?? "Campo inválido",
        ])
      );
      setFieldErrors(nextErrors);
      setError("Revisá los campos resaltados.");
      return false;
    }

    setFieldErrors({});
    return true;
  }, [form]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const ok = validateForm();
    if (!ok) return;

    const payload = buildCreatePropertyPayload(form, { ownerId: DEFAULT_OWNER_ID });

    try {
      setLoading(true);
      const { data } = await propertyApi.create(payload);
      if (data?.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        await Swal.fire({
          icon: "success",
          title: "¡Propiedad registrada!",
          text: "La propiedad fue creada exitosamente.",
        });
        setForm(getInitialForm());
        setFieldErrors({});
        setSuccess(false);
      } else {
        setError(data?.message ?? "Ocurrió un error al guardar la propiedad.");
        await Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: data?.message ?? "Ocurrió un error al guardar la propiedad.",
        });
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
    fieldErrors,
    validateForm,
  };
}
