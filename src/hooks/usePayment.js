import { useState } from 'react';
import paymentApi from '../services/payments/paymentApi';

function luhnCheck(num) {
  const digits = num.replace(/\D/g, '').split('').reverse();
  let sum = 0;
  digits.forEach((d, i) => {
    let n = parseInt(d, 10);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  });
  return sum % 10 === 0;
}

function validateFields({ cardholderName, cardNumber, expiry, cvv }) {
  const errors = {};

  if (!cardholderName.trim()) {
    errors.cardholderName = 'El nombre del titular es requerido.';
  }

  const rawCard = cardNumber.replace(/\s/g, '');
  if (!rawCard || rawCard.length < 13 || rawCard.length > 16) {
    errors.cardNumber = 'Número de tarjeta inválido.';
  } else if (!luhnCheck(rawCard)) {
    errors.cardNumber = 'Número de tarjeta inválido.';
  }

  const expiryMatch = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!expiryMatch) {
    errors.expiry = 'Formato inválido. Use MM/AA.';
  } else {
    const [, mm, yy] = expiryMatch;
    const month = parseInt(mm, 10);
    const year = 2000 + parseInt(yy, 10);
    const now = new Date();
    if (month < 1 || month > 12) {
      errors.expiry = 'Mes inválido.';
    } else if (
      year < now.getFullYear() ||
      (year === now.getFullYear() && month < now.getMonth() + 1)
    ) {
      errors.expiry = 'La tarjeta está vencida.';
    }
  }

  if (!cvv || cvv.length < 3) {
    errors.cvv = 'CVV inválido.';
  }

  return errors;
}

/*
type = RESERVATION, CONTRACT, PROPERTY_HIGHLIGHT, SUBSCRIPTION
*/
export default function usePayment({ amount, concept, type, description } = {}) {
  const [status, setStatus] = useState('idle'); // idle | processing | success | error
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  function setField(field) {
    return (e) => {
      let value = e.target.value;

      if (field === 'cardNumber') {
        value = value.replace(/\D/g, '').slice(0, 16);
        value = value.replace(/(.{4})/g, '$1 ').trim();
      }
      if (field === 'expiry') {
        value = value.replace(/\D/g, '').slice(0, 4);
        if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
      }
      if (field === 'cvv') {
        value = value.replace(/\D/g, '').slice(0, 4);
      }

      setForm((prev) => ({ ...prev, [field]: value }));
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function processPayment() {
    const errors = validateFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    setStatus('processing');
    setFieldErrors({});

    try {
      await paymentApi.createPayment({
        type,
        amount: parseFloat(amount) || 0,
        concept: concept ?? '',
        description: description ?? '',
      });

      setStatus('success');
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.error ??
        'Error al procesar el pago. Intenta nuevamente.';
      setStatus('error');
      setErrorMessage(msg);
      return false;
    }
  }

  function reset() {
    setStatus('idle');
    setFieldErrors({});
    setErrorMessage('');
    setForm({ cardholderName: '', cardNumber: '', expiry: '', cvv: '' });
  }

  return { form, setField, fieldErrors, status, errorMessage, processPayment, reset };
}
