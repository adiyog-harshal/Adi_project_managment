import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    User,
    CircleCheck,
    FileText,
    Users,
    ListTodo,
    Flag
} from "lucide-react";

import api from "../../services/api";

import "./ProjectDetails.css";


const ProjectDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchProject();
    }, [id]);


    const fetchProject = async () => {

        try {

            const projectResponse = await api.get(`projects/${id}/`);
            const usersResponse = await api.get("users/");

            console.log("PROJECT DETAILS:", projectResponse.data);
            console.log("USERS:", usersResponse.data);

            setProject(projectResponse.data);
            setUsers(usersResponse.data);

        } catch (error) {

            console.error("Failed to fetch project:", error);

        } finally {

            setLoading(false);

        }

    };

    const projectManager = users.find(
        (user) => user.id === project?.project_manager
    );
    


    if (loading) {

        return (
            <div className="project-details-loading">
                Loading project...
            </div>
        );

    }


    if (!project) {

        return (
            <div className="project-details-page">

                <button
                    className="back-project-btn"
                    onClick={() => navigate("/projects")}
                >
                    <ArrowLeft size={16} />
                    Back to Projects
                </button>

                <div className="project-not-found">
                    Project not found.
                </div>

            </div>
        );

    }

    const getProjectStatus = () => {
        if (!project?.start_date || !project?.end_date){
            return "-";
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(project.start_date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(project.end_date);
        endDate.setHours(0, 0, 0, 0);

        if (startDate > today) {
            return "Upcoming";
        }

        if (startDate <= today && endDate >= today) {
            return "Ongoing";
        }

        if (endDate < today) {
            return "Completed";
        }

        return "-";
    };


    return (

        <div className="project-details-page">

            {/* BACK BUTTON */}

            <button
                type="button"
                className="back-project-btn"
                onClick={() => navigate("/projects")}
            >
                <ArrowLeft size={16} />
                Back to Projects
            </button>


            {/* PROJECT HEADER */}

            <div className="project-details-header">

                <div className="project-title-section">

                    <div className="project-details-icon">
                        <FileText size={24} />
                    </div>

                    <div>

                        <h1>
                            {project.project_name}
                        </h1>

                        <p>
                            Project #{project.id}
                        </p>

                    </div>

                </div>


                <span
                    className={`project-detail-status ${
                        getProjectStatus() === "Upcoming"
                            ? "status-upcoming"
                            : getProjectStatus() === "Ongoing"
                            ? "status-ongoing"
                            : getProjectStatus() === "Completed"
                            ? "status-completed"
                            : ""
                    }`}
                >
                    {getProjectStatus()}
                </span>

            </div>


            {/* PROJECT SUMMARY CARDS */}

            <div className="project-summary-grid">

                <div className="project-summary-card">

                    <div className="summary-icon manager-icon">
                        <User size={18} />
                    </div>

                    <div>
                        <span>Project Manager</span>
                        <strong>
                            {projectManager?.username || "-"}
                        </strong>
                    </div>

                </div>


                <div className="project-summary-card">

                    <div className="summary-icon start-date-icon">
                        <CalendarDays size={18} />
                    </div>

                    <div>
                        <span>Start Date</span>
                        <strong>
                            {project.start_date || "-"}
                        </strong>
                    </div>

                </div>


                <div className="project-summary-card">

                    <div className="summary-icon end-date-icon">
                        <CalendarDays size={18} />
                    </div>

                    <div>
                        <span>End Date</span>
                        <strong>
                            {project.end_date || "-"}
                        </strong>
                    </div>

                </div>


                <div className="project-summary-card">

                    <div className="summary-icon status-icon">
                        <CircleCheck size={18} />
                    </div>

                    <div>
                        <span>Status</span>
                        <strong>
                            {getProjectStatus()}
                        </strong>
                    </div>

                </div>

            </div>


            {/* PROJECT INFORMATION */}

            <div className="project-information-card">

                <div className="section-title">
                    <FileText size={19} />
                    <h2>Project Details</h2>

                </div>


                <div className="project-information-grid">
                    
                    <div className="project-description">
                        
                        <div className="description-header">
                            <h3>Description</h3>
                        </div>

                        <p>{project.description || "No description available."}</p>
                    </div>

                </div>

            </div>


            {/* PROJECT SECTIONS */}

            <div className="project-sections">

                <button
                    type="button"
                    className="project-section-btn active"
                >
                    <FileText size={17} />
                    Overview
                </button>


                <button
                    type="button"
                    className="project-section-btn"
                >
                    <Users size={17} />
                    Team Members
                </button>


                <button
                    type="button"
                    className="project-section-btn"
                >
                    <ListTodo size={17} />
                    Tasks
                </button>


                <button
                    type="button"
                    className="project-section-btn"
                >
                    <Flag size={17} />
                    Milestones
                </button>

            </div>


        </div>

    );

};


export default ProjectDetails;