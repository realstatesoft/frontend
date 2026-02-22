import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";

function CustomNavbar() {
  return (
    <Navbar expand="lg" className="bg-light py-3">
      <Container className="bg-white rounded-pill shadow-sm px-4 py-2">

        <Navbar.Brand href="#" className="fw-bold">
          OpenRoof
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          <Nav className="mx-auto gap-4">
            <Nav.Link href="#">About us</Nav.Link>
            <Nav.Link href="#">Projects</Nav.Link>
            <Nav.Link href="#">Agents</Nav.Link>
            <Nav.Link href="#">Services</Nav.Link>
            <Nav.Link href="#">Listings</Nav.Link>
            <Nav.Link href="#">
              <Search size={18} />
            </Nav.Link>
            <Nav.Link href="#">Other services</Nav.Link>
          </Nav>
        </Navbar.Collapse>

        <Button variant="outline-dark" className="rounded-pill px-4">
          Contactanos
        </Button>

      </Container>
    </Navbar>
  );
}

export default CustomNavbar;