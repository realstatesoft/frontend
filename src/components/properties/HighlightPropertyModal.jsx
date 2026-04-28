import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { StarFill, Search, GraphUpArrow, Eye, GeoAlt } from 'react-bootstrap-icons';
import { buildPaymentUrl } from '../../services/payments/buildPaymentUrl';
import styles from './HighlightPropertyModal.module.scss';

// TO-DO: configurar precios y planes desde la config del admin
const PLANS = [
    {
        id: 'monthly',
        label: 'Mensual',
        days: 30,
        price: 150_000,
        perMonth: 150_000,
        savings: null,
        popular: false,
    },
    {
        id: 'semester',
        label: 'Semestral',
        days: 180,
        price: 720_000,
        perMonth: 120_000,
        savings: 20,
        popular: true,
    },
    {
        id: 'annual',
        label: 'Anual',
        days: 365,
        price: 1_200_000,
        perMonth: 100_000,
        savings: 33,
        popular: false,
    },
];

const BENEFITS = [
    {
        icon: <Search size={14} />,
        title: 'Primero en búsquedas',
        desc: 'Tu propiedad aparece antes que las demás en los resultados.',
    },
    {
        icon: <StarFill size={12} />,
        title: 'Badge dorado "Destacada"',
        desc: 'Un sello visible que genera más confianza en los compradores.',
    },
    {
        icon: <GraphUpArrow size={14} />,
        title: '3× más visitas',
        desc: 'Las propiedades destacadas reciben en promedio 3 veces más consultas.',
    },
];

function formatGs(amount) {
    return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: 'PYG',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function HighlightPropertyModal({ property, show, onHide }) {
    const navigate = useNavigate();
    const [selectedPlanId, setSelectedPlanId] = useState('semester');

    const selectedPlan = PLANS.find((p) => p.id === selectedPlanId);

    function handleProceed() {
        onHide();
        navigate(buildPaymentUrl({
            amount: selectedPlan.price,
            description: property?.title ?? '',
            type: 'PROPERTY_HIGHLIGHT',
            referenceId: property?.id,
            planLabel: selectedPlan.label,
            planDays: selectedPlan.days,
        }));
    }

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <div className={styles.hero}>
                <div className={styles.starRing}>
                    <StarFill />
                </div>
                <h5 className={styles.heroTitle}>Destacá tu propiedad</h5>
                <p className={styles.heroSub}>
                    Llegá a más compradores y alquilantes potenciales
                </p>
            </div>

            <div className={styles.body}>
                {/* Benefits */}
                <div className={styles.benefitsGrid}>
                    {BENEFITS.map((b) => (
                        <div key={b.title} className={styles.benefitItem}>
                            <span className={styles.benefitIcon}>{b.icon}</span>
                            <div>
                                <strong style={{ fontSize: '0.87rem' }}>{b.title}</strong>
                                <br />
                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                                    {b.desc}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Plan selector */}
                <div className={styles.plansRow}>
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`${styles.planCard} ${selectedPlanId === plan.id ? styles.planCardSelected : ''}`}
                            onClick={() => setSelectedPlanId(plan.id)}
                            role="radio"
                            aria-checked={selectedPlanId === plan.id}
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedPlanId(plan.id)}
                        >
                            {plan.popular && (
                                <span className={styles.popularBadge}>⭐ Más popular</span>
                            )}
                            <p className={styles.planLabel}>{plan.label}</p>
                            <p className={styles.planPrice}>{formatGs(plan.price)}</p>
                            <p className={styles.planPerMonth}>
                                {formatGs(plan.perMonth)} / mes · {plan.days} días
                            </p>
                            {plan.savings && (
                                <span className={styles.planSavings}>
                                    Ahorrás {plan.savings}%
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <Button className={`w-100 ${styles.ctaButton}`} onClick={handleProceed}>
                    <StarFill size={15} />
                    Destacar – {selectedPlan.label} por {formatGs(selectedPlan.price)}
                </Button>
                <Button
                    variant="link"
                    className="w-100 text-muted mt-2"
                    style={{ fontSize: '0.85rem' }}
                    onClick={onHide}
                >
                    Ahora no
                </Button>
            </div>
        </Modal>
    );
}
