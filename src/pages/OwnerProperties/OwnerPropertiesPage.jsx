import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import DataTable from '../../components/common/DataTable/DataTable';
import Badge from '../../components/common/Badge/Badge';
import useOwnerProperties from '../../hooks/useOwnerProperties';
import { STATUS_COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import styles from './OwnerPropertiesPage.module.scss';

const COLUMNS = [
  { key: 'title', label: 'Propiedad' },
  { key: 'type', label: 'Tipo' },
  {
    key: 'price',
    label: 'Precio',
    render: (row) => formatCurrency(row.price),
  },
  { key: 'views', label: 'Vistas' },
  { key: 'inquiries', label: 'Consultas' },
  {
    key: 'status',
    label: 'Estado',
    render: (row) => (
      <Badge variant={STATUS_COLORS[row.status] || 'default'}>
        {row.status}
      </Badge>
    ),
  },
];

export default function OwnerPropertiesPage() {
  const { data: response, isLoading } = useOwnerProperties();
  const properties = response?.data || [];

  return (
    <div className={styles.properties}>
      <div className={styles.properties__header}>
        <div>
          <h1 className={styles.properties__title}>Mis Propiedades</h1>
          <p className={styles.properties__subtitle}>
            Administra tus propiedades publicadas
          </p>
        </div>
        <div className={styles.properties__actions}>
          <Link to="/create-property" className={styles.properties__addBtn}>
            <FiPlus /> Nueva Propiedad
          </Link>
        </div>
      </div>

      <DataTable
        columns={COLUMNS}
        data={properties}
        loading={isLoading}
        searchable
        searchKeys={['title', 'type', 'address']}
      />
    </div>
  );
}
