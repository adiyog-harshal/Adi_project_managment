import React from "react";

import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";

import Projects from "./pages/Projects/projects";
import Designations from "./pages/Designations/designations";

import "./App.css";


const Dashboard = () => {

    return (
        <div className="dashboard-page">

            <h1>
                Dashboard
            </h1>

            <p>
                Welcome to Project Management System
            </p>

        </div>
    );

};


function App() {

    return (

        <BrowserRouter>

            <Sidebar />

            <main className="main-content">

                <Routes>

                    <Route
                        path="/"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/projects"
                        element={<Projects />}
                    />

                    <Route
                        path="/designations"
                        element={<Designations />}
                    />

                </Routes>

            </main>

        </BrowserRouter>

    );

}


export default App;