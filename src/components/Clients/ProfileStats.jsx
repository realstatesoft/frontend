import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FIGMA_COLORS } from '../../constants/clientConstants';

import { IoHomeOutline, IoDocumentTextOutline, IoChatbubbleEllipsesOutline, IoCashOutline } from "react-icons/io5";

const ProfileStats = ({ client }) => {
  if (!client) return null;

  const stats = [
    { 
        label: 'Visitas', 
        value: client.visitedPropertiesCount || 0, 
        color: 'var(--primary)', 
        icon: <IoHomeOutline />,
        bg: 'rgba(37, 99, 235, 0.08)'
    },
    { 
        label: 'Ofertas', 
        value: client.offersCount || 0, 
        color: '#10b981', 
        icon: <IoDocumentTextOutline />,
        bg: 'rgba(16, 185, 129, 0.08)'
    },
    { 
        label: 'Interacciones', 
        value: client.interactionsCount || 0, 
        color: '#8b5cf6', 
        icon: <IoChatbubbleEllipsesOutline />,
        bg: 'rgba(139, 92, 246, 0.08)'
    },
    { 
        label: 'Presupuesto', 
        value: client.maxBudget > 0 ? `$${(client.maxBudget / 1000).toFixed(0)}k` : '$0', 
        color: '#f59e0b', 
        icon: <IoCashOutline />,
        bg: 'rgba(245, 158, 11, 0.08)'
    },
  ];

  return (
    <Row className="g-4 mb-4">
      {stats.map((stat, idx) => (
        <Col key={idx} xs={6} md={3} style={{ animation: `fadeInUp 0.6s var(--ease-out) ${idx * 0.1}s both` }}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '20px', transition: 'all 0.3s var(--ease-out)' }}>
            <Card.Body className="p-4 d-flex align-items-center gap-3">
              <div 
                style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    backgroundColor: stat.bg, 
                    color: stat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0
                }}
              >
                {stat.icon}
              </div>
              <div>
                <h2 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                    {stat.value}
                </h2>
                <div className="text-muted fw-semibold" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {stat.label}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProfileStats;
