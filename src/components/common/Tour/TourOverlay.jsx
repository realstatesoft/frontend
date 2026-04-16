import { createPortal } from 'react-dom';
import { useState, useEffect, useRef } from 'react';
import useTourStore from '../../../store/useTourStore';
import TourTooltip from './TourTooltip';
import styles from './Tour.module.scss';

const HIGHLIGHT_PAD = 6;

function getTargetRect(selector) {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - HIGHLIGHT_PAD,
    left: r.left - HIGHLIGHT_PAD,
    width: r.width + HIGHLIGHT_PAD * 2,
    height: r.height + HIGHLIGHT_PAD * 2,
  };
}

export default function TourOverlay() {
  const { isActive, steps, currentStep, nextStep, prevStep, endTour } = useTourStore();
  const [targetRect, setTargetRect] = useState(null);
  const timeoutRef = useRef(null);

  const step = isActive && steps.length > 0 ? steps[currentStep] : null;

  useEffect(() => {
    if (!step) {
      setTargetRect(null);
      return;
    }
    setTargetRect(getTargetRect(step.target));

    const handleUpdate = () => {
      if (step) {
        setTargetRect(getTargetRect(step.target));
      }
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(handleUpdate, 100);
    };

    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('scroll', debouncedUpdate, true);
    window.addEventListener('orientationchange', debouncedUpdate);

    return () => {
      clearTimeout(timeoutRef.current);
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('scroll', debouncedUpdate, true);
      window.removeEventListener('orientationchange', debouncedUpdate);
    };
  }, [step]);

  if (!step) return null;

  const hasTarget = Boolean(targetRect);

  return createPortal(
    <div className={styles.overlay}>
      <div
        className={hasTarget ? styles['backdrop--transparent'] : styles.backdrop}
        onClick={endTour}
      />

      {hasTarget && (
        <div
          className={styles.highlight}
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      <TourTooltip
        step={step}
        stepIndex={currentStep}
        totalSteps={steps.length}
        targetRect={targetRect}
        onNext={nextStep}
        onPrev={prevStep}
        onEnd={endTour}
      />
    </div>,
    document.body
  );
}