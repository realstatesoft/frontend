import { useState, useMemo } from 'react';
import DataTable from '../../components/common/DataTable/DataTable';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import useAgentClients from '../../hooks/useAgentClients';
import { STATUS_COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { FiUserPlus, FiEye } from 'react-icons/fi';
import styles from './ClientsPage.module.scss';

const COLUMNS = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Teléfono' },
  {
    key: 'status',
    label: 'Estado',
    render: (value) => (
      <Badge variant={STATUS_COLORS[value] || 'neutral'}>
        {value?.charAt(0).toUpperCase() + value?.slice(1)}
      </Badge>
    ),
  },
  {
    key: 'registeredAt',
    label: 'Registro',
    render: (value) => formatDate(value),
  },
  {
    key: 'id',
    label: '',
    render: (_, row) => (
      <Link to={`/clients/${row.id}`} className="btn btn-sm btn-outline-primary">
        <FiEye className="me-1" /> Ver Cliente
      </Link>
    ),
  },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE', label: 'Inactivo' },
];

const INTERNAL_TYPE_OPTIONS = [
  { value: 'AGENT', label: 'Interno' },
  { value: 'EXTERNAL', label: 'Externo' },
];

export default function ClientsPage() {
  const { data: response, isLoading } = useAgentClients();
  const clients = response?.data || [];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [internalTypeFilter, setInternalTypeFilter] = useState('');

  const filteredData = useMemo(() => {
    let result = clients;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (internalTypeFilter) {
      result = result.filter((c) => c.internalType === internalTypeFilter);
    }
    return result;
  }, [clients, search, statusFilter, internalTypeFilter]);

  const handleFilter = (key, value) => {
    if (key === 'status') setStatusFilter(value);
    if (key === 'internalType') setInternalTypeFilter(value);
  };

  return (
    <div className={styles.page}>
      <div className={styles.page__header}>
        <div>
          <h1 className={styles.page__title}>Clientes</h1>
          <p className={styles.page__subtitle}>Gestiona tu cartera de clientes</p>
        </div>
        <Link to="/clients/register">
          <Button variant="primary" size="sm">
            <FiUserPlus /> Nuevo Cliente
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
            { key: 'status', label: 'Estado', value: statusFilter, options: STATUS_OPTIONS },
            { key: 'internalType', label: 'Origen', value: internalTypeFilter, options: INTERNAL_TYPE_OPTIONS },
          ]}
          onFilter={handleFilter}
          emptyMessage="No se encontraron clientes"
        />
      </div>
    </div>
  );
}
