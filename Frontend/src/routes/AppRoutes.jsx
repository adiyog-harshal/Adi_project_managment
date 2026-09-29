import { Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Login from "../pages/Login/login";
import Users from "../pages/Users";
import Tasks from "../pages/Task";
import Dashboard from "../pages/Dashboard";
import Roles from "../pages/Roles";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/users" element={<Users />} />
            <Route path="/teams" element={<h1>Teams</h1>} />
            <Route path="/projects" element={<h1>Projects</h1>} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/milestones" element={<h1>Milestones</h1>} />
            <Route path="/notifications" element={<h1>Notifications</h1>} />
            <Route path="/activity" element={<h1>Activity</h1>} />
            <Route path="/reports" element={<h1>Reports</h1>} />
            <Route path="/profile" element={<h1>Profile</h1>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default AppRoutes;
