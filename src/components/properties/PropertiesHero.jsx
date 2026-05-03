import { useState, useEffect } from "react";
import { Container, Collapse, Row, Col, Form, Dropdown } from "react-bootstrap";
import { PROPERTY_TYPE_OPTIONS, AVAILABILITY_OPTIONS } from "../../constants/propertyEnums";
import SaveSearchModal from "./SaveSearchModal";
import { searchPreferencesApi } from "../../services/search/searchPreferencesApi";
import { useTranslation } from "react-i18next";

/**
 * PropertiesHero — barra de filtros estilo pill (inspirada en Zillow).
 *
 * Filtros básicos en la barra: Tipo · Precio · Dormitorios · Más (avanzados)
 * Panel avanzado: disponibilidad, precio min/max, dormitorios mín., baños mín.
 */
import { useAuth } from "../../hooks/useAuth";

export default function PropertiesHero({
    search,
    typeFilter,
    availability,
    minPrice,
    maxPrice,
    minBedrooms,
    minBathrooms,
    totalResults,
    onSearch,
    onTypeChange,
    onSaleRentChange,
    onAvailabilityChange,
    onMinPriceChange,
    onMaxPriceChange,
    onMinBedroomsChange,
    onMinBathroomsChange,
    onClear,
}) {
    const { t } = useTranslation("properties");
    const { isAuthenticated } = useAuth();

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [savedSearches, setSavedSearches] = useState([]);

    const fetchSavedSearches = async () => {
        try {
            const res = await searchPreferencesApi.getMine();
            const items = res?.data?.content || [];
            setSavedSearches(items);
        } catch (err) {
            console.error("Error loading saved searches:", err);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchSavedSearches();
        } else {
            setSavedSearches([]);
        }
    }, [isAuthenticated]);

    const handleDeleteSearch = async (id, evt) => {
        evt.stopPropagation();
        try {
            await searchPreferencesApi.delete(id);
            fetchSavedSearches();
        } catch (err) {
            console.error("Error deleting search:", err);
        }
    };

    const filters = {
        q: search,
        propertyType: typeFilter,
        availability,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        minBedrooms: minBedrooms || null,
        minBathrooms: minBathrooms || null,
    };

    const handleSaveSuccess = () => {
        console.log("Búsqueda guardada");
        fetchSavedSearches();
    };

    const advancedActiveCount = [availability, minPrice, maxPrice, minBedrooms, minBathrooms].filter(Boolean).length;
    const hasAnyFilter = !!(search || typeFilter || advancedActiveCount);

    return (
        <div className="bg-light py-4" style={{ overflow: "visible" }}>
            <Container>
                <div className="filter-bar">

                    {/* Búsqueda */}
                    <div className="filter-bar__search">
                        <span className="filter-bar__search-icon"></span>
                        <input
                            type="text"
                            placeholder={t("search.placeholder")}
                            value={search}
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </div>

                    {/* Mis búsquedas */}
                    <Dropdown>
                        <Dropdown.Toggle className="filter-pill">
                            Mis búsquedas
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Header>Mis búsquedas guardadas</Dropdown.Header>

                            {savedSearches.map((s) => (
                                <Dropdown.Item
                                    key={s.id}
                                    as="div"
                                    className="d-flex justify-content-between"
                                    onClick={() => {
                                        const f = s.filters || {};
                                        onSearch(f.q ?? "");
                                        onTypeChange(f.propertyType ?? "");
                                        onAvailabilityChange(f.availability ?? "");
                                        onMinPriceChange(f.minPrice ?? "");
                                        onMaxPriceChange(f.maxPrice ?? "");
                                        onMinBedroomsChange(f.minBedrooms ?? "");
                                        onMinBathroomsChange(f.minBathrooms ?? "");
                                    }}
                                >
                                    <span>{s.name}</span>
                                    <button
                                        className="filter-bar__delete-search"
                                        title={t("savedSearches.delete")}
                                        aria-label={t("savedSearches.deleteLabel", { name: s.name })}
                                        onClick={(evt) => handleDeleteSearch(s.id, evt)}
                                        type="button"
                                    >
                                        ×
                                    </button>
                                </Dropdown.Item>
                            ))}

                            {savedSearches.length === 0 && (
                                <Dropdown.Item disabled>
                                    Sin búsquedas guardadas
                                </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Pill: Tipo */}
                    <PillSelect
                        label={t("search.type")}
                        value={typeFilter}
                        onChange={onTypeChange}
                        active={!!typeFilter}
                    >
                        <option value="">{t("search.all")}</option>
                        {PROPERTY_TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </PillSelect>

                    <div className="filter-bar__divider" />

                    {/* Pill: Dormitorios */}
                    <PillSelect
                        label={t("search.bedrooms")}
                        value={minBedrooms}
                        onChange={onMinBedroomsChange}
                        active={!!minBedrooms}
                    >
                        <option value="">{t("search.any")}</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <option key={`bed-${n}`} value={n}>{n}+</option>
                        ))}
                    </PillSelect>

                    <div className="filter-bar__divider" />

                    {/* Más filtros */}
                    <button
                        className={`filter-pill${showAdvanced || advancedActiveCount > 0 ? " filter-pill--active" : ""}`}
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        type="button"
                    >
                        {t("search.moreFilters")}
                        {advancedActiveCount > 0
                            ? <span className="filter-pill__badge">{advancedActiveCount}</span>
                            : <span className={`filter-pill__chevron${showAdvanced ? " filter-pill__chevron--open" : ""}`} />
                        }
                    </button>

                    {/* Limpiar — solo aparece cuando hay algo activo */}
                    {hasAnyFilter && (
                        <>
                            <div className="filter-bar__divider" />
                            <button className="filter-bar__clear" onClick={onClear} title={t("search.clearFilters")} type="button">
                                ✕
                            </button>
                            <div className="filter-bar__divider" />
                            <button className="filter-bar__save" onClick={() => setShowSaveModal(true)} title={t("actions.saveTooltip")} type="button">
                                {t("actions.save")}
                            </button>
                        </>
                    )}
                </div>

                {/* ── Panel de filtros avanzados ─────────────────────────── */}
                <Collapse in={showAdvanced}>
                    <div>
                        <Row className="g-3 mt-3">
                            <Col md={3}>
                                <span className="filter-bar__panel-label">{t("search.availability")}</span>
                                <Form.Select
                                    value={availability}
                                    onChange={(e) => onAvailabilityChange(e.target.value)}
                                    size="sm"
                                >
                                    <option value="">{t("search.any")}</option>
                                    {AVAILABILITY_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>

                                <Col md={2}>
                                    <span className="filter-bar__panel-label">{t("search.minPrice")}</span>
                                    <Form.Control
                                        type="number" size="sm" placeholder="0" min={0}
                                        value={minPrice}
                                        onChange={(e) => onMinPriceChange(e.target.value)}
                                    />
                                </Col>

                                <Col md={2}>
                                    <span className="filter-bar__panel-label">{t("search.maxPrice")}</span>
                                    <Form.Control
                                        type="number" size="sm" placeholder={t("search.noLimit")} min={0}
                                        value={maxPrice}
                                        onChange={(e) => onMaxPriceChange(e.target.value)}
                                    />
                                </Col>

                            <Col md={2}>
                                <span className="filter-bar__panel-label">{t("search.minBathrooms")}</span>
                                <Form.Select
                                    value={minBathrooms}
                                    onChange={(e) => onMinBathroomsChange(e.target.value)}
                                    size="sm"
                                >
                                    <option value="">{t("search.any")}</option>
                                    {[1, 2, 3, 4].map((n) => (
                                        <option key={n} value={n}>{n}+</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                    </div>
                </Collapse>

                {/* Contador de resultados */}
                <p className="filter-bar__results">
                    {t("results.count", { count: totalResults })}
                </p>

                <SaveSearchModal
                    show={showSaveModal}
                    onHide={() => setShowSaveModal(false)}
                    filters={filters}
                    onSuccess={handleSaveSuccess}
                />
            </Container>
        </div>
    );
}

/* ── Componente interno: pill que envuelve un <select> nativo invisible ── */
function PillSelect({ label, value, onChange, active, children }) {
    return (
        <div style={{ position: "relative" }}>
            <div className={`filter-pill${active ? " filter-pill--active" : ""}`} style={{ pointerEvents: "none" }}>
                {value ? value : label}
                <span className="filter-pill__chevron" />
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    cursor: "pointer",
                    width: "100%",
                    height: "100%",
                }}
                aria-label={label}
            >
                {children}
            </select>
        </div>
    );
}
