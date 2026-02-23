//imports
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateProperty from "../pages/CreateProperty";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* <Route path="/" element={<Home />} > */}
                <Route path="/create-property" element={<CreateProperty />} />
            </Routes>
        </BrowserRouter>
    )
}