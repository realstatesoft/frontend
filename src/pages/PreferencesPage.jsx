import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { IoCheckmarkCircle, IoCloseCircle, IoArrowBackOutline } from "react-icons/io5";
import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import PreferencesForm from "../components/preferences/PreferencesForm";
import { useAuth } from "../hooks/useAuth";
import { useUserPreferences } from "../hooks/useUserPreferences";

// ── Toast simple ──────────────────────────────────────────────────────────────
function Toast({ visible, message }) {
  const isError = !message?.includes("¡");
  return (
    <div className={`pref-toast${visible ? " pref-toast--visible" : ""}`} role="status">
      <span className="pref-toast__icon">
        {isError ? (
          <IoCloseCircle size={20} color="#ef4444" />
        ) : (
          <IoCheckmarkCircle size={20} color="#22c55e" />
        )}
      </span>
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PreferencesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId;

  const {
    options,
    optionsLoading,
    error,
    retryLoad,
    preferences,
    isLoading,
    savePreferences,
    isSaving,
  } = useUserPreferences(userId);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  function showToast(msg) {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }

  async function handleSubmit({ selectedOptionIds, ranges }) {
    try {
      await savePreferences({ userId, selectedOptionIds, ranges });
      showToast("¡Preferencias guardadas! Ahora te mostraremos propiedades más relevantes.");
    } catch (err) {
      showToast(err?.message ?? "Error al guardar. Intentá de nuevo.");
    }
  }

  function handleCancel() {
    navigate(-1);
  }

  return (
    <>
      <CustomNavbar />

      <div className="preferences-page">
        <Container>
          <div className="preferences-page__header">
            <div className="d-flex align-items-center gap-3 mb-1">
              <button
                type="button"
                className="preferences-page__cancel"
                onClick={handleCancel}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  padding: "4px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <IoArrowBackOutline /> Volver
              </button>
            </div>
            <h1 className="preferences-page__title">Mis preferencias</h1>
            <p className="preferences-page__subtitle">
              Seleccioná las características que más te importan para que podamos
              mostrarte propiedades más relevantes para vos.
            </p>
          </div>

          <div className="preferences-page__card">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="text-muted mt-3 mb-0" style={{ fontSize: "0.875rem" }}>
                  Cargando tus preferencias...
                </p>
              </div>
            ) : (
              <PreferencesForm
                options={options}
                optionsLoading={optionsLoading}
                error={error}
                onRetry={retryLoad}
                initialPreferences={preferences}
                onSubmit={handleSubmit}
                isSaving={isSaving}
                submitLabel="Guardar preferencias"
              />
            )}
          </div>
        </Container>
      </div>

      <Footer />

      <Toast visible={toastVisible} message={toastMsg} />
    </>
  );
}
