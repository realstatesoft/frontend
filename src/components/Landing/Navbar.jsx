import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  BoxArrowInRight,
  BoxArrowRight,
  Calendar3,
  Gear,
  Heart,
  HouseDoor,
  Person,
  Trash,
} from "react-bootstrap-icons";
import { useAuth } from "../../hooks/useAuth";
import Logotipo from "../../assets/Logotipo.png";

function CustomNavbar() {
  const navigate = useNavigate();

  // Obtiene el estado de autenticacion, datos del usuario y funcion de logout del contexto global
  const { isAuthenticated, logout } = useAuth();

  // Controla si el dropdown de perfil esta visible
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Ref adjunto al contenedor del dropdown para detectar clics fuera de el
  const dropdownRef = useRef(null);

  /**
   * Registra un listener global de mousedown para cerrar el dropdown
   * cuando el usuario hace clic en cualquier lugar fuera del contenedor.
   * El listener se elimina al desmontar el componente para evitar fugas de memoria.
   */
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Maneja la accion de cerrar sesion:
   * 1. Cierra el dropdown de perfil.
   * 2. Llama a logout() del contexto, que internamente hace POST /auth/logout y limpia la sesion local.
   * 3. Redirige al usuario a la pagina de inicio.
   */
  function handleLogout() {
    setDropdownOpen(false);
    logout();
    navigate("/");
  }

  /**
   * Redirige al usuario a la pagina de login al hacer clic en "Iniciar sesion".
   */
  function handleLogin() {
    setDropdownOpen(false);
    navigate("/login");
  }

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
            <Nav.Link as={Link} to="/properties">
              Propiedades
            </Nav.Link>
            <Nav.Link as={Link} to="/property-management">
              Vender / Alquilar
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>

        {/* Icono de perfil con dropdown condicional segun estado de sesion */}
        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="profile-avatar-btn"
            onClick={() => setDropdownOpen((o) => !o)}
            aria-label="Menu de perfil"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown-menu">
              {isAuthenticated ? (
                /* ── Usuario logueado ─────────────────────────── */
                <>
                  {/* Seccion 1: navegacion personal */}
                  <Link to="/profile" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Person size={17} style={{ flexShrink: 0 }} /> Mi perfil
                  </Link>
                  <Link to="/properties/me" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <HouseDoor size={16} style={{ flexShrink: 0 }} /> Mis propiedades
                  </Link>
                  <Link to="/trashcan" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Trash size={14} style={{ flexShrink: 0 }} /> Papelera
                  </Link>
                  <Link to="/properties/favorites" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Heart size={16} style={{ flexShrink: 0 }} /> Favoritos
                  </Link>
                  <Link to="/agenda" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Calendar3 size={16} style={{ flexShrink: 0 }} /> Agenda
                  </Link>

                  <hr className="profile-dropdown-divider" />

                  {/* Seccion 2: configuracion y sesion */}
                  <Link to="#" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Gear size={16} style={{ flexShrink: 0 }} /> Ajustes
                  </Link>
                  <button className="profile-dropdown-item profile-dropdown-logout" onClick={handleLogout}>
                    <BoxArrowRight size={16} style={{ flexShrink: 0 }} /> Cerrar sesión
                  </button>
                </>
              ) : (
                /* ── Usuario no logueado ──────────────────────── */
                <button className="profile-dropdown-item" onClick={handleLogin}>
                  <BoxArrowInRight size={16} style={{ flexShrink: 0 }} /> Iniciar sesión
                </button>
              )}
            </div>
          )}
        </div>

        {!isAuthenticated && (
          <Button
            variant="outline-dark"
            className="rounded-pill px-4"
            onClick={() => navigate("/properties")}
          >
            Contactanos
          </Button>
        )}

      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
