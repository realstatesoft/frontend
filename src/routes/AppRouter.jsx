//imports
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
        </Routes>
    )
}