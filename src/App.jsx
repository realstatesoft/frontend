import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/LandingPage";
import PropertiesPage from "./pages/PropertiesPage";



function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/propiedades" element={<PropertiesPage />} />
    </Routes>
  );
}

export default App;
