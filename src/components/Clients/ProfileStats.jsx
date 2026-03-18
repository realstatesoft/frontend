import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FIGMA_COLORS } from '../../constants/clientConstants';

const ProfileStats = ({ client }) => {
  if (!client) return null;

  const { stats: statsColors } = FIGMA_COLORS;

  const stats = [
    { label: 'Propiedades Visitadas', value: client.visitedPropertiesCount || 0, color: statsColors.visited },
    { label: 'Ofertas realizadas', value: client.offersCount || 0, color: statsColors.offers },
    { label: 'Interacciones', value: client.interactionsCount || 0, color: statsColors.interactions },
    { label: 'Presupuesto Máximo', value: `$ ${client.maxBudget?.toLocaleString() || '0'}`, color: statsColors.budget },
  ];

  return (
    <Row className="g-4 mb-4">
      {stats.map((stat, idx) => (
        <Col key={idx} md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem' }}>
            <Card.Body className="p-4">
              <h2 className="fw-bold mb-1" style={{ color: stat.color, fontSize: '2rem' }}>
                {stat.value}
              </h2>
              <div className="fw-bold" style={{ color: FIGMA_COLORS.deepDark, fontSize: '0.9rem' }}>{stat.label}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProfileStats;
