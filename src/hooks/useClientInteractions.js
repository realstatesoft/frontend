import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  createClientInteraction,
  deleteClientInteraction,
  listClientInteractions,
  updateClientInteraction,
} from "../services/clients/clientInteractionApi";

const PAGE_SIZE = 10;

function normalizeInteractionPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
}

function sortInteractions(items) {
  return [...items].sort((left, right) => {
    const leftDate = left?.occurredAt ? new Date(left.occurredAt).getTime() : 0;
    const rightDate = right?.occurredAt ? new Date(right.occurredAt).getTime() : 0;
    return rightDate - leftDate;
  });
}

function mergeInteractions(current, incoming) {
  const merged = new Map();

  current.forEach((interaction) => {
    merged.set(interaction.id, interaction);
  });

  incoming.forEach((interaction) => {
    merged.set(interaction.id, interaction);
  });

  return sortInteractions(Array.from(merged.values()));
}

function parsePageResponse(response) {
  if (Array.isArray(response)) {
    return {
      content: response,
      page: 0,
      totalPages: 1,
      totalElements: response.length,
    };
  }

  return {
    content: response?.content ?? [],
    page: response?.number ?? 0,
    totalPages: response?.totalPages ?? 1,
    totalElements: response?.totalElements ?? response?.content?.length ?? 0,
  };
}

function getInteractionErrorMessage(error, fallback = "No se pudo completar la operación.") {
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message || error?.response?.data?.error;

  if (backendMessage) {
    return backendMessage;
  }

  switch (status) {
    case 400:
      return "La información enviada no es válida. Revisá los campos e intentá nuevamente.";
    case 401:
      return "Tu sesión expiró. Iniciá sesión nuevamente para continuar.";
    case 403:
      return "No tenés permisos para acceder a las interacciones de este cliente.";
    case 404:
      return "No se encontró el cliente o la interacción solicitada.";
    case 415:
      return "No se pudo procesar la solicitud enviada por la aplicación.";
    default:
      return fallback;
  }
}

async function showSuccessToast(title) {
  await Swal.fire({
    icon: "success",
    title,
    timer: 1800,
    showConfirmButton: false,
    toast: true,
    position: "top-end",
  });
}

async function showErrorAlert(text) {
  await Swal.fire({
    icon: "error",
    title: "No se pudo completar la acción",
    text,
  });
}

