//imports
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateProperty from "../pages/CreateProperty";
import ShowProperty from "../pages/ShowProperty/ShowProperty";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* <Route path="/" element={<Home />} > */}
                <Route path="/create-property" element={<CreateProperty />} />
                <Route path="/show-property" element={<ShowProperty />} />
            </Routes>
        </BrowserRouter>
    )
}