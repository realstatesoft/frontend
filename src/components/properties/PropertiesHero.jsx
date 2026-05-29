import { useState, useEffect, useCallback } from "react";
import { Container, Collapse, Row, Col, Form, Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import useCurrencyStore from "../../store/useCurrencyStore";
import { PROPERTY_TYPE_OPTIONS, AVAILABILITY_OPTIONS } from "../../constants/propertyEnums";
import SaveSearchModal from "./SaveSearchModal";
import { searchPreferencesApi } from "../../services/search/searchPreferencesApi";
import { useAuth } from "../../hooks/useAuth";

/**
 * PropertiesHero — barra de filtros estilo pill (inspirada en Zillow).
 *
 * Filtros básicos en la barra: Tipo · Precio · Dormitorios · Más (avanzados)
 * Panel avanzado: disponibilidad, precio min/max, dormitorios mín., baños mín.
 */
export default function PropertiesHero({
    search,
    category,
    typeFilter,
    availability,
    minPrice,
    maxPrice,
    minBedrooms,
    minBathrooms,
    priceCurrency,
    priceConversionAvailable = true,
    totalResults,
    onSearch,
    onTypeChange,
    onCategoryChange,
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

    const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
    const setCurrency = useCurrencyStore((state) => state.setCurrency);
    const activePriceCurrency = priceCurrency || selectedCurrency || "PYG";

    const fetchSavedSearches = useCallback(async () => {
        try {
            const res = await searchPreferencesApi.getMine();
            const items = res?.data?.content || [];
            setSavedSearches(items);
        } catch (err) {
            console.error("Error loading saved searches:", err);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSavedSearches();
        } else {
            setSavedSearches([]);
        }
    }, [isAuthenticated, fetchSavedSearches]);

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
        category,
        propertyType: typeFilter,
        availability,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        priceCurrency: activePriceCurrency,
        minBedrooms: minBedrooms || null,
        minBathrooms: minBathrooms || null,
    };

    const handleSaveSuccess = () => {
        fetchSavedSearches();
    };

    const advancedActiveCount = [availability, minPrice, maxPrice, minBathrooms].filter(Boolean).length;
    const hasAnyFilter = !!(search || category || typeFilter || advancedActiveCount);
    const priceRangeNote =
        activePriceCurrency === "PYG"
            ? "Los filtros de precio se envían en PYG."
            : priceConversionAvailable
                ? "Los filtros de precio se convierten a PYG según la cotización disponible de Cambios Chaco."
                : "Los filtros de precio no se aplican porque no hay cotización disponible de Cambios Chaco.";

    return (
        <div className="bg-light py-4" style={{ overflow: "visible" }}>
            <Container>
                <div className="filter-bar">
                    <div className="filter-bar__search">
                        <span className="filter-bar__search-icon"></span>
                        <input
                            type="text"
                            placeholder={t("search.placeholder")}
                            value={search}
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </div>

                    {isAuthenticated && (
                        <Dropdown className="filter-bar__saved-dropdown">
                            <Dropdown.Toggle className="filter-pill">
                                {t("savedSearches.title")}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Header>{t("savedSearches.header")}</Dropdown.Header>

                                {savedSearches.map((savedSearch) => (
                                    <Dropdown.Item
                                        key={savedSearch.id}
                                        as="div"
                                        className="d-flex justify-content-between"
                                        onClick={() => {
                                            const savedFilters = savedSearch.filters || {};
                                            if (savedFilters.priceCurrency) {
                                                setCurrency(savedFilters.priceCurrency);
                                            } else if (
                                                savedFilters.minPrice != null ||
                                                savedFilters.maxPrice != null
                                            ) {
                                                setCurrency("PYG");
                                            }
                                            onSearch(savedFilters.q ?? "");
                                            onTypeChange(savedFilters.propertyType ?? "");
                                            onCategoryChange(savedFilters.category ?? "");
                                            onAvailabilityChange(savedFilters.availability ?? "");
                                            onMinPriceChange(savedFilters.minPrice ?? "");
                                            onMaxPriceChange(savedFilters.maxPrice ?? "");
                                            onMinBedroomsChange(savedFilters.minBedrooms ?? "");
                                            onMinBathroomsChange(savedFilters.minBathrooms ?? "");
                                        }}
                                    >
                                        <span>{savedSearch.name}</span>
                                        <button
                                            className="filter-bar__delete-search"
                                            title={t("savedSearches.delete")}
                                            aria-label={t("savedSearches.deleteLabel", { name: savedSearch.name })}
                                            onClick={(evt) => handleDeleteSearch(savedSearch.id, evt)}
                                            type="button"
                                        >
                                            ×
                                        </button>
                                    </Dropdown.Item>
                                ))}

                                {savedSearches.length === 0 && (
                                    <Dropdown.Item disabled>
                                        {t("savedSearches.empty")}
                                    </Dropdown.Item>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    )}

                    <PillSelect
                        label="Operación"
                        value={category}
                        onChange={onCategoryChange}
                        active={!!category}
                    >
                        <option value="">Todas</option>
                        <option value="Venta">Venta</option>
                        <option value="Alquiler">Alquiler</option>
                    </PillSelect>

                    <div className="filter-bar__divider" />

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

                    {hasAnyFilter && (
                        <>
                            <div className="filter-bar__divider" />
                            <button className="filter-bar__clear" onClick={() => { setShowAdvanced(false); onClear(); }} title={t("search.clearFilters")} type="button">
                                ✕
                            </button>
                            <div className="filter-bar__divider" />
                            {isAuthenticated && (
                                <button className="filter-bar__save" onClick={() => setShowSaveModal(true)} title={t("actions.saveTooltip")} type="button">
                                    {t("actions.save")}
                                </button>
                            )}
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
