import { Routes, Route } from 'react-router-dom'

function AppRoutes() {
    return (
        <Routes>

            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={<h1>Dashboard</h1>} />
            <Route path="/users" element={<h1>Users</h1>} />
            <Route path="/teams" element={<h1>Teams</h1>} />
            <Route path="/projects" element={<h1>Projects</h1>} />
            <Route path="/tasks" element={<h1>Tasks</h1>} />
            <Route path="/milestones" element={<h1>Milestones</h1>} />
            <Route path="/notifications" element={<h1>Notifications</h1>} />
            <Route path="/activity" element={<h1>Activity</h1>} />
            <Route path="/reports" element={<h1>Reports</h1>} />
            <Route path="/profile" element={<h1>Profile</h1>} />

            {/*Default route*/}
            <Route path="/" element={<Login />} />
        </Routes>




    )
}
export default AppRoutes