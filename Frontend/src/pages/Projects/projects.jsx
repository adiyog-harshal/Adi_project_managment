import React, { useState } from "react";

import {
    Plus,
    Search,
    MoreVertical,
    FolderKanban
} from "lucide-react";

import "./Projects.css";

const Projects = () => {

    const [showForm, setShowForm] = useState(false);

    const [projectForm, setProjectForm] = useState({
        project_name: "",
        start_date: "",
        end_date: "",
        status: ""
    });

    const [formError, setFormError] = useState("");

    const handleChange = (e) => {

        const { name, value } = e.target;

        setProjectForm({
            ...projectForm,
            [name]: value
        });

    };

    // HANDLECREATE
    const handleCreateProject = async () => {

        setFormError("");

        if (!projectForm.project_name.trim()) {
            setFormError("Project name is required.");
            return;
        }

        if (!projectForm.start_date) {
            setFormError("Start date is required.");
            return;
        }

        if (!projectForm.end_date) {
            setFormError("End date is required.");
            return;
        }

        if (
            new Date(projectForm.end_date) <=
            new Date(projectForm.start_date)
        ) {
            setFormError("End date must be after the start date.");
            return;
        }

        if (!projectForm.status) {
            setFormError("Status is required.");
            return;
        }

        console.log("Project Data:", projectForm);

        setShowForm(false);

        setProjectForm({
            project_name: "",
            start_date: "",
            end_date: "",
            status: ""
        });

    };


    return (

        <div className="projects-page">

            {/* PAGE HEADER */}

            <div className="projects-header">

                <div>
                    <h1>Project Management</h1>
                    <p>Manage and track your projects</p>
                </div>

                <button
                    className="add-project-btn"
                    onClick={() => {
                        setShowForm(!showForm);
                        setFormError("");
                    }}
                >

                    <Plus size={18} />

                    <span>
                        {showForm ? "Close" : "Add Project"}
                    </span>

                </button>

            </div>

            {/* ADD PROJECT FORM */}
            {showForm && (
                <div className="project-form-wrapper">

                    <div className="project-form-card">

                        <div className="project-form-header">

                            <h2>Add New Project</h2>

                            <p>Enter the project details below</p>

                        </div>

                        {formError && (
                            <div className="project-form-error">
                                {formError}
                            </div>
                        )}

                        <div className="project-form-grid">

                            {/* Project Name */}
                            <div className="form-group">
                                <label>Project Name</label>

                                <input
                                    type="text"
                                    name="project_name"
                                    value={projectForm.project_name}
                                    onChange={handleChange}
                                    placeholder="Enter project name"
                                />
                            </div>


                            {/* Status */}
                            <div className="form-group">
                                <label>Status</label>

                                <select
                                    name="status"
                                    value={projectForm.status}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Completed">Completed</option>
                                    <option value="In Progress">In Progress</option>
                                </select>
                            </div>


                            {/* Start Date */}
                            <div className="form-group">
                                <label>Start Date</label>

                                <input
                                    type="date"
                                    name="start_date"
                                    value={projectForm.start_date}
                                    onChange={handleChange}
                                    min="2000-01-01"
                                    max="2000-12-31"
                                />
                            </div>


                            {/* End Date */}
                            <div className="form-group">
                                <label>End Date</label>

                                <input
                                    type="date"
                                    name="end_date"
                                    value={projectForm.end_date}
                                    onChange={handleChange}
                                    min="2000-01-01"
                                    max="2000-12-31"
                                />
                            </div>

                        </div>

                        <div className="project-form-actions">

                            <button
                                type="button"
                                className="cancel-project-btn"
                                onClick={() => {
                                    setShowForm(false);
                                    setFormError("");
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="create-project-btn"
                                onClick={handleCreateProject}
                            >
                                Save Project
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* SEARCH */}

            <div className="projects-toolbar">

                <div className="search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search projects...."
                    />

                </div>
            </div>

            {/* PROJECT TABLE */}

            <div className="projects-card">

                <div className="projects-table">

                    <div className="table-header">

                        <span>
                            Project
                        </span>

                        <span>
                            Client
                        </span>

                        <span>
                            Start Date
                        </span>

                        <span>
                            Status
                        </span>

                        <span>
                            Action
                        </span>
                    </div>

                    {/* SAMPLE PROJECT */}

                    <div className="table-row">
                        
                        <div className="project-name">

                            <div className="project-icon">
                                <FolderKanban size={18} />
                            </div>

                            <div>

                                <strong>
                                    CRM Project
                                </strong>

                                <small>
                                    Project #001
                                </small>
                            </div>
                        </div>

                        <span>ABC Company</span>

                        <span>
                            15 Sep 2026
                        </span>

                        <span>
                            <span className="status-badge active-status">
                                Active
                            </span>

                        </span>

                        <div className="action-menu">

                            <button>
                                <MoreVertical size={18} />
                            </button>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};


export default Projects;