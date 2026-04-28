import { useState, useEffect } from "react";
import { Container, Collapse, Row, Col, Form, Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import useCurrencyStore from "../../store/useCurrencyStore";
import { PROPERTY_TYPE_OPTIONS, AVAILABILITY_OPTIONS } from "../../constants/propertyEnums";
import SaveSearchModal from "./SaveSearchModal";
import { searchPreferencesApi } from "../../services/search/searchPreferencesApi";

export default function PropertiesHero({
    search,
    typeFilter,
    availability,
    minPrice,
    maxPrice,
    minBedrooms,
    minBathrooms,
    priceCurrency,
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
    const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
    const activePriceCurrency = priceCurrency || selectedCurrency || "PYG";
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [savedSearches, setSavedSearches] = useState([]);

    const fetchSavedSearches = async () => {
        try {
            const res = await searchPreferencesApi.getMine();
            const items = res?.content || [];
            setSavedSearches(items);
        } catch (err) {
            console.error("Error loading saved searches:", err);
        }
    };

    useEffect(() => {
        fetchSavedSearches();
    }, []);

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
        fetchSavedSearches();
    };

    const advancedActiveCount = [availability, minPrice, maxPrice, minBedrooms, minBathrooms].filter(Boolean).length;
    const hasAnyFilter = !!(search || typeFilter || advancedActiveCount);
    const priceRangeNote =
        activePriceCurrency === "PYG"
            ? "Los filtros de precio se envían en PYG."
            : `Los filtros de precio se convierten a PYG según la cotización disponible de Cambios Chaco.`;

    return (
        <div className="bg-light py-4" style={{ overflow: "visible" }}>
            <Container>
                <div className="filter-bar">

                    {/* Búsqueda */}
                    <div className="filter-bar__search">
                        <input
                            type="text"
                            placeholder={t("search.placeholder")}
                            value={search}
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </div>

                    {/* Mis búsquedas */}
                    <Dropdown className="filter-bar__saved-dropdown">
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

                    {/* Tipo */}
                    <PillSelect
                        label={t("search.type")}
                        value={typeFilter}
                        onChange={onTypeChange}
                        active={!!typeFilter}
                    >
                        <option value="">Todos</option>
                        {PROPERTY_TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </PillSelect>

                    {/* Dormitorios */}
                    <PillSelect
                        label={t("search.bedrooms")}
                        value={minBedrooms}
                        onChange={onMinBedroomsChange}
                        active={!!minBedrooms}
                    >
                        <option value="">Cualquiera</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>{n}+</option>
                        ))}
                    </PillSelect>

                    {/* Más filtros */}
                    <button onClick={() => setShowAdvanced(!showAdvanced)}>
                        {t("search.moreFilters")}
                    </button>

                    {hasAnyFilter && (
                        <>
                            <button onClick={onClear}>Limpiar</button>
                            <button onClick={() => setShowSaveModal(true)}>Guardar</button>
                        </>
                    )}
                </div>

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
                                        {AVAILABILITY_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>

                                <Col md={2}>
                                    <span className="filter-bar__panel-label">
                                        {t("search.minPrice")} ({activePriceCurrency})
                                    </span>
                                    <Form.Control
                                        type="number"
                                        size="sm"
                                        placeholder={`0 ${activePriceCurrency}`}
                                        min={0}
                                        value={minPrice}
                                        onChange={(e) => onMinPriceChange(e.target.value)}
                                    />
                                </Col>

                                <Col md={2}>
                                    <span className="filter-bar__panel-label">
                                        {t("search.maxPrice")} ({activePriceCurrency})
                                    </span>
                                    <Form.Control
                                        type="number"
                                        size="sm"
                                        placeholder={`${t("search.noLimit")} (${activePriceCurrency})`}
                                        min={0}
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
                            <p className="filter-bar__price-note mb-0 mt-3">{priceRangeNote}</p>
                        </div>
                    </div>
                </Collapse>

                <p className="filter-bar__results">
                    {t("results.showing", { count: totalResults })}
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

function PillSelect({ label, value, onChange, active, children }) {
    return (
        <div style={{ position: "relative" }}>
            <div className={`filter-pill${active ? " filter-pill--active" : ""}`} style={{ pointerEvents: "none" }}>
                {value || label}
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
