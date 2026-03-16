import { Button, Stack, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export function FormActionsSection({ loading }) {
  const navigate = useNavigate();

  return (
    <Stack direction="horizontal" gap={2} className="justify-content-end pt-3 border-top">
      <Button variant="secondary" type="button" className="px-4" disabled={loading} onClick={() => navigate("/properties/me")}>
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
