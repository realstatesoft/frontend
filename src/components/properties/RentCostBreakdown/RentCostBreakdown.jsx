import { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import rentService from '../../services/rentService';
import { formatPrice } from '../../utils/priceFormat';
import styles from './RentCostBreakdown.module.scss';

export default function RentCostBreakdown({ propertyId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!propertyId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await rentService.getRentCost(propertyId);
        setData(result.data);
      } catch (err) {
        console.error('Error fetching rent cost:', err);
        setError('No se pudo cargar el desglose de costos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  if (loading) {
    return (
      <Card className={styles.card}>
        <Card.Body className={styles.loading}>
          <Spinner animation="border" size="sm" />
          <span>Cargando...</span>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={styles.card}>
        <Card.Body>
          <Alert variant="warning" className="mb-0">
            {error}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className={styles.card}>
      <Card.Header className={styles.header}>
        <span>Costo Inicial de Alquiler</span>
      </Card.Header>
      <Card.Body className={styles.body}>
        <div className={styles.row}>
          <span className={styles.label}>Deposito ({data.depositMonths} meses)</span>
          <span className={styles.value}>{formatPrice(data.deposit)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Primer mes</span>
          <span className={styles.value}>{formatPrice(data.firstMonth)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Comision ({data.commissionPercent}%)</span>
          <span className={styles.value}>{formatPrice(data.commission)}</span>
        </div>
        <hr className={styles.divider} />
        <div className={`${styles.row} ${styles.rowTotal}`}>
          <span className={styles.labelTotal}>Total a pagar</span>
          <span className={styles.valueTotal}>{formatPrice(data.total)}</span>
        </div>
      </Card.Body>
    </Card>
  );
}