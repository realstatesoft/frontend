import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "./useAuth";
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
import propertyFlagsApi from "../services/propertyFlagsApi";

const getErrorMessage = (err) =>
  err.response?.data?.message ??
  err.response?.data?.errors?.[0] ??
  "No se pudo conectar con el servidor. Verificá que el backend esté activo.";

const SIMILAR_LIMIT = 6
const registeredViewIds = new Set();

export function __resetShowPropertyViewRegistrationForTests() {
  registeredViewIds.clear();
}

/**
 * Hook con toda la lógica de la página ShowProperty:
 * fetch de propiedad, estado, visibilidad, changeStatus, changeVisibility, delete.
 */
export function useShowProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const similarRequestRef = useRef(0);
  const viewCountRequestRef = useRef(0);
  const latestRecentRequestIdRef = useRef(0);
  const registeredViewRef = useRef(registeredViewIds);

  const [property, setProperty] = useState(null);
  const propertyRef = useRef(property);
  propertyRef.current = property;
  const [similarProperties, setSimilarProperties] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [similarError, setSimilarError] = useState(null);
  const [recentError, setRecentError] = useState(null);
  const [viewCount, setViewCount] = useState(null);

  const [status, setStatus] = useState(PROPERTY_STATUS_OPTIONS[0]);
  const [visibility, setVisibility] = useState(PROPERTY_VISIBILITY_OPTIONS[0]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState({});

  const [activeFlagCount, setActiveFlagCount] = useState(0);

  const { user, isAuthenticated } = useAuth();
  const propertyOwnerId = property?.ownerId ?? property?.userId ?? null;
  const isOwner = isAuthenticated && propertyOwnerId !== null && propertyOwnerId === user?.userId;

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
    if (!id) {
      setSimilarProperties([]);
      setSimilarError(null);
      setLoadingSimilar(false);
      return;
    }
    const requestId = ++similarRequestRef.current;
    setLoadingSimilar(true);
    setSimilarError(null);
    propertyApi
      .getSimilar(id, SIMILAR_LIMIT)
      .then(({ data }) => {
        if (requestId !== similarRequestRef.current) return;
        if (data?.success && data?.data) {
          const p = data.data;
          setSimilarProperties(p);
        } else {
          setSimilarProperties([]);
          setSimilarError("No se pudieron obtener propiedades similares");
        }
      })
      .catch((err) => {
        if (requestId !== similarRequestRef.current) return;
        setSimilarProperties([]);
        setSimilarError(
          err.response?.status === 404
            ? "No se pudieron obtener propiedades similares."
            : getErrorMessage(err)
        );
      })
      .finally(() => {
        if (requestId === similarRequestRef.current) {
          setLoadingSimilar(false);
        }
      });
  }, [id]);

  const fetchRecentProperties = useCallback(() => {
    const requestId = ++latestRecentRequestIdRef.current;

    if (!isAuthenticated) {
      if (requestId === latestRecentRequestIdRef.current) {
        setRecentProperties([]);
        setRecentError(null);
        setLoadingRecent(false);
      }
      return;
    }

    setLoadingRecent(true);
    setRecentError(null);
    propertyApi
      .getRecentProperties()
      .then(({ data }) => {
        if (requestId !== latestRecentRequestIdRef.current || !isAuthenticated) return;
        if (data?.success && Array.isArray(data?.data)) {
          setRecentProperties(data.data);
        } else {
          setRecentProperties([]);
          setRecentError("No se pudieron cargar las propiedades recientes");
        }
      })
      .catch(() => {
        if (requestId !== latestRecentRequestIdRef.current || !isAuthenticated) return;
        setRecentProperties([]);
        setRecentError("No se pudieron cargar las propiedades recientes");
      })
      .finally(() => {
        if (requestId === latestRecentRequestIdRef.current) {
          setLoadingRecent(false);
        }
      });
  }, [isAuthenticated]);

  const fetchActiveFlagCount = useCallback(() => {
    if (!id) {
      setActiveFlagCount(0);
      return;
    }
    propertyFlagsApi.getActiveFlagCount(id)
      .then((data) => {
         // data could be directly the number or JSON with data field
         const count = typeof data === 'number' ? data : (data?.data ?? data?.count ?? 0);
         setActiveFlagCount(count);
      })
      .catch(() => {
        // Ignorar si falla el conteo
        setActiveFlagCount(0);
      });
  }, [id]);

  const fetchViewCount = useCallback(() => {
    if (!id) {
      setViewCount(null);
      return Promise.resolve(null);
    }

    const requestId = ++viewCountRequestRef.current;
    const currentId = String(id);

    return propertyApi
      .getViewCount(id)
      .then(({ data }) => {
        if (
          requestId !== viewCountRequestRef.current ||
          String(id) !== currentId
        ) {
          return null;
        }
        const count = typeof data === "number" ? data : (data?.data ?? data?.count ?? data);
        setViewCount(Number.isFinite(Number(count)) ? Number(count) : null);
        return count;
      })
      .catch(() => {
        if (
          requestId !== viewCountRequestRef.current ||
          String(id) !== currentId
        ) {
          return null;
        }
        setViewCount(null);
        return null;
      });
  }, [id]);

  const registerPropertyView = useCallback(() => {
    if (!id) return Promise.resolve(null);
    const propertyId = String(id);
    if (registeredViewRef.current.has(propertyId)) {
      return Promise.resolve(null);
    }
    registeredViewRef.current.add(propertyId);
    return propertyApi.registerView(id).catch(() => {
      registeredViewRef.current.delete(propertyId);
      return null;
    });
  }, [id]);

  useEffect(() => {
    fetchProperty();
    fetchSimilar();
    fetchActiveFlagCount();

    let cancelled = false;

    const registerAndCountViews = async () => {
      await registerPropertyView();
      if (cancelled) return;
      await fetchViewCount();
    };

    registerAndCountViews();

    return () => {
      cancelled = true;
    };
  }, [fetchProperty, fetchSimilar, fetchActiveFlagCount, fetchViewCount, registerPropertyView]);

  useEffect(() => {
    latestRecentRequestIdRef.current += 1;
    let isCurrent = true;

    const syncRecentProperties = async () => {
      if (!id || !isAuthenticated) {
        fetchRecentProperties();
        return;
      }

      await propertyApi.registerRecentView(id).catch(() => {
        // No bloquear la pantalla por fallos de registro.
      });
      if (!isCurrent) return;
      fetchRecentProperties();
    };

    syncRecentProperties();

    return () => {
      isCurrent = false;
      latestRecentRequestIdRef.current += 1;
    };
  }, [id, isAuthenticated, fetchRecentProperties]);

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

  const handleToggleHighlight = useCallback(async () => {
    const currentProp = propertyRef.current;
    if (!id || !currentProp) return;
    setActionLoading(true);
    const newHighlightState = !currentProp.highlighted;
    try {
      const { data } = await propertyApi.toggleHighlight(id, newHighlightState);
      if (!data?.success || !data?.data) throw new Error(data?.message || 'Backend reported failure');
      
      setProperty(data.data);
      await Swal.fire({
        icon: "success",
        title: "Éxito",
        text: newHighlightState ? "Propiedad destacada correctamente" : "Se ha quitado el destacado de la propiedad",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(err),
      });
    } finally {
      setActionLoading(false);
    }
  }, [id]);

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

  const handleRemoveHighlight = useCallback(async () => {
    if (!id || actionLoading) return;
    setActionLoading(true);
    try {
      const { data } = await propertyApi.removeHighlight(id);
      if (!data?.success) throw new Error(data?.message || 'Backend reported failure');
      if (data.property) {
        setProperty(data.property);
      } else {
        setProperty((prev) => prev ? { ...prev, highlighted: false, highlightedUntil: null } : prev);
      }
      await Swal.fire({
        icon: "success",
        title: "Destacado removido",
        text: "La propiedad ya no está destacada.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(err),
      });
    } finally {
      setActionLoading(false);
    }
  }, [id, actionLoading]);

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
  const images = useMemo(() => {
    const filtered = property?.media?.filter((m) => m.type === "IMAGE") || [];
    if (filtered.length === 0) return PLACEHOLDER_IMAGES;
    return filtered
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map((m) => m.url);
  }, [property?.media]);

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
    isAuthenticated,
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
    similarProperties,
    similarError,
    recentProperties,
    loadingRecent,
    recentError,
    copyLink,
    activeFlagCount,
    viewCount,
    fetchActiveFlagCount,
    handleRemoveHighlight
  };
}
