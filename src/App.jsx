import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/LandingPage";
import PropertiesPage from "./pages/PropertiesPage";
import CreateProperty from "./pages/CreateProperty";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/propiedades" element={<PropertiesPage />} />
      <Route path="/create-property" element={<CreateProperty />} />
    </Routes>
  );
}

export default App;
