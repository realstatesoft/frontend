/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Spinner, Alert } from "react-bootstrap";
import { ArrowLeft, CheckLg } from "react-bootstrap-icons";
import { FiMessageSquare } from "react-icons/fi";
import Swal from "sweetalert2";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import agentApi from "../../services/agents/agentApi";
import { useTranslation } from "react-i18next";
import NewConversationModal from "../../components/messages/NewConversationModal";
import ReviewForm from "../../components/Agents/ReviewForm";
import agentReviewsService from "../../services/agents/agentReviewsService";
import { useAuth } from "../../hooks/useAuth";
import "./AgentProfilePage.scss";

// No external avatar URL — missing avatars fall back to rendered initials.

export default function PublicAgentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("agents");
  const { isAuthenticated, user } = useAuth();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [myReview, setMyReview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    agentApi
      .getAgentById(id)
      .then((res) => {
        if (!cancelled) {
          const payload = res?.data ?? res;
          const agentData = payload?.data ?? payload;
          setAgent(agentData);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setError(t("profile.loadError"));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Carga la reseña propia del usuario para este agente (si existe)
  useEffect(() => {
    if (!isAuthenticated || !id) return;
    agentReviewsService
      .getMyReview(id)
      .then((res) => {
        const data = res?.data?.data ?? res?.data ?? null;
        setMyReview(data);
      })
      .catch(() => setMyReview(null));
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <>
        <CustomNavbar />
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    );
  }

  if (error || !agent) {
    return (
      <>
        <CustomNavbar />
        <Container className="py-5 bg-light min-vh-100">
          <Alert variant="warning">{error || t("profile.notFound")}</Alert>
        </Container>
      </>
    );
  }

  const name = agent.userName || t("contactCard.agent");
  const email = agent.userEmail || t("profile.notRegistered");
  const phone = agent.userPhone || t("profile.notSpecified");
  const avatarUrl = agent.userAvatarUrl || null;
  const companyName = agent.companyName || t("profile.notSpecified");
  const licenseNumber = agent.licenseNumber || t("profile.notSpecified");
  const experienceYears = agent.experienceYears || 0;
  const bio = agent.bio || t("profile.noBio");

  // Normalise specialties: the API may return [{id,name}] objects or plain strings.
  const rawSpecialties = agent.specialties && agent.specialties.length > 0 ? agent.specialties : [];
  const specialties = rawSpecialties
    .map((s, idx) => {
      if (typeof s === "string") return { id: `spec-${idx}-${s}`, name: s };
      return { id: s.id ?? `spec-${idx}`, name: s.name ?? "" };
    })
    .filter((s) => Boolean(s.name));
  const stats = agent.stats;

  const rating = agent.avgRating;
  const reviewsCount = agent.totalReviews;
  const hasRating = rating != null;

  return (
    <>
      <CustomNavbar />
      <div className="agent-profile-page-new">
        <div className="profile-header-banner" style={{ position: "relative" }}>
          <button
            className="btn d-flex align-items-center gap-1"
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: "1rem",
              left: "1.5rem",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(4px)",
              border: "none",
              borderRadius: "20px",
              padding: "0.4rem 1rem",
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "#333",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <ArrowLeft size={15} /> {t("profile.back")}
          </button>
        </div>

        <Container className="profile-main-container">
          {/* Top Header */}
          <div className="profile-top-section d-flex justify-content-between align-items-end flex-wrap gap-3">
            <div className="d-flex align-items-center gap-4">
              <div className="avatar-wrapper">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="profile-avatar" />
                ) : (
                  <div
                    className="profile-avatar d-flex align-items-center justify-content-center bg-secondary text-white fw-bold"
                    style={{ fontSize: "2rem", userSelect: "none" }}
                    aria-label={name}
                  >
                    {name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                )}
              </div>
              <div className="profile-names-wrapper pb-2">
                <h2 className="mb-1 profile-name">{name}</h2>
                <div className="d-flex flex-wrap gap-3 mt-1">
                  <span className="text-muted profile-email">{email}</span>
                  {hasRating && (
                    <span className="text-muted text-warning fw-medium">
                      ★ {rating} ({t("profile.reviews", { count: reviewsCount })})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="pb-2 d-flex gap-2">
              <button
                className="btn btn-primary px-4 py-2"
                style={{ borderRadius: "8px", fontWeight: 600 }}
                onClick={() => {
                  const fromWizard = !!sessionStorage.getItem("wizardReturnStep");
                  if (fromWizard) {
                    sessionStorage.setItem(
                      "selectedAgentFromSearch",
                      JSON.stringify({
                        id: agent.id ?? parseInt(id),
                        name,
                        avatarUrl,
                      })
                    );
                    navigate("/sell");
                  } else {
                    alert(`Agente seleccionado: ${name}`);
                  }
                }}
              >
                <CheckLg className="me-1" /> {t("profile.select")}
              </button>
              {isAuthenticated && (
                <button
                  className="btn btn-outline-primary px-4 py-2"
                  style={{ borderRadius: "8px", fontWeight: 600 }}
                  onClick={() => setShowMessageModal(true)}
                >
                  <FiMessageSquare className="me-1" /> {t("message")}
                </button>
              )}
              {isAuthenticated && user?.agentProfileId !== agent?.id && (
                <button
                  className="btn btn-outline-warning px-4 py-2"
                  style={{ borderRadius: "8px", fontWeight: 600 }}
                  onClick={() => setShowReviewModal(true)}
                >
                  ★ {myReview ? t("review.buttonEdit") : t("review.buttonLeave")}
                </button>
              )}
            </div>
          </div>

          <div className="profile-content mt-4">
            {/* General Info */}
            <div className="profile-section">
              <h4 className="section-title">{t("profile.generalInfo")}</h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("profile.fullName")}</label>
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={name}
                    readOnly
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("profile.phone")}</label>
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={phone}
                    readOnly
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("profile.company")}</label>
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={companyName}
                    readOnly
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("profile.experience")}</label>
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={
                      experienceYears +
                      (experienceYears === 1 ? " " + t("profile.year") : " " + t("profile.years_plural"))
                    }
                    readOnly
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("profile.licenseNumber")}</label>
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={licenseNumber}
                    readOnly
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("profile.email")}</label>
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={email}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="profile-section">
              <h4 className="section-title">{t("profile.professionalInfo")}</h4>

              <div className="mb-4">
                <label className="form-label">{t("profile.bio")}</label>
                <textarea
                  className="form-control profile-textarea"
                  rows="5"
                  value={bio}
                  readOnly
                />
              </div>

              <div className="mb-4">
                <label className="form-label">{t("profile.specialties")}</label>
                <div className="d-flex flex-wrap gap-2">
                  {specialties.length > 0 ? (
                    specialties.map((s) => {
                      const displayName =
                        s.name.charAt(0).toUpperCase() + s.name.slice(1).toLowerCase();
                      return (
                        <span key={s.id} className="custom-badge badge-blue">
                          {displayName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-muted fst-italic">
                      {t("profile.noSpecialties")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="profile-section pb-5">
                <h4 className="section-title">{t("profile.stats")}</h4>
                <div className="agent-stats">
                  <div className="stat-card stat-blue">
                    <span className="stat-value">{stats.vendidas}</span>
                    <span className="stat-label">{t("profile.statsVendidas")}</span>
                  </div>
                  <div className="stat-card stat-green">
                    <span className="stat-value">{stats.alquiladas}</span>
                    <span className="stat-label">{t("profile.statsAlquiladas")}</span>
                  </div>
                  <div className="stat-card stat-purple">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">{t("profile.statsTotal")}</span>
                  </div>
                  <div className="stat-card stat-orange">
                    <span className="stat-value">{stats.precioPromedio}</span>
                    <span className="stat-label">{t("profile.statsAveragePrice")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>

      <NewConversationModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        preSelectedAgent={{
          id: agent?.userId || agent?.id || parseInt(id),
          name: name,
          email: email,
        }}
        onSuccess={() => {
          setShowMessageModal(false);
          Swal.fire({
            icon: "success",
            title: t("contactCard.messageSuccessTitle"),
            text: t("contactCard.messageSuccessText"),
            timer: 2000,
            showConfirmButton: false,
          });
        }}
      />
      <ReviewForm
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        agentId={agent?.id ?? parseInt(id)}
        agentName={name}
        existingReview={myReview}
        agentProperties={[]}
      />
      <Footer />
    </>
  );
}
