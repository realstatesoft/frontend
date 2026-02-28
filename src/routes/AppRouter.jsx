//imports
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateProperty from "../pages/CreateProperty";
import ShowProperty from "../pages/ShowProperty/ShowProperty";
import LandingPage from "../pages/LandingPage";
import PropertiesPage from "../pages/PropertiesPage";
import PropertiesTrashCan from "../pages/PropertiesTrashCan/PropertiesTrashCan";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/create-property" element={<CreateProperty />} />
                <Route path="/show-property" element={<ShowProperty />} />
                <Route path="/propiedades" element={<PropertiesPage />} />
                <Route path="/trashcan" element={<PropertiesTrashCan />} />
            </Routes>
        </BrowserRouter>
    )
}