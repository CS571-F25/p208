import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import AnimePage from "./pages/AnimePage.jsx";
import CharacterPage from "./pages/CharacterPage.jsx";
import AppNavbar from "./components/layout/AppNavbar.jsx";
import PageContainer from "./components/layout/PageContainer.jsx";

export default function App() {
  return (
    <>
      <AppNavbar />

      <main className="pt-3">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/anime/:id" element={<AnimePage />} />
          <Route path="/character/:id" element={<CharacterPage />} />
          <Route
            path="*"
            element={
              <PageContainer>
                <h1>404 Not Found</h1>
                <p>We couldn’t find that page.</p>
              </PageContainer>
            }
          />
        </Routes>
      </main>
    </>
  );
}