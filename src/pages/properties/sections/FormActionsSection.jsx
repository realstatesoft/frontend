import { Button, Stack, Spinner } from "react-bootstrap";

export function FormActionsSection({ loading }) {
  return (
    <Stack direction="horizontal" gap={2} className="justify-content-end pt-3 border-top">
      <Button variant="secondary" type="button" className="px-4" disabled={loading}>
        Cancelar
      </Button>
      <Button variant="primary" type="submit" className="px-4" disabled={loading}>
        {loading ? (
          <>
            <Spinner size="sm" className="me-2" />
            Guardando...
          </>
        ) : (
          "Guardar Propiedad"
        )}
      </Button>
    </Stack>
  );
}
