import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import DataTable from '../../components/common/DataTable/DataTable';
import Badge from '../../components/common/Badge/Badge';
import useOwnerProperties from '../../hooks/useOwnerProperties';
import { STATUS_COLORS } from '../../utils/constants';
import usePropertyPriceDisplay from '../../hooks/usePropertyPriceDisplay';
import styles from './OwnerPropertiesPage.module.scss';

export default function OwnerPropertiesPage() {
  const { t } = useTranslation('owner');
  const { data: response, isLoading } = useOwnerProperties();
  const { formatPrice } = usePropertyPriceDisplay(0);
  const properties = response?.data || [];
  const columns = [
    { key: 'title', label: 'Propiedad' },
    { key: 'type', label: 'Tipo' },
    {
      key: 'price',
      label: 'Precio',
      render: (row) => formatPrice(row.price).label || '—',
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

  return (
    <div className={styles.properties}>
      <div className={styles.properties__header}>
        <div>
          <h1 className={styles.properties__title}>{t('properties.title')}</h1>
          <p className={styles.properties__subtitle}>{t('properties.subtitle')}</p>
        </div>
        <div className={styles.properties__actions}>
          <Link to="/create-property" className={styles.properties__addBtn}>
            <FiPlus /> {t('properties.new')}
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={properties}
        loading={isLoading}
        searchable
        searchKeys={['title', 'type', 'address']}
      />
    </div>
  );
}
