import { BrowserRouter, Routes, Route } from "react-router-dom";
import Roles from "./pages/Roles";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Roles />} />
                <Route path="/roles" element={<Roles />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;