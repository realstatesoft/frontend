import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiUserPlus, FiHome, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { AGENT_ROUTES } from '../../../utils/constants';
import styles from './QuickActions.module.scss';

export default function QuickActions() {
  const { t } = useTranslation('dashboard');
  const ACTIONS = [
    { label: t('agent.quickActions.newClient'), icon: <FiUserPlus />, to: AGENT_ROUTES.REGISTER_CLIENT },
    { label: t('agent.quickActions.newProperty'), icon: <FiHome />, to: AGENT_ROUTES.CREATE_PROPERTY },
    { label: t('agent.quickActions.scheduleVisit'), icon: <FiCalendar />, to: AGENT_ROUTES.AGENDA },
    { label: t('agent.quickActions.viewOffers'), icon: <FiDollarSign />, to: AGENT_ROUTES.OFFERS },
  ];

  return (
    <div className={styles.quickActions}>
      <h3 className={styles.quickActions__title}>{t('agent.quickActions.title')}</h3>
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
