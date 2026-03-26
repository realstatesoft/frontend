import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import styles from './UpsellBanner.module.scss';

export default function UpsellBanner() {
  return (
    <div className={styles.upsell}>
      <div className={styles.upsell__icon}>
        <FiStar />
      </div>
      <h3 className={styles.upsell__title}>
        ¿Quieres vender más rápido?
      </h3>
      <p className={styles.upsell__text}>
        Conecta con un agente profesional certificado. Obtén asesoría personalizada, difusión en más portales y acompañamiento en todo el proceso de venta.
      </p>
      <ul className={styles.upsell__benefits}>
        <li>Mayor exposición de tus propiedades</li>
        <li>Asesoría legal y financiera</li>
        <li>Negociación profesional</li>
      </ul>
      <Link to="/agents" className={styles.upsell__cta}>
        Encontrar un Agente <FiArrowRight />
      </Link>
    </div>
  );
}
