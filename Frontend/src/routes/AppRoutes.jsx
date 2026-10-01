import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login/login";
import Dashboard from "../pages/Dashboards/dashboards";
import Projects from "../pages/Projects/projects";
import ProjectDetails from "../pages/ProjectDetails/projectdetails";
import Roles from "../pages/Roles";
import Users from "../pages/Users";
import Designations from "../pages/Designations/designations";

function AppRoutes() {
    return (
        <Routes>

            {/* Login */}
            <Route path="/login" element={<Login />} />

            {/* Main pages */}
            <Route 
                path="/" 
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/projects" 
                element={
                    <ProtectedRoute>
                        <Projects /> 
                    </ProtectedRoute>
                }
            /> 

            <Route 
                path="/projects/:id" 
                element={
                    <ProtectedRoute>
                        <ProjectDetails />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/designations" 
                element={
                    <ProtectedRoute>
                        <Designations />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/roles" 
                element={
                    <ProtectedRoute>
                        <Roles />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/users" 
                element={
                    <ProtectedRoute>
                        <Users />
                    </ProtectedRoute>
                } 
            />

        </Routes>
    );
}

export default AppRoutes;