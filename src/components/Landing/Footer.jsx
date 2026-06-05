import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { LuMapPin, LuPhone, LuMail } from "react-icons/lu";

const Footer = () => {
    const { t } = useTranslation("landing");
    return (
        <footer style={{ backgroundColor: "#111827", color: "#9ca3af", padding: "60px 0 30px" }}>
            <Container>
                <Row className="g-4 mb-5">
                    <Col lg={4}>
                        <h5 className="text-white fw-bold mb-3">OpenRoof</h5>
                        <p style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                            {t("footer.description")}
                        </p>
                    </Col>
                    <Col lg={2} xs={6}>
                        <h6 className="text-white fw-semibold mb-3">{t("footer.company")}</h6>
                        <ul className="list-unstyled" style={{ fontSize: "0.9rem" }}>
                            <li className="mb-2"><a href="#" style={{ textDecoration: "none", color: "#827d7dff" }}>{t("footer.about")}</a></li>
                            <li className="mb-2"><a href="#" style={{ textDecoration: "none", color: "#827d7dff" }}>{t("footer.services")}</a></li>
                            <li className="mb-2"><a href="#" style={{ textDecoration: "none", color: "#827d7dff" }}>{t("footer.agents")}</a></li>
                        </ul>
                    </Col>
                    <Col lg={2} xs={6}>
                        <h6 className="text-white fw-semibold mb-3">{t("footer.properties")}</h6>
                        <ul className="list-unstyled" style={{ fontSize: "0.9rem" }}>
                            <li className="mb-2"><a href="#" style={{ textDecoration: "none", color: "#827d7dff" }}>{t("footer.buy")}</a></li>
                            <li className="mb-2"><a href="#" style={{ textDecoration: "none", color: "#827d7dff" }}>{t("footer.rent")}</a></li>
                            <li className="mb-2"><a href="#" style={{ textDecoration: "none", color: "#827d7dff" }}>{t("footer.sell")}</a></li>
                        </ul>
                    </Col>
                    <Col lg={4}>
                        <h6 className="text-white fw-semibold mb-3">{t("footer.contact")}</h6>
                        <ul className="list-unstyled" style={{ fontSize: "0.9rem", color: "#827d7dff" }}>
                            <li className="mb-2 d-flex align-items-center gap-2">
                                <LuMapPin className="text-primary" /> Asunción, Paraguay
                            </li>
                            <li className="mb-2 d-flex align-items-center gap-2">
                                <LuPhone className="text-primary" /> +595 21 000 000
                            </li>
                            <li className="mb-2 d-flex align-items-center gap-2">
                                <LuMail className="text-primary" /> info@openroof.com.py
                            </li>
                        </ul>
                    </Col>
                </Row>
                <hr style={{ borderColor: "#374151" }} />
                <p className="text-center mb-0 pt-3" style={{ fontSize: "0.85rem" }}>
                    {t("footer.rights")}
                </p>
            </Container>
        </footer>
    );
};

export default Footer;