export default function useClientInteractions(clientId, { enabled = true, onChange } = {}) {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const latestRequestIdRef = useRef(0);

  const refreshParent = useCallback(async () => {
    if (typeof onChange === "function") {
      await onChange();
    }
  }, [onChange]);

  const fetchInteractions = useCallback(
    async ({ pageToLoad = 0, append = false, typeOverride = filterType } = {}) => {
      const requestId = ++latestRequestIdRef.current;

      if (!enabled || !clientId) {
        if (requestId === latestRequestIdRef.current) {
          setInteractions([]);
          setError(null);
          setPage(0);
          setTotalPages(1);
          setTotalElements(0);
          setLoading(false);
          setLoadingMore(false);
        }
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = {
          page: pageToLoad,
          size: PAGE_SIZE,
        };

        if (typeOverride && typeOverride !== "ALL") {
          params.type = typeOverride;
        }

        const response = await listClientInteractions(clientId, params);
        if (requestId !== latestRequestIdRef.current) {
          return;
        }

        const parsedResponse = parsePageResponse(response);
        const normalizedContent = sortInteractions(parsedResponse.content);

        setInteractions((current) =>
          append ? mergeInteractions(current, normalizedContent) : normalizedContent
        );
        setPage(parsedResponse.page);
        setTotalPages(parsedResponse.totalPages);
        setTotalElements(parsedResponse.totalElements);
      } catch (fetchError) {
        if (requestId !== latestRequestIdRef.current) {
          return;
        }

        setError(
          getInteractionErrorMessage(
            fetchError,
            "No se pudieron cargar las interacciones del cliente."
          )
        );
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [clientId, enabled, filterType]
  );

  useEffect(() => {
    fetchInteractions({ pageToLoad: 0, append: false });
  }, [fetchInteractions]);

  const loadMore = useCallback(async () => {
    if (loadingMore || page + 1 >= totalPages) {
      return;
    }

    await fetchInteractions({ pageToLoad: page + 1, append: true });
  }, [fetchInteractions, loadingMore, page, totalPages]);

  const refreshInteractions = useCallback(async () => {
    await fetchInteractions({ pageToLoad: 0, append: false });
  }, [fetchInteractions]);

  const createInteraction = useCallback(
    async (payload) => {
      setCreating(true);

      try {
        const body = normalizeInteractionPayload(payload);
        await createClientInteraction(clientId, body);
        await showSuccessToast("Interacción registrada");
      } catch (mutationError) {
        await showErrorAlert(
          getInteractionErrorMessage(
            mutationError,
            "No se pudo registrar la interacción."
          )
        );
        return false;
      }

      const shouldResetFilter = filterType !== "ALL" && filterType !== payload.type;
      const nextFilter = shouldResetFilter ? "ALL" : filterType;

      if (shouldResetFilter) {
        setFilterType("ALL");
      }

      try {
        await Promise.all([
          fetchInteractions({ pageToLoad: 0, append: false, typeOverride: nextFilter }),
          refreshParent(),
        ]);
      } catch (refreshError) {
        console.error("Error al refrescar interacciones tras crear:", refreshError);
        await showErrorAlert(
          getInteractionErrorMessage(
            refreshError,
            "La interacción se registró, pero no se pudo actualizar la vista."
          )
        );
      } finally {
        setCreating(false);
      }

      return true;
    },
    [clientId, fetchInteractions, filterType, refreshParent]
  );

  const updateInteraction = useCallback(
    async (interactionId, payload) => {
      setUpdatingId(interactionId);

      try {
        const body = normalizeInteractionPayload(payload);
        await updateClientInteraction(clientId, interactionId, body);
        await showSuccessToast("Interacción actualizada");
      } catch (mutationError) {
        await showErrorAlert(
          getInteractionErrorMessage(
            mutationError,
            "No se pudo actualizar la interacción."
          )
        );
        return false;
      }

      try {
        await Promise.all([refreshInteractions(), refreshParent()]);
      } catch (refreshError) {
        console.error("Error al refrescar interacciones tras actualizar:", refreshError);
        await showErrorAlert(
          getInteractionErrorMessage(
            refreshError,
            "La interacción se actualizó, pero no se pudo refrescar la vista."
          )
        );
      } finally {
        setUpdatingId(null);
      }

      return true;
    },
    [clientId, refreshInteractions, refreshParent]
  );

  const deleteInteraction = useCallback(
    async (interactionId) => {
      setDeletingId(interactionId);

      try {
        await deleteClientInteraction(clientId, interactionId);
        await showSuccessToast("Interacción eliminada");
      } catch (mutationError) {
        await showErrorAlert(
          getInteractionErrorMessage(
            mutationError,
            "No se pudo eliminar la interacción."
          )
        );
        return false;
      }

      try {
        await Promise.all([refreshInteractions(), refreshParent()]);
      } catch (refreshError) {
        console.error("Error al refrescar interacciones tras eliminar:", refreshError);
        await showErrorAlert(
          getInteractionErrorMessage(
            refreshError,
            "La interacción se eliminó, pero no se pudo refrescar la vista."
          )
        );
      } finally {
        setDeletingId(null);
      }

      return true;
    },
    [clientId, refreshInteractions, refreshParent]
  );

  return useMemo(
    () => ({
      interactions,
      loading,
      loadingMore,
      creating,
      updatingId,
      deletingId,
      error,
      filterType,
      setFilterType,
      totalElements,
      hasMore: page + 1 < totalPages,
      fetchInteractions: refreshInteractions,
      loadMore,
      createInteraction,
      updateInteraction,
      deleteInteraction,
      getInteractionErrorMessage,
    }),
    [
      interactions,
      loading,
      loadingMore,
      creating,
      updatingId,
      deletingId,
      error,
      filterType,
      totalElements,
      page,
      totalPages,
      refreshInteractions,
      loadMore,
      createInteraction,
      updateInteraction,
      deleteInteraction,
    ]
  );
}
