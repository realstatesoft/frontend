import { useState, useMemo } from 'react';
import DataTable from '../../components/common/DataTable/DataTable';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import useAgentProperties from '../../hooks/useAgentProperties';
import { STATUS_COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import styles from './AgentPropertiesPage.module.scss';

const COLUMNS = [
  { key: 'title', label: 'Propiedad' },
  { key: 'type', label: 'Tipo', render: (v) => v?.charAt(0).toUpperCase() + v?.slice(1) },
  { key: 'price', label: 'Precio', render: (v) => formatCurrency(v) },
  { key: 'location', label: 'Ubicación' },
  {
    key: 'status',
    label: 'Estado',
    render: (value) => (
      <Badge variant={STATUS_COLORS[value] || 'neutral'}>
        {value?.charAt(0).toUpperCase() + value?.slice(1)}
      </Badge>
    ),
  },
];

const TYPE_OPTIONS = [
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'oficina', label: 'Oficina' },
];

const STATUS_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'inactivo', label: 'Inactivo' },
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
          p.location?.toLowerCase().includes(q)
      );
    }
    if (typeFilter) {
      result = result.filter((p) => p.type === typeFilter);
    }
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [properties, search, typeFilter, statusFilter]);

  const handleFilter = (key, value) => {
    if (key === 'type') setTypeFilter(value);
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
            { key: 'type', label: 'Tipo', value: typeFilter, options: TYPE_OPTIONS },
            { key: 'status', label: 'Estado', value: statusFilter, options: STATUS_OPTIONS },
          ]}
          onFilter={handleFilter}
          emptyMessage="No se encontraron propiedades"
        />
      </div>
    </div>
  );
}
