import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiCalendar, FiZap } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import CustomNavbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';
import subscriptionApi from '../../services/subscriptions/subscriptionApi';
import { buildPaymentUrl } from '../../services/payments/buildPaymentUrl';
import { useAuth } from '../../hooks/useAuth';
import styles from './SubscriptionPlansPage.module.scss';

function formatPrice(price) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);

  useEffect(() => {
    subscriptionApi.getActivePlans()
      .then(res => setPlans(res?.data?.data?.content ?? []))
      .catch(() => setError(t('subscriptionsPage.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveSubscription(null);
      return;
    }
    subscriptionApi.getMyActiveSubscription()
      .then(res => setActiveSubscription(res?.data?.data ?? null))
      .catch(() => {});
  }, [isAuthenticated]);

  function handleSubscribe(plan) {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(buildPaymentUrl({
      amount: plan.price,
      type: 'SUBSCRIPTION',
      referenceId: plan.id,
      planLabel: plan.name,
      description: plan.description ?? '',
      concept: `${t('subscriptionsPage.subscribeBtn')} – ${plan.name}`,
    }));
  }

  function durationLabel(months) {
    if (months === 1) return t('subscriptionsPage.perMonth');
    if (months === 12) return t('subscriptionsPage.perYear');
    return t('subscriptionsPage.perNMonths', { count: months });
  }

  function durationFull(months) {
    if (months === 1) return t('subscriptionsPage.durationOneMonth');
    return t('subscriptionsPage.durationMonths', { count: months });
  }

  const isCurrentPlan = (plan) => activeSubscription?.plan?.id === plan.id;

  return (
    <div className={styles.page}>
      <CustomNavbar />

      <div className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>{t('subscriptionsPage.title')}</h1>
          <p className={styles.heroSubtitle}>{t('subscriptionsPage.subtitle')}</p>
        </Container>
      </div>

      <Container className={styles.content}>
        {activeSubscription && (
          <Alert variant="success" className="mb-4 d-flex align-items-center gap-2">
            <FiStar />
            <span>
              {t('subscriptionsPage.activeAlert', {
                name: activeSubscription.plan?.name,
                date: new Date(activeSubscription.expiresAt).toLocaleDateString(),
              })}
            </span>
          </Alert>
        )}

        {loading && (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && plans.length === 0 && (
          <Alert variant="info" className="text-center">
            {t('subscriptionsPage.empty')}
          </Alert>
        )}

        {!loading && !error && plans.length > 0 && (
          <Row className="justify-content-center g-4">
            {plans.map((plan) => {
              const current = isCurrentPlan(plan);
              return (
                <Col key={plan.id} xs={12} sm={6} lg={4}>
                  <Card className={`${styles.planCard} ${current ? styles.planCardActive : ''}`}>
                    {current && (
                      <div className={styles.currentBadge}>
                        <FiStar size={12} className="me-1" />
                        {t('subscriptionsPage.activePlanBtn')}
                      </div>
                    )}
                    <Card.Body className={styles.planBody}>
                      <div className={styles.planIcon}>
                        <FiZap size={24} />
                      </div>
                      <h4 className={styles.planName}>{plan.name}</h4>
                      {plan.description && (
                        <p className={styles.planDesc}>{plan.description}</p>
                      )}
                      <div className={styles.priceBlock}>
                        <span className={styles.price}>{formatPrice(plan.price)}</span>
                        <span className={styles.period}>{durationLabel(plan.durationMonths)}</span>
                      </div>
                      <div className={styles.planMeta}>
                        <FiCalendar size={14} className="me-1" />
                        {durationFull(plan.durationMonths)}
                      </div>
                      <Button
                        variant={current ? 'outline-primary' : 'primary'}
                        className={styles.subscribeBtn}
                        disabled={current}
                        onClick={() => handleSubscribe(plan)}
                      >
                        {current
                          ? t('subscriptionsPage.activePlanBtn')
                          : isAuthenticated
                          ? t('subscriptionsPage.subscribeBtn')
                          : t('subscriptionsPage.loginToSubscribeBtn')}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      <Footer />
    </div>
  );
}
