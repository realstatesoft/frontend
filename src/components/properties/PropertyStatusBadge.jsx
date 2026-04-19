import React from 'react';
import { Badge } from 'react-bootstrap';

const getStatusColor = (statusValue) => {
  switch (statusValue) {
    case 'PENDING': return 'warning';
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'danger';
    case 'PUBLISHED': return 'info';
    case 'SOLD': return 'secondary';
    case 'RENTED': return 'secondary';
    case 'ARCHIVED': return 'dark';
    default: return 'primary';
  }
};

const PropertyStatusBadge = ({ status, statusLabels }) => {
  const value = typeof status === 'object' ? status.value : status;
  const label = typeof status === 'object' ? status.label : (statusLabels?.[status] ?? status);
  const color = getStatusColor(value);

  return (
    <Badge bg={color} className="property-status-badge px-3 py-2" style={{ fontSize: '0.85rem' }}>
      {label}
    </Badge>
  );
};

export default PropertyStatusBadge;
