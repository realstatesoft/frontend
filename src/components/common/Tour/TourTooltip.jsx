import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Tour.module.scss';

const GAP = 12;

function computePosition(rect, placement, tooltipEl) {
  if (!rect || !tooltipEl) return {};
  const { top, left, width, height } = rect;
  const tw = tooltipEl.offsetWidth || 300;
  const th = tooltipEl.offsetHeight || 150;

  let candidateTop, candidateLeft;

  switch (placement) {
    case 'right':
      candidateTop = top + height / 2 - th / 2;
      candidateLeft = left + width + GAP;
      break;
    case 'left':
      candidateTop = top + height / 2 - th / 2;
      candidateLeft = left - tw - GAP;
      break;
    case 'top':
      candidateTop = top - th - GAP;
      candidateLeft = left + width / 2 - tw / 2;
      break;
    case 'bottom':
    default:
      candidateTop = top + height + GAP;
      candidateLeft = left + width / 2 - tw / 2;
      break;
  }

  const clampedLeft = Math.max(0, Math.min(candidateLeft, window.innerWidth - tw));
  const clampedTop = Math.max(0, Math.min(candidateTop, window.innerHeight - th));

  return { top: clampedTop, left: clampedLeft };
}

export default function TourTooltip({ step, stepIndex, totalSteps, targetRect, onNext, onPrev, onEnd }) {
  const { t } = useTranslation('tour');
  const tooltipRef = useRef(null);
  const [pos, setPos] = useState({});

  useEffect(() => {
    if (!targetRect || !tooltipRef.current) return;
    setPos(computePosition(targetRect, step.placement, tooltipRef.current));
  }, [targetRect, step.placement]);

  const isCenter = !targetRect || step.placement === 'center';
  const tooltipClass = [
    styles.tooltip,
    isCenter && styles['tooltip--center'],
  ].filter(Boolean).join(' ');

  const style = isCenter ? {} : { top: pos.top, left: pos.left, position: 'fixed' };
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <div ref={tooltipRef} className={tooltipClass} style={style} role="dialog" aria-label={step.title}>
      <p className={styles.tooltip__title}>{step.title}</p>
      <p className={styles.tooltip__content}>{step.content}</p>
      <div className={styles.tooltip__footer}>
        <span className={styles.tooltip__progress}>
          {stepIndex + 1} / {totalSteps}
        </span>
        <div className={styles.tooltip__actions}>
          <button className={`${styles.btn} ${styles['btn--skip']}`} onClick={onEnd}>
            {t('skip')}
          </button>
          {!isFirst && (
            <button className={`${styles.btn} ${styles['btn--prev']}`} onClick={onPrev}>
              {t('previous')}
            </button>
          )}
          <button className={`${styles.btn} ${styles['btn--next']}`} onClick={onNext}>
            {isLast ? t('finish') : t('next')}
          </button>
        </div>
      </div>
    </div>
  );
}
