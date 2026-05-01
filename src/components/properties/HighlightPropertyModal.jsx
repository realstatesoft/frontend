import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { StarFill, Search, GraphUpArrow } from 'react-bootstrap-icons';
import { buildPaymentUrl } from '../../services/payments/buildPaymentUrl';
import { useTranslation } from 'react-i18next';
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

const BENEFIT_ICONS = [
    { icon: <Search size={14} />, key: 'first' },
    { icon: <StarFill size={12} />, key: 'second' },
    { icon: <GraphUpArrow size={14} />, key: 'third' },
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
    const { t } = useTranslation('showProperty');
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
                <h5 className={styles.heroTitle}>{t('highlightModal.hero.title')}</h5>
                <p className={styles.heroSub}>
                    {t('highlightModal.hero.subtitle')}
                </p>
            </div>

            <div className={styles.body}>
                {/* Benefits */}
                <div className={styles.benefitsGrid}>
                    {BENEFIT_ICONS.map((b) => (
                        <div key={b.key} className={styles.benefitItem}>
                            <span className={styles.benefitIcon}>{b.icon}</span>
                            <div>
                                <strong style={{ fontSize: '0.87rem' }}>{t(`highlightModal.benefits.${b.key}.title`)}</strong>
                                <br />
                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                                    {t(`highlightModal.benefits.${b.key}.desc`)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Plan selector */}
                <div className={styles.plansRow} role="radiogroup">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`${styles.planCard} ${selectedPlanId === plan.id ? styles.planCardSelected : ''}`}
                            onClick={() => setSelectedPlanId(plan.id)}
                            role="radio"
                            aria-checked={selectedPlanId === plan.id}
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setSelectedPlanId(plan.id); } }}
                        >
                            {plan.popular && (
                                <span className={styles.popularBadge}>{t('highlightModal.plans.popular')}</span>
                            )}
                            <p className={styles.planLabel}>{t(`highlightModal.plans.${plan.id}.label`)}</p>
                            <p className={styles.planPrice}>{formatGs(plan.price)}</p>
                            <p className={styles.planPerMonth}>
                                {t('highlightModal.plans.perMonth', { amount: formatGs(plan.perMonth), days: plan.days })}
                            </p>
                            {plan.savings && (
                                <span className={styles.planSavings}>
                                    {t('highlightModal.plans.savings', { percent: plan.savings })}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <Button className={`w-100 ${styles.ctaButton}`} onClick={handleProceed}>
                    <StarFill size={15} />
                    {t('highlightModal.cta.label', { planLabel: t(`highlightModal.plans.${selectedPlan.id}.label`), price: formatGs(selectedPlan.price) })}
                </Button>
                <Button
                    variant="link"
                    className="w-100 text-muted mt-2"
                    style={{ fontSize: '0.85rem' }}
                    onClick={onHide}
                >
                    {t('highlightModal.dismiss')}
                </Button>
            </div>
        </Modal>
    );
}
