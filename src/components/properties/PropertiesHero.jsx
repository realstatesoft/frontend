import { useState } from "react";
import { Container, Collapse, Row, Col, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { PROPERTY_TYPE, AVAILABILITY } from "../../constants/propertyEnums";

/**
 * PropertiesHero — barra de filtros estilo pill (inspirada en Zillow).
 *
 * Filtros básicos en la barra: Tipo · Precio · Dormitorios · Más (avanzados)
 * Panel avanzado: disponibilidad, precio min/max, dormitorios mín., baños mín.
 */
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
    onAvailabilityChange,
    onMinPriceChange,
    onMaxPriceChange,
    onMinBedroomsChange,
    onMinBathroomsChange,
    onClear,
}) {
    const { t } = useTranslation("properties");
    const [showAdvanced, setShowAdvanced] = useState(false);

    const advancedActiveCount = [availability, minPrice, maxPrice, minBedrooms, minBathrooms].filter(Boolean).length;
    const hasAnyFilter = !!(search || typeFilter || advancedActiveCount);

    return (
        <div className="bg-light py-4">
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

                    <div className="filter-bar__divider" />

                    {/* Pill: Tipo */}
                    <PillSelect
                        label={t("search.type")}
                        value={typeFilter}
                        onChange={onTypeChange}
                        active={!!typeFilter}
                    >
                        <option value="">{t("search.all")}</option>
                        {Object.entries(PROPERTY_TYPE).map(([label, value]) => (
                            <option key={value} value={label}>{t(`types.${value.toLowerCase()}`)}</option>
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
                            <option key={n} value={n}>{n}+</option>
                        ))}
                    </PillSelect>

                    <div className="filter-bar__divider" />

                    {/* Pill: Más (abre panel avanzado) */}
                    <button
                        className={`filter-pill${showAdvanced || advancedActiveCount > 0 ? " filter-pill--active" : ""}`}
                        onClick={() => setShowAdvanced((v) => !v)}
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
                        </>
                    )}
                </div>

                {/* ── Panel de filtros avanzados ─────────────────────────── */}
                <Collapse in={showAdvanced}>
                    <div>
                        <div className="filter-bar__advanced-panel">
                            <Row className="g-3">
                                <Col md={3}>
                                    <span className="filter-bar__panel-label">{t("search.availability")}</span>
                                    <Form.Select
                                        value={availability}
                                        onChange={(e) => onAvailabilityChange(e.target.value)}
                                        size="sm"
                                    >
                                        <option value="">{t("search.any")}</option>
                                        {Object.entries(AVAILABILITY).map(([label, value]) => (
                                            <option key={value} value={label}>
                                                {t(
                                                    `availabilityOptions.${
                                                        value === 'IMMEDIATE'
                                                            ? 'immediate'
                                                            : value === 'IN_30_DAYS'
                                                              ? 'in30Days'
                                                              : value === 'IN_60_DAYS'
                                                                ? 'in60Days'
                                                                : 'toNegotiate'
                                                    }`
                                                )}
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
                    </div>
                </Collapse>

                {/* Contador de resultados */}
                <p className="filter-bar__results">
                    {t("results.showing", { count: totalResults })}
                </p>
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
