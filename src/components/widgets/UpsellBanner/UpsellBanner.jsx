import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import styles from './UpsellBanner.module.scss';

export default function UpsellBanner() {
  const { t } = useTranslation('agents');
  return (
    <div className={styles.upsell}>
      <div className={styles.upsell__icon}>
        <FiStar />
      </div>
      <h3 className={styles.upsell__title}>{t('upsell.title')}</h3>
      <p className={styles.upsell__text}>{t('upsell.description')}</p>
      <ul className={styles.upsell__benefits}>
        <li>{t('upsell.benefits.exposure')}</li>
        <li>{t('upsell.benefits.legal')}</li>
        <li>{t('upsell.benefits.negotiation')}</li>
      </ul>
      <Link to="/agents" className={styles.upsell__cta}>
        {t('upsell.cta')} <FiArrowRight />
      </Link>
    </div>
  );
}
