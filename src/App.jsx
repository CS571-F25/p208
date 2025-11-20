import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import AnimePage from "./pages/AnimePage.jsx";

export default function App() {
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="sm">
        <Container>
          <Navbar.Brand as={Link} to="/">
            AniList Viewer
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <main className="pt-3">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/anime/:id" element={<AnimePage />} />
          <Route
            path="*"
            element={
              <Container className="py-4">
                <h1>404 Not Found</h1>
                <p>We couldn’t find that page.</p>
              </Container>
            }
          />
        </Routes>
      </main>
    </>
  );
}
