//imports
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateProperty from "../pages/CreateProperty";
import ShowProperty from "../pages/ShowProperty/ShowProperty";
import HomePage from "../pages/LandingPage";
import PropertiesPage from "../pages/PropertiesPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/create-property" element={<CreateProperty />} />
                <Route path="/show-property" element={<ShowProperty />} />
                <Route path="/propiedades" element={<PropertiesPage />} />
            </Routes>
        </BrowserRouter>
    )
}