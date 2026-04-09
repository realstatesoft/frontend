import { useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Spinner } from "react-bootstrap";
import {
  ArrowClockwise,
  ExclamationTriangleFill,
  FunnelFill,
} from "react-bootstrap-icons";
import {
  INTERACTION_FILTER_OPTIONS,
  INTERACTION_TYPE_LABELS,
} from "../../constants/clientInteractionConstants";
import useClientInteractions from "../../hooks/useClientInteractions";
import ConfirmDialog from "../commons/ConfirmDialog";
import InteractionComposer from "./interactions/InteractionComposer";
import InteractionTimelineItem from "./interactions/InteractionTimelineItem";

export default function ClientInteractionsPanel({ client, clientId, onRefreshClient }) {
  const resolvedClientId = client?.clientId ?? clientId ?? client?.id;
  const [composerOpen, setComposerOpen] = useState(false);
  const [interactionToDelete, setInteractionToDelete] = useState(null);

  const {
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
    hasMore,
    fetchInteractions,
    loadMore,
    createInteraction,
    updateInteraction,
    deleteInteraction,
  } = useClientInteractions(resolvedClientId, {
    enabled: Boolean(resolvedClientId),
    onChange: onRefreshClient,
  });

  const currentFilterLabel = useMemo(() => {
    if (filterType === "ALL") {
      return "todas";
    }

    return INTERACTION_TYPE_LABELS[filterType]?.toLowerCase() ?? filterType.toLowerCase();
  }, [filterType]);

  const handleDeleteConfirm = async () => {
    if (!interactionToDelete) {
      return;
    }

    const success = await deleteInteraction(interactionToDelete.id);
    if (success) {
      setInteractionToDelete(null);
    }
  };

  return (
    <>
      <InteractionComposer
        open={composerOpen}
        onToggle={setComposerOpen}
        onSubmit={createInteraction}
        creating={creating}
      />

      <Card className="border-0 shadow-sm" style={{ borderRadius: "1.5rem" }}>
        <Card.Body className="p-4 p-md-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <h4 className="fw-bold mb-0">Interacciones CRM</h4>
                <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill border">
                  {totalElements} registradas
                </Badge>
              </div>
              <p className="text-muted mb-0">
                Seguí el historial comercial del cliente con eventos manuales y
                automáticos desde una sola línea de tiempo.
              </p>
            </div>

            <Button
              variant="outline-secondary"
              className="rounded-pill px-4 align-self-start"
              onClick={fetchInteractions}
              disabled={loading}
            >
              <ArrowClockwise className="me-2" />
              Actualizar
            </Button>
          </div>

          <div className="crm-interactions__filters d-flex flex-wrap gap-2 mb-4">
            {INTERACTION_FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={filterType === option.value ? "primary" : "light"}
                className={`rounded-pill px-3 ${
                  filterType === option.value ? "" : "border"
                }`}
                onClick={() => setFilterType(option.value)}
              >
                <FunnelFill className="me-2" size={12} />
                {option.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-3 mb-0">Cargando interacciones...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="mb-0">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex align-items-start gap-2">
                  <ExclamationTriangleFill className="mt-1 flex-shrink-0" />
                  <div>
                    <div className="fw-semibold">No pudimos cargar la línea de tiempo</div>
                    <div>{error}</div>
                  </div>
                </div>
                <Button variant="outline-danger" size="sm" onClick={fetchInteractions}>
                  Reintentar
                </Button>
              </div>
            </Alert>
          ) : interactions.length === 0 ? (
            <div className="text-center py-5 px-3 bg-light rounded-4 border">
              <div className="mb-3">
                <ExclamationTriangleFill size={28} className="text-secondary opacity-75" />
              </div>
              <h5 className="fw-bold">No hay interacciones {currentFilterLabel}</h5>
              <p className="text-muted mb-3">
                Registrá la primera interacción manual o cambiá el filtro para ver más actividad.
              </p>
              {filterType !== "ALL" && (
                <Button
                  variant="outline-secondary"
                  className="rounded-pill px-4"
                  onClick={() => setFilterType("ALL")}
                >
                  Ver todas
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="crm-interactions__timeline">
                {interactions.map((interaction) => (
                  <InteractionTimelineItem
                    key={interaction.id}
                    interaction={interaction}
                    updating={updatingId === interaction.id}
                    deleting={deletingId === interaction.id}
                    onUpdate={updateInteraction}
                    onDelete={setInteractionToDelete}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-4">
                  <Button
                    variant="outline-primary"
                    className="rounded-pill px-4"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Cargando..." : "Cargar más interacciones"}
                  </Button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <ConfirmDialog
        show={Boolean(interactionToDelete)}
        onHide={() => setInteractionToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar interacción"
        message={`¿Querés eliminar esta ${
          interactionToDelete
            ? INTERACTION_TYPE_LABELS[interactionToDelete.type]?.toLowerCase() ?? "interacción"
            : "interacción"
        }? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        loading={Boolean(interactionToDelete) && deletingId === interactionToDelete?.id}
      />
    </>
  );
}
