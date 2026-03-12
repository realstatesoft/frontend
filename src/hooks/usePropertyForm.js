import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "./useAuth";
import propertyApi from "../services/properties/propertyApi";
import { uploadImage } from "../services/images/imageApi";
import {
  buildCreatePropertyPayload,
  buildUpdatePropertyPayload,
  propertyToForm,
} from "../services/properties/propertyFormMapper";
import {
  getInitialBedroom,
  getInitialHalfBathroom,
  getInitialFullBathroom,
  getInitialExtraRoom,
  getFloorOptionsForCount,
  getFloorIndex,
} from "../constants/createPropertyConstants";
import { createPropertySchema } from "../validation/createPropertySchema";

const getInitialForm = () => ({
  title: "",
  category: "Venta",
  visibility: "Pública",
  address: "",
  geolocation: { lat: null, lng: null },
  locationId: null,
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
  rooms: [],
  media: [],
  agentId: null,
});

const getErrorMessage = (err) =>
  err.response?.data?.message ??
  err.response?.data?.errors?.[0] ??
  "No se pudo conectar con el servidor. Verificá que el backend esté activo.";

/**
 * Hook para crear o editar una propiedad.
 * @param {string|undefined} propertyId - Si se proporciona, modo edición (carga propiedad y actualiza)
 */
