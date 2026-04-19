import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoHome, IoClose } from "react-icons/io5";

const DISMISS_KEY = "preferenceBannerDismissCount";
const MAX_DISMISSALS = 2;

/**
 * PreferencesBanner — banner que invita al usuario a definir sus preferencias.
 *
 * La lógica de visibilidad (¿mostrar o no?) la maneja el componente padre.
 * Este componente sólo se ocupa de su propio ciclo de vida y animación.
 *
 * @param {{ onDismiss?: () => void }} props
 */
export default function PreferencesBanner({ onDismiss }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  // Entrada animada diferida para que el CSS transition tenga efecto
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setHiding(true);
    setTimeout(() => {
      const count = Number(localStorage.getItem(DISMISS_KEY) ?? 0) + 1;
      localStorage.setItem(DISMISS_KEY, String(count));
      onDismiss?.();
    }, 350); // duración de la animación de salida
  }

  function handleDefine() {
    navigate("/preferences");
  }

  return (
    <div
      className={`pref-banner${visible ? " pref-banner--in" : ""}${hiding ? " pref-banner--out" : ""}`}
      role="alert"
      aria-live="polite"
    >
      {/* Ícono */}
      <div className="pref-banner__icon" aria-hidden="true">
        <IoHome size={26} color="var(--bs-primary)" />
      </div>

      {/* Textos */}
      <div className="pref-banner__content">
        <p className="pref-banner__title">Mejorá las propiedades que te mostramos</p>
        <p className="pref-banner__subtitle">
          Definí tus preferencias y te mostraremos resultados que se ajusten a lo que buscás.
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        className="pref-banner__cta"
        onClick={handleDefine}
        id="pref-banner-cta"
      >
        Definir preferencias
      </button>

      {/* Cerrar */}
      <button
        type="button"
        className="pref-banner__close"
        onClick={dismiss}
        aria-label="Cerrar banner"
        id="pref-banner-close"
      >
        <IoClose size={20} />
      </button>
    </div>
  );
}

/**
 * Determina si el banner debe mostrarse.
 * Centraliza la lógica para usarla en PropertiesPage.
 *
 * @param {boolean | null} preferencesCompleted
 * @param {boolean} isAuthenticated
 * @returns {boolean}
 */
export function shouldShowBanner(preferencesCompleted, isAuthenticated) {
  if (!isAuthenticated) return false;
  if (preferencesCompleted === null) return false; // Aún cargando
  if (preferencesCompleted === true) return false;
  const count = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
  return count < MAX_DISMISSALS;
}