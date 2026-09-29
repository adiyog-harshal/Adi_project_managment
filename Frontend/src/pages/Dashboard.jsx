import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FolderKanban,
  Plus,
  X,
} from "lucide-react";

const initialProjects = [
  {
    id: 1,
    name: "Project Management",
    client: "ABC Company",
    startDate: "2026-09-01",
    endDate: "2026-12-15",
    status: "In Progress",
  },
  {
    id: 2,
    name: "Backend System",
    client: "TechNova",
    startDate: "2026-08-10",
    endDate: "2026-11-20",
    status: "Active",
  },
  {
    id: 3,
    name: "Mobile App Launch",
    client: "BuildX",
    startDate: "2026-07-03",
    endDate: "2026-10-12",
    status: "Completed",
  },
];

const emptyProjectForm = {
  name: "",
  client: "",
  startDate: "",
  endDate: "",
  status: "Active",
};

const Dashboard = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [projectError, setProjectError] = useState("");

  const openCreateProjectForm = () => {
    setProjectForm(emptyProjectForm);
    setProjectError("");
    setShowProjectForm(true);
  };

  const closeProjectForm = () => {
    setShowProjectForm(false);
    setProjectForm(emptyProjectForm);
    setProjectError("");
  };

  const handleProjectInput = (event) => {
    const { name, value } = event.target;
    setProjectForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSaveProject = (event) => {
    event.preventDefault();

    if (!projectForm.name.trim()) {
      setProjectError("Project name is required.");
      return;
    }

    if (!projectForm.client.trim()) {
      setProjectError("Client name is required.");
      return;
    }

    if (!projectForm.startDate) {
      setProjectError("Start date is required.");
      return;
    }

    if (!projectForm.endDate) {
      setProjectError("End date is required.");
      return;
    }

    if (new Date(projectForm.endDate) <= new Date(projectForm.startDate)) {
      setProjectError("End date must be after the start date.");
      return;
    }

    const newProject = {
      id: Date.now(),
      name: projectForm.name.trim(),
      client: projectForm.client.trim(),
      startDate: projectForm.startDate,
      endDate: projectForm.endDate,
      status: projectForm.status,
    };

    setProjects((currentProjects) => [newProject, ...currentProjects]);
    closeProjectForm();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your project overview.</p>
        </div>

        <button className="primary-button" onClick={openCreateProjectForm}>
          <Plus size={18} />
          Create Project
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FolderKanban size={24} />
          </div>

          <div>
            <p>Total Projects</p>
            <h2>{projects.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>

          <div>
            <p>Completed Tasks</p>
            <h2>48</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock size={24} />
          </div>

          <div>
            <p>Pending Tasks</p>
            <h2>18</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <AlertCircle size={24} />
          </div>

          <div>
            <p>Overdue Tasks</p>
            <h2>5</h2>
          </div>
        </div>
      </div>

      <div className="content-card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <div>
            <h2>Projects</h2>
            <p>Manage your active project list</p>
          </div>


        </div>

        <table className="task-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Client</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>

            </tr>
          </thead>

          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{project.client}</td>
                <td>{new Date(`${project.startDate}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td>{new Date(`${project.endDate}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td>
                  <span className={`status ${project.status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {project.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div>
            <h2>Recent Tasks</h2>
            <p>Latest tasks from your projects</p>
          </div>

          <Link to="/tasks">View All</Link>
        </div>

        <table className="task-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Project</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Design Login Page</td>
              <td>Project Management</td>
              <td>
                <span className="priority high">High</span>
              </td>
              <td>
                <span className="status progress">In Progress</span>
              </td>
            </tr>

            <tr>
              <td>Create Authentication API</td>
              <td>Backend System</td>
              <td>
                <span className="priority medium">Medium</span>
              </td>
              <td>
                <span className="status completed">Completed</span>
              </td>
            </tr>

            <tr>
              <td>Database Configuration</td>
              <td>Backend System</td>
              <td>
                <span className="priority low">Low</span>
              </td>
              <td>
                <span className="status pending">Pending</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {showProjectForm && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="project-form-title" style={{ width: "100%", maxWidth: "560px", background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 20px 50px rgba(15,23,42,0.2)" }}>
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h2 id="project-form-title" style={{ margin: 0 }}>Create New Project</h2>
                <p style={{ margin: "6px 0 0", color: "#64748b" }}>Add a new project to your dashboard.</p>
              </div>

              <button type="button" className="close-button" onClick={closeProjectForm} aria-label="Close project form" style={{ border: "none", background: "transparent", cursor: "pointer", color: "#475569" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProject}>
              {projectError && (
                <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 12px", borderRadius: "8px", marginBottom: "16px" }}>
                  {projectError}
                </div>
              )}

              <div className="form-group" style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
                <label>Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={projectForm.name}
                  onChange={handleProjectInput}
                  placeholder="Enter project name"
                  style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #dbe2ea" }}
                />
              </div>

              <div className="form-group" style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
                <label>Client</label>
                <input
                  type="text"
                  name="client"
                  value={projectForm.client}
                  onChange={handleProjectInput}
                  placeholder="Enter client name"
                  style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #dbe2ea" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={projectForm.startDate}
                    onChange={handleProjectInput}
                    style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #dbe2ea" }}
                  />
                </div>

                <div className="form-group" style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={projectForm.endDate}
                    onChange={handleProjectInput}
                    style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #dbe2ea" }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: "grid", gap: "8px", marginBottom: "18px" }}>
                <label>Status</label>
                <select
                  name="status"
                  value={projectForm.status}
                  onChange={handleProjectInput}
                  style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #dbe2ea" }}
                >
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="cancel-button" onClick={closeProjectForm} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #dbe2ea", background: "white", cursor: "pointer" }}>
                  Cancel
                </button>

                <button type="submit" className="primary-button" style={{ padding: "10px 18px" }}>
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;