export function usePropertyForm(propertyId) {
  const navigate = useNavigate();
  const isEditMode = Boolean(propertyId);
  const { user } = useAuth();
  const userId = user?.userId;

  const [form, setForm] = useState(getInitialForm);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!propertyId) return;
    setFetchLoading(true);
    setError(null);
    propertyApi
      .getById(propertyId)
      .then(({ data }) => {
        if (data?.success && data?.data) {
          const formData = propertyToForm(data.data);
          if (formData) setForm(formData);
        } else {
          setError("No se pudo cargar la propiedad.");
        }
      })
      .catch((err) => {
        setError(
          err.response?.status === 404
            ? "Propiedad no encontrada."
            : getErrorMessage(err)
        );
      })
      .finally(() => setFetchLoading(false));
  }, [propertyId]);

  const set = useCallback((key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
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

  const setFloorsCount = useCallback((e) => {
    const raw = e?.target ? e.target.value : e;
    const value = String(raw ?? "");
    if (value === "") {
      setForm((f) => ({ ...f, floorsCount: "" }));
      return;
    }
    const num = Math.min(Math.max(parseInt(value, 10) || 1, 1), 10);
    setForm((f) => {
      const allowedFloors = getFloorOptionsForCount(num);
      const lastValid = allowedFloors[allowedFloors.length - 1] ?? "Planta baja";
      const rooms = (f.rooms || []).map((r) => {
        const idx = getFloorIndex(r.floor);
        return idx >= num ? { ...r, floor: lastValid } : r;
      });
      return { ...f, floorsCount: String(num), rooms };
    });
    setFieldErrors((prev) => {
      if (!prev?.floorsCount) return prev;
      const { floorsCount: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const syncRoomsForCounts = useCallback((f, newBedrooms, newHalfBathrooms, newFullBathrooms) => {
    const bNew = Math.max(0, parseInt(newBedrooms, 10) || 0);
    const hNew = Math.max(0, parseInt(newHalfBathrooms, 10) || 0);
    const fullNew = Math.max(0, parseInt(newFullBathrooms, 10) || 0);
    const bOld = Math.max(0, parseInt(f.bedrooms, 10) || 0);
    const hOld = Math.max(0, parseInt(f.halfBathrooms, 10) || 0);
    const fullOld = Math.max(0, parseInt(f.fullBathrooms, 10) || 0);
    const rooms = f.rooms || [];
    const oldBedrooms = rooms.slice(0, bOld);
    const oldHalfBaths = rooms.slice(bOld, bOld + hOld);
    const oldFullBaths = rooms.slice(bOld + hOld, bOld + hOld + fullOld);
    const extraRooms = rooms.slice(bOld + hOld + fullOld);
    const bedroomRooms = [...oldBedrooms.slice(0, bNew)];
    while (bedroomRooms.length < bNew) bedroomRooms.push(getInitialBedroom(bedroomRooms.length));
    const halfBathRooms = [...oldHalfBaths.slice(0, hNew)];
    while (halfBathRooms.length < hNew) halfBathRooms.push(getInitialHalfBathroom(halfBathRooms.length));
    const fullBathRooms = [...oldFullBaths.slice(0, fullNew)];
    while (fullBathRooms.length < fullNew) fullBathRooms.push(getInitialFullBathroom(fullBathRooms.length));
    return [...bedroomRooms, ...halfBathRooms, ...fullBathRooms, ...extraRooms];
  }, []);

  const setBedrooms = useCallback((e) => {
    const raw = e?.target ? e.target.value : e;
    const value = String(raw ?? "");
    setForm((f) => {
      const rooms = syncRoomsForCounts(f, value, f.halfBathrooms, f.fullBathrooms);
      return { ...f, bedrooms: value, rooms };
    });
    setFieldErrors((prev) => (prev?.bedrooms ? { ...prev, bedrooms: undefined } : prev));
  }, [syncRoomsForCounts]);

  const setHalfBathrooms = useCallback((e) => {
    const raw = e?.target ? e.target.value : e;
    const value = String(raw ?? "");
    setForm((f) => {
      const rooms = syncRoomsForCounts(f, f.bedrooms, value, f.fullBathrooms);
      return { ...f, halfBathrooms: value, rooms };
    });
    setFieldErrors((prev) => (prev?.halfBathrooms ? { ...prev, halfBathrooms: undefined } : prev));
  }, [syncRoomsForCounts]);

  const setFullBathrooms = useCallback((e) => {
    const raw = e?.target ? e.target.value : e;
    const value = String(raw ?? "");
    setForm((f) => {
      const rooms = syncRoomsForCounts(f, f.bedrooms, f.halfBathrooms, value);
      return { ...f, fullBathrooms: value, rooms };
    });
    setFieldErrors((prev) => (prev?.fullBathrooms ? { ...prev, fullBathrooms: undefined } : prev));
  }, [syncRoomsForCounts]);

  const addExtraRoom = useCallback(() => {
    setForm((f) => {
      const b = Math.max(0, parseInt(f.bedrooms, 10) || 0);
      const h = Math.max(0, parseInt(f.halfBathrooms, 10) || 0);
      const full = Math.max(0, parseInt(f.fullBathrooms, 10) || 0);
      const extraCount = (f.rooms?.length ?? 0) - b - h - full;
      return { ...f, rooms: [...(f.rooms || []), getInitialExtraRoom(extraCount)] };
    });
  }, []);

  const removeExtraRoom = useCallback((index) => {
    setForm((f) => {
      const b = Math.max(0, parseInt(f.bedrooms, 10) || 0);
      const h = Math.max(0, parseInt(f.halfBathrooms, 10) || 0);
      const full = Math.max(0, parseInt(f.fullBathrooms, 10) || 0);
      const extraStart = b + h + full;
      if (index < extraStart) return f;
      return { ...f, rooms: f.rooms.filter((_, i) => i !== index) };
    });
  }, []);

  const [uploadingMedia, setUploadingMedia] = useState(false);

  const addMedia = useCallback(async (file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      await Swal.fire({
        icon: "warning",
        title: "Formato no permitido",
        text: "Solo se permiten imágenes JPG, PNG o WebP.",
      });
      return;
    }
    setUploadingMedia(true);
    try {
      // Sin Content-Type para que axios use multipart/form-data con boundary
      const { data } = await uploadImage(file, "properties", {
        headers: { "Content-Type": undefined },
      });
      if (data?.success && data?.data?.url) {
        setForm((f) => {
          const media = f.media || [];
          const isFirst = media.length === 0;
          const newItem = {
            type: "PHOTO",
            url: data.data.url,
            isPrimary: isFirst,
            orderIndex: media.length,
            title: data.data.filename || file.name,
          };
          return { ...f, media: [...media, newItem] };
        });
      } else {
        throw new Error(data?.message ?? "Error al subir");
      }
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error al subir imagen",
        text: getErrorMessage(err),
      });
    } finally {
      setUploadingMedia(false);
    }
  }, []);

  const removeMedia = useCallback((index) => {
    setForm((f) => {
      const next = (f.media || []).filter((_, i) => i !== index);
      const removedWasPrimary = f.media?.[index]?.isPrimary;
      const updated = next.map((m, i) => ({
        ...m,
        isPrimary: removedWasPrimary ? i === 0 : m.isPrimary,
      }));
      if (updated.length > 0 && !updated.some((m) => m.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return { ...f, media: updated };
    });
  }, []);

  const setPrimaryMedia = useCallback((index) => {
    setForm((f) => ({
      ...f,
      media: (f.media || []).map((m, i) => ({ ...m, isPrimary: i === index })),
    }));
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

    const floorsNum = Math.min(Math.max(parseInt(form.floorsCount, 10) || 1, 1), 10);
    const invalidRoom = (form.rooms || []).find((r) => getFloorIndex(r.floor) >= floorsNum);
    if (invalidRoom) {
      setFieldErrors({ floorsCount: "Una habitación está en una planta que no existe. Revisá el detalle de habitaciones." });
      setError("La planta asignada a alguna habitación supera la cantidad de plantas declarada.");
      return false;
    }

    const b = Math.max(0, parseInt(form.bedrooms, 10) || 0);
    const h = Math.max(0, parseInt(form.halfBathrooms, 10) || 0);
    const full = Math.max(0, parseInt(form.fullBathrooms, 10) || 0);
    const mandatoryCount = b + h + full;
    const roomWithoutName = (form.rooms || []).slice(0, mandatoryCount).find((r) => !r.name?.trim());
    if (roomWithoutName) {
      setFieldErrors({ bedrooms: "Completá el nombre de todas las habitaciones obligatorias (dormitorios, baños)." });
      setError("Faltan datos en las habitaciones obligatorias.");
      return false;
    }

    setFieldErrors({});
    return true;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);

      const ok = validateForm();
      if (!ok) return;

      // if no current user, return
      if(!userId){
        setError("Debes iniciar sesión para registrar una propiedad.");
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Debes iniciar sesión para registrar una propiedad.",
        });
        return;
      }

      try {
        setLoading(true);
        if (isEditMode) {
          const payload = buildUpdatePropertyPayload(form);
          const { data } = await propertyApi.update(propertyId, payload);
          if (data?.success) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            await Swal.fire({
              icon: "success",
              title: "¡Propiedad actualizada!",
              text: "Los cambios se guardaron correctamente.",
            });
            navigate(`/properties/${propertyId}`);
          } else {
            setError(data?.message ?? "Ocurrió un error al actualizar.");
            await Swal.fire({
              icon: "error",
              title: "Error",
              text: data?.message ?? "Ocurrió un error al actualizar.",
            });
          }
        } else {
          const payload = buildCreatePropertyPayload(form, { ownerId: userId });
          const { data } = await propertyApi.create(payload);
          if (data?.success) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            await Swal.fire({
              icon: "success",
              title: "¡Propiedad registrada!",
              text: "La propiedad fue creada exitosamente.",
            });
            setForm(getInitialForm());
            setFieldErrors({});
          } else {
            setError(data?.message ?? "Ocurrió un error al guardar la propiedad.");
            await Swal.fire({
              icon: "error",
              title: "Error",
              text: data?.message ?? "Ocurrió un error al guardar la propiedad.",
            });
          }
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [form, isEditMode, propertyId, navigate]
  );

  const dismissError = useCallback(() => setError(null), []);

  return {
    form,
    loading,
    fetchLoading,
    error,
    isEditMode,
    set,
    setArr,
    setFloorsCount,
    setBedrooms,
    setHalfBathrooms,
    setFullBathrooms,
    updateRoom,
    addExtraRoom,
    removeExtraRoom,
    addMedia,
    removeMedia,
    setPrimaryMedia,
    uploadingMedia,
    handleSubmit,
    dismissError,
    fieldErrors,
    validateForm,
  };
}
