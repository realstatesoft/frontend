import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHome, FiEye, FiMessageSquare, FiDollarSign } from 'react-icons/fi';
import { OWNER_ROUTES } from '../../../utils/constants';
import styles from './OwnerQuickActions.module.scss';

export default function OwnerQuickActions() {
  const { t } = useTranslation('dashboard');
  const ACTIONS = [
    { label: t('owner.quickActions.newProperty'), icon: <FiHome />, to: '/create-property' },
    { label: t('owner.quickActions.viewVisits'), icon: <FiEye />, to: OWNER_ROUTES.VISITS },
    { label: t('owner.quickActions.messages'), icon: <FiMessageSquare />, to: OWNER_ROUTES.MESSAGES },
    { label: t('owner.quickActions.viewOffers'), icon: <FiDollarSign />, to: OWNER_ROUTES.OFFERS },
  ];

  return (
    <div className={styles.quickActions}>
      <h3 className={styles.quickActions__title}>{t('owner.quickActions.title')}</h3>
      <div className={styles.quickActions__grid}>
        {ACTIONS.map((action) => (
          <Link key={action.label} to={action.to} className={styles.quickActions__btn}>
            <span className={styles.quickActions__btnIcon}>{action.icon}</span>
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
