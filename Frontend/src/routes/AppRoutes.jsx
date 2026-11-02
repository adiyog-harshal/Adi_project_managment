import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login/login";
import Dashboard from "../pages/Dashboards/dashboards";
import Projects from "../pages/Projects/projects";
import ProjectDetails from "../pages/ProjectDetails/projectdetails";
import Roles from "../pages/Roles/Roles";
import Users from "../pages/Users/Users";
import Milestones from "../pages/Milestones/Milestones";
import Designations from "../pages/Designations/designations";
import Backlog from "../pages/Backlog/Backlog";
import Sprints from "../pages/Sprints/sprints";
import Clients from "../pages/clients/client";

function AppRoutes() {
    return (
        <Routes>
            {/* PUBLIC PAGE */}
            <Route path="/login" element={<Login />} />

            {/* PROTECTED PAGES */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dashboard"
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

            <Route
                path="/milestones"
                element={
                    <ProtectedRoute>
                        <Milestones />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/clients"
                element={
                    <ProtectedRoute>
                        <Clients />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/projects/:id/milestones"
                element={
                    <ProtectedRoute>
                        <Milestones />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/projects/:id/backlog"
                element={
                    <ProtectedRoute>
                        <Backlog />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/projects/:id/sprints"
                element={
                    <ProtectedRoute>
                        <Sprints />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/projects/:id/sprints/:sprintId"
                element={
                    <ProtectedRoute>
                        <Sprints />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/teams"
                element={
                    <ProtectedRoute>
                        <h1>Teams</h1>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/notifications"
                element={
                    <ProtectedRoute>
                        <h1>Notifications</h1>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/activity"
                element={
                    <ProtectedRoute>
                        <h1>Activity</h1>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <h1>Reports</h1>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <h1>Profile</h1>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <h1>Settings</h1>
                    </ProtectedRoute>
                }
            />

            {/* UNKNOWN ROUTES */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;

