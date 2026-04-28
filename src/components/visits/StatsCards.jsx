import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Clock, Check2Circle, XCircle, ListUl } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import './visits.scss';

const StatsCards = ({ stats = {} }) => {
  const { t } = useTranslation('owner');
  const cards = [
    {
      label: t('visits.stats.pending'),
      value: stats.pending ?? 0,
      icon: <Clock size={24} />,
      variant: 'pending'
    },
    {
      label: t('visits.stats.accepted'),
      value: stats.accepted ?? 0,
      icon: <Check2Circle size={24} />,
      variant: 'approved'
    },
    {
      label: t('visits.stats.rejected'),
      value: stats.rejected ?? 0,
      icon: <XCircle size={24} />,
      variant: 'rejected'
    },
    {
      label: t('visits.stats.total'),
      value: stats.total ?? 0,
      icon: <ListUl size={24} />,
      variant: 'total'
    }
  ];

  return (
    <Row className="mb-4">
      {cards.map((card, idx) => (
        <Col key={idx} xs={12} md={3} className="mb-3 mb-md-0">
          <Card className={`stats-card stats-card--${card.variant}`}>
            <Card.Body className="d-flex align-items-center p-3">
              <div className="me-3 stats-icon">
                {card.icon}
              </div>
              <div>
                <div className="h4 fw-bold mb-0 stats-value">{card.value}</div>
                <div className="small fw-semibold stats-label">{card.label}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;
