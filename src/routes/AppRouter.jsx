//imports
import { Routes, Route } from "react-router-dom";

import CreateProperty from "../pages/properties/CreateProperty";
import ShowProperty from "../pages/ShowProperty/ShowProperty";
import LandingPage from "../pages/LandingPage";
import PropertiesPage from "../pages/PropertiesPage";
import PropertiesTrashCan from "../pages/PropertiesTrashCan/PropertiesTrashCan";

export default function AppRouter() {
    return (
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/create-property" element={<CreateProperty />} />
                <Route path="/show-property/:id/edit" element={<CreateProperty />} />
                <Route path="/show-property/:id" element={<ShowProperty />} />
                <Route path="/propiedades" element={<PropertiesPage />} />
                <Route path="/trashcan" element={<PropertiesTrashCan />} />
            </Routes>
    )
}