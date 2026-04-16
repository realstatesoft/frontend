import { useState, useMemo } from 'react';
import DataTable from '../../components/common/DataTable/DataTable';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import useAgentProperties from '../../hooks/useAgentProperties';
import { formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import styles from './AgentPropertiesPage.module.scss';

const PROPERTY_TYPE_LABELS = {
  HOUSE: 'Casa',
  APARTMENT: 'Departamento',
  LAND: 'Terreno',
  OFFICE: 'Oficina',
  WAREHOUSE: 'Depósito',
  FARM: 'Granja',
};

const PROPERTY_STATUS_LABELS = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  PUBLISHED: 'Publicado',
  SOLD: 'Vendido',
  RENTED: 'Alquilado',
  ARCHIVED: 'Archivado',
};

const PROPERTY_STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  PUBLISHED: 'info',
  SOLD: 'accent',
  RENTED: 'accent',
  ARCHIVED: 'neutral',
};

const COLUMNS = [
  { key: 'title', label: 'Propiedad' },
  { key: 'propertyType', label: 'Tipo', render: (v) => PROPERTY_TYPE_LABELS[v] || v },
  { key: 'price', label: 'Precio', render: (v) => formatCurrency(v) },
  { key: 'locationName', label: 'Ubicación' },
  {
    key: 'status',
    label: 'Estado',
    render: (value) => (
      <Badge variant={PROPERTY_STATUS_COLORS[value] || 'neutral'}>
        {PROPERTY_STATUS_LABELS[value] || value}
      </Badge>
    ),
  },
];

const TYPE_OPTIONS = [
  { value: 'HOUSE', label: 'Casa' },
  { value: 'APARTMENT', label: 'Departamento' },
  { value: 'LAND', label: 'Terreno' },
  { value: 'OFFICE', label: 'Oficina' },
  { value: 'WAREHOUSE', label: 'Depósito' },
  { value: 'FARM', label: 'Granja' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'PUBLISHED', label: 'Publicado' },
  { value: 'SOLD', label: 'Vendido' },
  { value: 'RENTED', label: 'Alquilado' },
  { value: 'ARCHIVED', label: 'Archivado' },
];

export default function AgentPropertiesPage() {
  const { data: response, isLoading } = useAgentProperties();
  const properties = response?.data || [];
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredData = useMemo(() => {
    let result = properties;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.locationName?.toLowerCase().includes(q)
      );
    }
    if (typeFilter) {
      result = result.filter((p) => p.propertyType === typeFilter);
    }
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [properties, search, typeFilter, statusFilter]);

  const handleFilter = (key, value) => {
    if (key === 'propertyType') setTypeFilter(value);
    if (key === 'status') setStatusFilter(value);
  };

  return (
    <div className={styles.page}>
      <div className={styles.page__header}>
        <div>
          <h1 className={styles.page__title}>Propiedades</h1>
          <p className={styles.page__subtitle}>Administra tu inventario de propiedades</p>
        </div>
        <Link to="/create-property">
          <Button variant="primary" size="sm">
            <FiHome /> Nueva Propiedad
          </Button>
        </Link>
      </div>

      <div className={styles.page__card}>
        <DataTable
          columns={COLUMNS}
          data={filteredData}
          loading={isLoading}
          onSearch={setSearch}
          filters={[
            { key: 'propertyType', label: 'Tipo', value: typeFilter, options: TYPE_OPTIONS },
            { key: 'status', label: 'Estado', value: statusFilter, options: STATUS_OPTIONS },
          ]}
          onFilter={handleFilter}
          emptyMessage="No se encontraron propiedades"
        />
      </div>
    </div>
  );
}
