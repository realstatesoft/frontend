import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CustomNavbar from "../../components/Landing/Navbar";
import TagInput from "./components/TagInput";
import PersonPlaceholder from "../../assets/person.png";
import { getAgentByIdMock, updateAgentMock } from "../../services/agents/agentMockApi";

const GENDER_OPTIONS = [
  { value: "", label: "Seleccionar" },
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "otro", label: "Otro" },
  { value: "prefiero-no-decir", label: "Prefiero no decir" },
];

const COUNTRY_OPTIONS = ["Paraguay", "Argentina", "Brasil"];

const TIMEZONE_OPTIONS = [
  "UTC -03:00",
  "UTC -04:00",
  "UTC -05:00",
  "UTC +00:00",
  "UTC +01:00",
];

const LANGUAGE_SUGGESTIONS = ["Español", "Inglés", "Portugués"];
const SPECIALTY_SUGGESTIONS = [
  "Propiedades Residenciales",
  "Inversiones",
  "Rentas",
  "Comercial",
  "Terrenos",
];

export default function AgentEdit() {
  const { id } = useParams();
  const agentId = id;

  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [photoUrl, setPhotoUrl] = useState(PersonPlaceholder);
  const [fullName, setFullName] = useState("Otto Enzler");
  const [nickName, setNickName] = useState("OE");
  const [gender, setGender] = useState("masculino");
  const [country, setCountry] = useState("Paraguay");
  const [timeZone, setTimeZone] = useState("UTC -03:00");
  const [email, setEmail] = useState("otto@build.com");
  const [languages, setLanguages] = useState(["Español", "Inglés"]);

  const [bio, setBio] = useState(
    "Agente inmobiliario con más de 5 años de experiencia en el mercado."
  );
  const [specialties, setSpecialties] = useState([
    "Propiedades Residenciales",
    "Inversiones",
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError("");
        const a = await getAgentByIdMock(agentId);
        if (cancelled) return;
        setAgent(a);

        if (!a) return;
        setPhotoUrl(a.photoUrl || PersonPlaceholder);
        setFullName(a.name || "");
        setNickName(a.nickName || "");
        setGender(a.gender || "masculino");
        setCountry(a.country || "Paraguay");
        setTimeZone(a.timeZone || "UTC -03:00");
        setEmail(a.email || "");
        setLanguages(Array.isArray(a.languages) ? a.languages : ["Español"]);
        setBio(a.bio || "Agente inmobiliario con más de 5 años de experiencia en el mercado.");
        setSpecialties(
          Array.isArray(a.specializations) && a.specializations.length > 0
            ? a.specializations
            : ["Propiedades Residenciales", "Inversiones"]
        );
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof Error ? e.message : "Ocurrió un error al cargar el agente."
        );
        setAgent(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("No se pudo leer la imagen seleccionada."));
      reader.readAsDataURL(file);
    });
  }

  async function onPickPhoto(file) {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setPhotoUrl(dataUrl || PersonPlaceholder);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Ocurrió un error al procesar la imagen."
      );
    }
  }

  const canRenderForm = useMemo(() => !isLoading && !error, [isLoading, error]);

  async function onSave() {
    try {
      setIsSaving(true);
      setError("");
      const updated = await updateAgentMock(agentId, {
        name: fullName,
        nickName,
        gender,
        country,
        timeZone,
        email,
        languages,
        bio,
        specializations: specialties,
        photoUrl,
      });
      setAgent(updated);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Ocurrió un error al guardar cambios."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-vh-100 bg-light">
      <CustomNavbar />

      <div
        style={{
          height: "86px",
          background:
            "linear-gradient(90deg, rgba(74,144,226,0.30) 0%, rgba(255,205,86,0.20) 100%)",
        }}
      />

      <main className="container pb-5" style={{ marginTop: "-52px" }}>
        <section className="bg-white rounded-4 shadow-sm p-4 p-md-5">
          {isLoading ? (
            <div className="text-muted">Cargando…</div>
          ) : error ? (
            <div className="alert alert-danger mb-4">{error}</div>
          ) : null}

          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div>
                <img
                  src={photoUrl}
                  alt="Foto de perfil"
                  className="rounded-circle"
                  style={{ width: "72px", height: "72px", objectFit: "cover" }}
                />
              </div>

              <div className="d-flex align-items-start gap-3 flex-wrap">
                <div>
                  <div className="fw-semibold">{fullName}</div>
                  <div className="text-muted small">{email}</div>
                </div>

                <label
                  className="btn btn-sm btn-light border rounded-pill"
                  style={{ padding: "6px 12px", cursor: "pointer" }}
                >
                  Cambiar
                  <input
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={(e) => onPickPhoto(e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary rounded-pill px-4"
              onClick={onSave}
              disabled={isSaving || !canRenderForm || !agent}
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>

          <hr className="my-4" />

          <div className="fw-bold mb-3">Información Personal</div>

          <div className="row g-3" style={{ opacity: canRenderForm && agent ? 1 : 0.6 }}>
            <div className="col-12 col-md-6">
              <label className="form-label small text-muted">Full Name</label>
              <input
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!agent}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small text-muted">Nick Name</label>
              <input
                className="form-control"
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                disabled={!agent}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small text-muted">Gender</label>
              <select
                className="form-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={!agent}
              >
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value || "empty"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small text-muted">Country</label>
              <select
                className="form-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={!agent}
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small text-muted">Idiomas</label>
              <TagInput
                label=""
                placeholder="Agregar idioma (ej: Español)"
                value={languages}
                onChange={setLanguages}
                suggestions={LANGUAGE_SUGGESTIONS}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small text-muted">Time Zone</label>
              <select
                className="form-select"
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                disabled={!agent}
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="my-4" />

          <div className="fw-bold mb-3">Mi correo electrónico</div>

          <div className="d-flex flex-column flex-md-row gap-3 align-items-stretch align-items-md-center">
            <div className="flex-grow-1 d-flex align-items-center">
              <input
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!agent}
              />
            </div>
            <button
              type="button"
              className="btn btn-outline-primary rounded-pill px-4"
              style={{ whiteSpace: "nowrap" }}
              disabled
            >
              + Agregar correo
            </button>
          </div>

          <hr className="my-4" />

          <div className="fw-bold mb-3">Información Profesional</div>

          <div className="mb-3">
            <label className="form-label small text-muted">
              Biografía profesional
            </label>
            <textarea
              className="form-control"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!agent}
            />
          </div>

          <div>
            <label className="form-label small text-muted">Especialidades</label>
            <TagInput
              label=""
              placeholder="Agregar especialidad (ej: Rentas)"
              value={specialties}
              onChange={setSpecialties}
              suggestions={SPECIALTY_SUGGESTIONS}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
