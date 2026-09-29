import { BrowserRouter } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;