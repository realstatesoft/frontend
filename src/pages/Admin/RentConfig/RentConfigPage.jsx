import { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import rentService from '../../../services/rentService';
import styles from './RentConfigPage.module.scss';

export default function RentConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [depositMonths, setDepositMonths] = useState(2);
  const [commissionPercent, setCommissionPercent] = useState(50);

  useEffect(() => {
    let active = true;

    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await rentService.getRentConfig();
        if (!active) return;
        if (result?.data) {
          setDepositMonths(result.data.depositMonths ?? 2);
          setCommissionPercent(result.data.commissionPercent ?? 50);
        }
      } catch (err) {
        if (!active) return;
        console.error('Error fetching rent config:', err);
        setError('No se pudo cargar la configuración.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchConfig();
    return () => {
      active = false;
    };
  }, []);

  const handleDepositChange = (e) => {
    setDepositMonths(e.target.value);
    setSuccessMsg(null);
  };

  const handleCommissionChange = (e) => {
    setCommissionPercent(e.target.value);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const dm = Number(depositMonths);
    const cp = Number(commissionPercent);

    if (!Number.isFinite(dm) || dm < 1 || dm > 12) {
      setError('Los meses de depósito deben ser un número entre 1 y 12.');
      return;
    }
    if (!Number.isFinite(cp) || cp < 0 || cp > 100) {
      setError('El porcentaje de comisión debe ser un número entre 0 y 100.');
      return;
    }

    setSaving(true);
    try {
      await rentService.updateRentConfig({
        depositMonths: dm,
        commissionPercent: cp,
      });
      setSuccessMsg('Configuración guardada exitosamente.');
    } catch (err) {
      console.error('Error saving rent config:', err);
      setError('No se pudo guardar la configuración. Verifica los valores e intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Configuración de Alquiler</h2>
      <p className={styles.subtitle}>
        Configura los parámetros utilizados para calcular el costo inicial de alquiler.
      </p>

      <Card className={styles.card}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4" controlId="depositMonths">
              <Form.Label className={styles.label}>
                Meses de depósito
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="12"
                value={depositMonths}
                onChange={handleDepositChange}
                className={styles.input}
              />
              <Form.Text className="text-muted">
                Cantidad de meses de alquiler que se requieren como depósito de garantía.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4" controlId="commissionPercent">
              <Form.Label className={styles.label}>
                Porcentaje de comisión (%)
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                value={commissionPercent}
                onChange={handleCommissionChange}
                className={styles.input}
              />
              <Form.Text className="text-muted">
                Porcentaje del alquiler mensual que se cobra como comisión por gestión.
              </Form.Text>
            </Form.Group>

            {error && (
              <Alert variant="danger" role="alert" className="mb-3">
                {error}
              </Alert>
            )}

            {successMsg && (
              <Alert variant="success" className="mb-3">
                {successMsg}
              </Alert>
            )}

            <div className={styles.buttonGroup}>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className={styles.button}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}