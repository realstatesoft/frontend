import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Logotipo from "../../assets/Logotipo.png";

function CustomNavbar() {
  const navigate = useNavigate();

  return (
    <Navbar expand="lg" className="bg-light py-3">
      <Container className="bg-white rounded-pill shadow-sm px-4 py-2">

        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <img src={Logotipo} alt="OpenRoof" style={{ height: '40px', transform: 'scale(2.3)', transformOrigin: 'left center' }} />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          <Nav className="mx-auto gap-4">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link href="#about">About us</Nav.Link>
            <Nav.Link href="#projects">Projects</Nav.Link>
            <Nav.Link href="#agents">Agents</Nav.Link>
            <Nav.Link href="#services">Services</Nav.Link>
            <Nav.Link
              as={Link}
              to="/propiedades"
            >
              Propiedades
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>

        <Button
          variant="outline-dark"
          className="rounded-pill px-4"
          onClick={() => navigate("/propiedades")}
        >
          Contactanos
        </Button>

      </Container>
    </Navbar>
  );
}

export default CustomNavbar;