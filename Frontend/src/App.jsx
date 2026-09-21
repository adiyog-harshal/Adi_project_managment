import React from "react";

import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";

import Projects from "./pages/Projects/projects";
import Designations from "./pages/Designations/designations";
import Roles from "./pages/Roles";
import Login from "./pages/Login/login";

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

            <Routes>

                {/* LOGIN */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* MAIN PMS */}

                <Route
                    path="/*"
                    element={

                        <>

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

                                    <Route
                                        path="/roles"
                                        element={<Roles />}
                                    />

                                </Routes>

                            </main>

                        </>

                    }
                />

            </Routes>

        </BrowserRouter>

    );

}


export default App;