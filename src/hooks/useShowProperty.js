import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import propertyApi from "../services/properties/propertyApi";
import { formatPrice } from "../utils/priceFormat";
import { formatTimeAgo } from "../utils/dateFormat";
import { buildFeaturesFromProperty } from "../utils/propertyHelpers";
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_VISIBILITY_OPTIONS,
} from "../constants/propertyEnums";
import { PLACEHOLDER_IMAGES } from "../constants/showPropertyConstants";

const getErrorMessage = (err) =>
  err.response?.data?.message ??
  err.response?.data?.errors?.[0] ??
  "No se pudo conectar con el servidor. Verificá que el backend esté activo.";

const SIMILAR_LIMIT = 6
/**
 * Hook con toda la lógica de la página ShowProperty:
 * fetch de propiedad, estado, visibilidad, changeStatus, changeVisibility, delete.
 */
export function useShowProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState(PROPERTY_STATUS_OPTIONS[0]);
  const [visibility, setVisibility] = useState(PROPERTY_VISIBILITY_OPTIONS[0]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState({});

  const isOwner = true; // TODO: verificar cuando esté el manejo de usuarios

  const fetchProperty = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    propertyApi
      .getById(id)
      .then(({ data }) => {
        if (data?.success && data?.data) {
          const p = data.data;
          setProperty(p);
          const statusOpt = PROPERTY_STATUS_OPTIONS.find((o) => o.value === p.status) ?? PROPERTY_STATUS_OPTIONS[0];
          const visOpt = PROPERTY_VISIBILITY_OPTIONS.find((o) => o.value === p.visibility) ?? PROPERTY_VISIBILITY_OPTIONS[0];
          setStatus(statusOpt);
          setVisibility(visOpt);
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
      .finally(() => setLoading(false));
  }, [id]);

  const fetchSimilar = useCallback(() => {
    if (!id) return;
    setLoadingSimilar(true);
    setError(null);
    propertyApi
      .getSimilar(id, SIMILAR_LIMIT)
      .then(({ data }) => {
        if (data?.success && data?.data) {
          const p = data.data;
          setSimilarProperties(p);
          const statusOpt = PROPERTY_STATUS_OPTIONS.find((o) => o.value === p.status) ?? PROPERTY_STATUS_OPTIONS[0];
        } else {
          setError("No se pudieron obtener propiedades similares");
        }
      })
      .catch((err) => {
        setError(
          err.response?.status === 404
            ? "No se pudieron obtener propiedades similares."
            : getErrorMessage(err)
        );
      })
      .finally(() => setLoadingSimilar(false));
  }, [id]);

  useEffect(() => {
    fetchProperty();
    fetchSimilar();
  }, [fetchProperty, fetchSimilar]);

  const hideConfirm = useCallback(() => {
    setShowConfirm(false);
    setConfirmData({});
  }, []);

  const handleConfirmChangeStatus = useCallback(
    async (option) => {
      if (!id) return;
      setActionLoading(true);
      try {
        const { data } = await propertyApi.changeStatus(id, option.value);
        if (data?.success && data?.data) {
          setProperty(data.data);
          setStatus(option);
          hideConfirm();
          await Swal.fire({
            icon: "success",
            title: "Estado actualizado",
            text: `La propiedad ahora está "${option.label}".`,
          });
        } else {
          throw new Error(data?.message ?? "Error al cambiar estado");
        }
      } catch (err) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: getErrorMessage(err),
        });
      } finally {
        setActionLoading(false);
      }
    },
    [id, hideConfirm]
  );

  const handleConfirmChangeVisibility = useCallback(
    async (option) => {
      if (!id) return;
      setActionLoading(true);
      try {
        const { data } = await propertyApi.update(id, { visibility: option.value });
        if (data?.success && data?.data) {
          setProperty(data.data);
          setVisibility(option);
          hideConfirm();
          await Swal.fire({
            icon: "success",
            title: "Visibilidad actualizada",
            text: `La propiedad ahora es "${option.label}".`,
          });
        } else {
          throw new Error(data?.message ?? "Error al cambiar visibilidad");
        }
      } catch (err) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: getErrorMessage(err),
        });
      } finally {
        setActionLoading(false);
      }
    },
    [id, hideConfirm]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await propertyApi.trash(id);
      hideConfirm();
      await Swal.fire({
        icon: "success",
        title: "Propiedad eliminada",
        text: "La propiedad fue eliminada correctamente",
      });
      navigate("/properties");
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(err),
      });
    } finally {
      setActionLoading(false);
    }
  }, [id, hideConfirm, navigate]);

  const openChangeStatusConfirm = useCallback((option) => {
    setConfirmData({
      title: `Cambiar estado a "${option.label}"`,
      message: `¿Estás seguro que deseas cambiar el estado de esta propiedad a "${option.label}"?`,
      confirmText: "Cambiar",
      cancelText: "Cancelar",
      variant: "warning",
      onConfirm: () => handleConfirmChangeStatus(option),
    });
    setShowConfirm(true);
  }, [handleConfirmChangeStatus]);

  const openChangeVisibilityConfirm = useCallback((option) => {
    setConfirmData({
      title: `Cambiar visibilidad a "${option.label}"`,
      message: `¿Estás seguro que deseas cambiar la visibilidad de esta propiedad a "${option.label}"?`,
      confirmText: "Cambiar",
      cancelText: "Cancelar",
      variant: "warning",
      onConfirm: () => handleConfirmChangeVisibility(option),
    });
    setShowConfirm(true);
  }, [handleConfirmChangeVisibility]);

  const openDeleteConfirm = useCallback(() => {
    setConfirmData({
      title: "Eliminar propiedad",
      message: "¿Estás seguro que deseas eliminar esta propiedad? Estará disponible en la papelera de reciclaje por 10 días",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: handleConfirmDelete,
    });
    setShowConfirm(true);
  }, [handleConfirmDelete]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    try {
      await navigator.clipboard.writeText(window.location.href);
      await Swal.fire({
        icon: "success",
        title: "Enlace copiado",
        text: "El enlace fue copiado al portapapeles.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo copiar el enlace al portapapeles.",
      });
    }
  };

  // Valores derivados para la UI
  const images = property?.media?.length
    ? property.media
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((m) => m.url)
    : PLACEHOLDER_IMAGES;

  const features = buildFeaturesFromProperty(property);
  const priceFormatted = property?.price != null ? `₲ ${formatPrice(String(property.price))}` : "";
  const propertyTypeLabel = property?.propertyType ? PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType : "";
  const mapUrl =
    property?.lat != null && property?.lng != null
      ? `https://maps.google.com/maps?q=${property.lat},${property.lng}&output=embed`
      : "https://maps.google.com/maps?q=Encarnaci%C3%B3n,+Paraguay&output=embed";

  return {
    property,
    loading,
    actionLoading,
    error,
    isOwner,
    status,
    visibility,
    showConfirm,
    confirmData,
    hideConfirm,
    images,
    features,
    priceFormatted,
    propertyTypeLabel,
    mapUrl,
    formatTimeAgo,
    openChangeStatusConfirm,
    openChangeVisibilityConfirm,
    openDeleteConfirm,
    PROPERTY_STATUS_OPTIONS,
    PROPERTY_VISIBILITY_OPTIONS,
    fetchSimilar,
    loadingSimilar,
    copyLink
  };
}
