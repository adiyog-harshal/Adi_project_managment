import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Roles from "./pages/Roles";

function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">

                <Sidebar />

                <main className="main-content">
                    <Routes>

                        <Route path="/" element={<Roles />} />

                        <Route
                            path="/roles"
                            element={<Roles />}
                        />

                    </Routes>
                </main>

            </div>
        </BrowserRouter>
    );
}

export default App;