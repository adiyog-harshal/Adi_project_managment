import React, { useEffect, useState, useRef } from "react";

import {
    Plus,
    Search,
    MoreVertical,
    Pencil,
    Trash2,
    FolderKanban,
    Bell,
    FolderOpen,
    PlayCircle,
    Clock3,
    CheckCircle2,
    X
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./projects.css";


const Projects = () => {

    const [showForm, setShowForm] = useState(false);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const [search, setSearch] = useState("");
    const [openAction, setOpenAction] = useState(null);

    const navigate = useNavigate();
    
    const [editingProject, setEditingProject] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    
    const projectsPerPage = 5;

    const totalProjectCount = projects.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingProjects = projects.filter((project) => {

        if (!project.start_date) return false;

        const startDate = new Date(project.start_date);
        startDate.setHours(0, 0, 0, 0);

        return startDate > today;
    }).length;

    const ongoingProjects = projects.filter((project) => {

        if (!project.start_date || !project.end_date) {
            return false;
        }

        const startDate = new Date(project.start_date);
        const endDate = new Date(project.end_date);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        return startDate <= today && endDate >= today;
    }).length;

    const completedProjects = projects.filter((project) => {

        if (!project.end_date) return false;

        const endDate = new Date(project.end_date);
        endDate.setHours(0, 0, 0, 0);

        return endDate < today;
    }).length;

    const [selectedProject, setSelectedProject] = useState(null);

    const [projectForm, setProjectForm] = useState({
        project_name: "",
        start_date: "",
        end_date: "",
        project_manager: "",
        description:""
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

        if (!projectForm.project_manager) {
            setFormError("Project Manager is required.");
            return;
        }

        try {

            if (editingProject) {

                await api.put(
                    `projects/${editingProject.id}/`,
                    projectForm
                );

            } else {

                await api.post(
                    "projects/",
                    projectForm
                );

            }

            await fetchProjects();

            setShowForm(false);
            setEditingProject(null);

            setProjectForm({
                project_name: "",
                start_date: "",
                end_date: "",
                project_manager: "",
                description: ""
            });

        } catch (error) {

            console.error("Project save error:", error);

            console.error(
                "Backend response:",
                error.response?.data
            );

            setFormError("Failed to save project.");
        }
    };

    const filteredProjects = projects.filter((project) =>
        project.project_name
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    const fetchProjects = async () => {
        try {
            const response = await api.get("projects/");
            
            setProjects([...response.data].reverse());
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get("users/");

            console.log("Users:", response.data);

            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // NOTIFICATIONS
    const fetchNotifications = async () => {
        try {
            const response = await api.get("projects/notifications/");
            const data = response.data;
            setNotifications(
                Array.isArray(data) ? data : data.results || []
            );
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchUsers();
        fetchNotifications();

        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            await api.put(
                `projects/notifications/${notificationId}/read`
            );

            setNotifications((prev) => 
                prev.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const totalProjects = filteredProjects.length;

    const totalPages = Math.ceil(
        totalProjects / projectsPerPage
    );

    const startIndex =
        (currentPage - 1) * projectsPerPage;

    const endIndex =
        startIndex + projectsPerPage;

    const currentProjects =
        filteredProjects.slice(startIndex, endIndex);

    // EDIT PROJECT
    const handleEditProject = (project) => {

        setProjectForm({
            project_name: project.project_name || "",
            start_date: project.start_date || "",
            end_date: project.end_date || "",
            project_manager: project.project_manager || "",
            description: project.description || ""
        });

        setEditingProject(project);
        setShowForm(true);
    };

    // DELETE PROJECT
    const handleDeleteProject = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this project?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(`projects/${id}/`);

            await fetchProjects();

        } catch (error) {

            console.error("Delete project error:", error);

            alert("Failed to delete project.");

        }
    };

    const calculateProgress = (project) => {
        if (!project.start_date || !project.end_date) {
            return 0;
        }

        const start = new Date(project.start_date);
        const end = new Date(project.end_date);
        const today = new Date();

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        today.setHours(0, 0, 0, 0);

        // Before project starts
        if (today < start) {
            return 0;
        }

        // Project completed
        if (today >= end) {
            return 100;
        }

        // TOTAL PROJECT DURATION
        const totalDuration = end.getTime() - start.getTime();

        // TIME ELAPSED SINCE PROJECT STARTED
        const elapsedDuration = today.getTime() - start.getTime();

        // CALCULATE PERCENTAGE
        const progress = Math.round(
            (elapsedDuration / totalDuration) * 100
        );

        return Math.min(Math.max(progress, 0), 100);
    };


    return (

        <div className={`projects-page ${showForm ? "form-open" : "" }`}>

            {/* PAGE HEADER */}

            <div className="projects-header">

                <div className="project-title">

                    <h1>
                        <FolderKanban
                            size={22}
                            color="#D9A21B"
                        />
                        Project Management
                    </h1>

                    <p>Manage and track your projects</p>

                </div>

                <div className="project-header-actions">

                    <div className="notification-wrapper">
                        <button 
                            className="header-icon-btn" 
                            title="Notifications"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={19} />

                            {notifications.some(
                                (notification) => !notification.is_read
                            ) && (
                                <span className="notification-dot"></span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="notification-dropdown">
                                
                                <div className="notification-header">
                                    <span>Notifications</span>
                                </div>

                                {notifications.length === 0 ? (
                                    <div className="no-notifications">
                                        No notifications
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${
                                                !notification.is_read ? "unread" : ""
                                            }`}
                                            onClick={() => 
                                                !notification.is_read &&
                                                markAsRead(notification.id)
                                            }
                                        >
                                            <div className="notification-content">
                                                <p className="notification-message">
                                                    {notification.message}
                                                </p>

                                                <div className="notification-time">
                                                    {new Date(
                                                        notification.created_at
                                                    ).toLocaleString()}
                                                </div>
                                            </div>

                                            {!notification.is_read && (
                                                <span className="unread-indicator"></span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                    </div>


                    

                    <button
                        className="add-project-btn"
                        onClick={() => {
                            setShowForm(true);
                            setFormError("");
                        }}
                    >
                        <Plus size={18} />
                        <span>
                            Add Project
                        </span>
                    </button>

                </div>

            </div>

            {/* PROJECT SUMMARY CARDS */}

            <div className="project-summary-cards">

                <div className="summary-card">
                    <div className="summary-icon total-icon">
                        <FolderKanban size={22} />
                    </div>

                    <div className="summary-content">
                        <span>Total Projects</span>
                        <strong>{totalProjectCount}</strong>
                    </div>
                </div>


                <div className="summary-card">
                    <div className="summary-icon upcoming-icon">
                        <PlayCircle size={22} />
                    </div>

                    <div className="summary-content">
                        <span>Upcoming Projects</span>
                        <strong>{upcomingProjects}</strong>
                    </div>
                </div>


                <div className="summary-card">
                    <div className="summary-icon ongoing-icon">
                        <Clock3 size={22} />
                    </div>

                    <div className="summary-content">
                        <span>Ongoing Projects</span>
                        <strong>{ongoingProjects}</strong>
                    </div>
                </div>


                <div className="summary-card">
                    <div className="summary-icon completed-icon">
                        <CheckCircle2 size={22} />
                    </div>

                    <div className="summary-content">
                        <span>Completed</span>
                        <strong>{completedProjects}</strong>
                    </div>
                </div>

            </div>

            {/* ADD PROJECT FORM */}
            {showForm && (
                <div className="project-form-wrapper">
                    <div className="project-form-card">

                        <div className="project-form-top">

                            

                            <div className="project-form-header">    
                                <h2>Add New Project</h2>

                                <p>Enter the project details below</p>
                            

                            </div>
                                
                                <button
                                    type="button"
                                    className="project-close-btn"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormError("");
                                    }}
                                    
                                >
                                    x
                                </button>
                        </div>
                            

                            {formError && (
                                <div className="project-form-error">
                                    {formError}
                                </div>
                            )}

                            <div className="project-form-grid">

                                {/* Project Name */}

                                
                                <div className="form-group full-width">
                                    <label>Project Name</label>

                                    <input
                                        type="text"
                                        name="project_name"
                                        value={projectForm.project_name}
                                        onChange={handleChange}
                                        placeholder="Enter project name"
                                    />
                                </div>


                                {/* project manager dropdown */}
                                

                                <div className="form-group">
                                    <label>Project Manager</label>

                                    <select
                                        name="project_manager"
                                        value={projectForm.project_manager}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select Project Manager
                                        </option>

                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.username}
                                            </option>
                                        ))}
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
                                        
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Description</label>

                                    <textarea
                                        name="description"
                                        value={projectForm.description}
                                        onChange={handleChange}
                                        placeholder="Enter project description"
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
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search projects...."
                    />

                </div>
            </div>

            {/* PROJECT TABLE */}
            <div className="projects-card">

                {/* TABLE */}

                <div className="projects-table">

                    <div className="table-header">

                        <span>Projects</span>

                        <span>Start Date</span>

                        <span>End Date</span>

                        <span>Progress</span>

                        <span>Actions</span>

                    </div>

                        {/* table rows */}
                    {/* TABLE ROWS */}
        {currentProjects.length > 0 ? (
            currentProjects.map((project) => (
                <div className="table-row" key={project.id}>

                    {/* PROJECT */}
                    <div className="project-name">
                        <div className="project-icon">
                            <FolderKanban size={18} />
                        </div>

                        <div>
                            <Link
                                to={`/projects/${project.id}`}
                                className="project-name-link"
                            >
                                {project.project_name}
                            </Link>
                        </div>
                    </div>


                    {/* START DATE */}
                    <span>
                        {project.start_date || "-"}
                    </span>
                    <span>{project.end_date || "_"}</span>

                    {/* PROGRESS */}
                    <div className="project-progress">

                         <div className="progress-bar">
                            <div
                                className={`progress-fill ${
                                    calculateProgress(project) < 50
                                        ? "progress-orange"
                                        : "progress-green"
                                }`}
                                style={{
                                    width: `${calculateProgress(project)}%`
                                }}
                            />
                        </div>

                        <span className="progress-percentage">
                            {calculateProgress(project)}%
                        </span>

                    </div>

                    {/* STATUS */}
                

                    {/* ACTION */}
                    <div 
                        className="action-menu"
                    >

                        
                        <button 
                            type="button"
                            className="action-button"
                            onClick={() => {
                                

                                setOpenAction(
                                    openAction === project.id ? null : project.id
                                );
                            }}
                        >
                            <MoreVertical size={18} />
                        </button>

                        {openAction === project.id && (
                            <div 
                                className="action-dropdown"
                                
                            >


                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpenAction(null);
                                        handleEditProject(project);
                                    }}                                
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpenAction(null);
                                        handleDeleteProject(project.id);

                                    }}
                                >
                                    
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            ))
        ) : (
            <div className="no-projects">
                No projects found.
            </div>
        )}

                </div> {/* Close projects-table */}

               

 
                {/* PAGINATION - OUTSIDE TABLE */}
                <div className="project-pagination">
                    <span className="project-pagination-info">
                        Showing 1 to 1 of 1 projects
                    </span>

                    <div className="project-pagination-buttons">
                        <button
                            type="button"
                            className="project-page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            className="project-page-number active"
                        >
                            1
                        </button>

                        <button
                            type="button"
                            className="project-page-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                                </div>
            </div>
        </div>
      
    );
};

export default Projects;