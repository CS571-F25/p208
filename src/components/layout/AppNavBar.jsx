import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useHomeState } from "../../HomeStateContext.jsx";

export default function AppNavbar() {
    const { clearHomeState } = useHomeState();

    const handleHomeClick = () => {
        clearHomeState(); // reset all saved Home state
    };

    return (
        <Navbar bg="dark" variant="dark" expand="sm">
            <Container>
                <Navbar.Brand as={Link} to="/" onClick={handleHomeClick}>
                    AniList Viewer
                </Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link as={Link} to="/" onClick={handleHomeClick}>
                        Home
                    </Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    );
}
