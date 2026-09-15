import React from "react";

import {
    Plus,
    Search,
    MoreVertical,
    FolderKanban
} from "lucide-react";

import "./Projects.css";

const Projects = () => {

    return (

        <div className="projects-page">

            {/* PAGE HEADER */}

            <div className="projects-header">

                <div>
                    <h1>Projects</h1>
                    <p>Manage and track your projects</p>
                </div>

                <button className="add-project-btn">

                    <plus size={18} />

                    <span>
                        Add Project
                    </span>

                </button>

            </div>

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