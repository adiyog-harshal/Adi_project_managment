import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    User,
    CircleCheck,
    FileText,
    Users,
    ListTodo,
    Flag,
    Layers
} from "lucide-react";

import api from "../../services/api";

import "./ProjectDetails.css";


const ProjectDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activeSection, setActiveSection] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [showAddMember, setShowAddMember] = useState(false);


    useEffect(() => {
        fetchProject();
    }, [id]);


    const fetchProject = async () => {

        try {
            setLoading(true);
            // ===========PROJECT =============
            const projectResponse = await api.get(`projects/${id}/`);
            // ===========USERS ================
            const usersResponse = await api.get("users/");
            // ============== MEMBERS ==============
            const membersResponse = await api.get(`projects/${id}/members/`);
            // ========== TASKS ===================
            const tasksResponse = await api.get("tasks/");

            // ====================USERS==================
            const userData = Array.isArray(usersResponse.data)
                ? usersResponse.data
                : usersResponse.data.results || [];

            //=================== MEMBERS ===================
            const memberData = Array.isArray(membersResponse.data)
                ? membersResponse.data
                : membersResponse.data.results || [];

            // ==================TASKS =======================
            const allTasks = Array.isArray(tasksResponse.data)
                ? tasksResponse.data
                : tasksResponse.data.results || [];

            // ONLY TASKS BELONGING TO THIS PROJECT
            const projectTasks = allTasks.filter((task) => {
                const taskProjectId =
                    task.project && typeof task.project === "object"
                        ? task.project.id
                        : task.project;
                return String(taskProjectId) === String(id);
            });

            // BEBUG
            console.log("PROJECT:", projectResponse.data);
            console.log("USERS:", userData);
            console.log("MEMBERS:", memberData);
            console.log("TASKS:", projectTasks);

            // SET STATE
            setProject(projectResponse.data);
            setUsers(userData);
            setMembers(memberData);
            setTasks(projectTasks);

        } catch (error) {
            console.error("Failed to fetch project:", error);
            console.error("Backend response:", error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!selectedUser) {
            alert("Please select a user.");
            return;
        }

        try {
            const response = await api.post(
                `projects/${id}/members/`,
                {
                    project: Number(id),
                    user: Number(selectedUser),
                }
            );

            console.log("MEMBER ADDED:", response.data);

            // REFRESH PROJECT MEMBERS
            const membersResponse = await api.get(
                `projects/${id}/members/`
            );

            const memberData = Array.isArray(membersResponse.data)
                ? membersResponse.data
                : membersResponse.data.results || [];

            setMembers(memberData);

            // Close popop
            setSelectedUser("");
            setShowAddMember(false);

        } catch (error) {
            console.error("Failed to add team member:", error);
            console.error("Backend response:", error.response?.data);

            alert(
                error.response?.data
                    ? JSON.stringify(error.response.data)
                    : "Failed to add team member."
            );
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
        if (!project?.start_date || !project?.end_date) {
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

    // OVERVIEW PAGE CALCULATION
    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        (task) =>
            task.status?.toLowerCase() === "completed"
    ).length;

    const inProgressTasks = tasks.filter(
        (task) =>
            task.status?.toLowerCase() === "in progress" ||
            task.status?.toLowerCase() === "in_progress"
    ).length;

    const projectProgress =
        totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;


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
                        <FileText size={10} />
                    </div>

                    <div>

                        <h1>
                            {project.project_name}

                        </h1>

                    </div>

                </div>


                <span
                    className={`project-detail-status ${getProjectStatus() === "Upcoming"
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
                    className={`project-section-btn ${activeSection === "overview" ? "active" : ""
                        }`}
                    onClick={() => setActiveSection("overview")}
                >
                    <FileText size={17} />
                    Overview
                </button>


                <button
                    type="button"
                    className={`project-section-btn ${activeSection === "members" ? "active" : ""
                        }`}
                    onClick={() => setActiveSection("members")}
                >
                    <Users size={17} />
                    Team Members
                </button>


                <button
                    type="button"
                    className="project-section-btn"
                    onClick={() =>
                        navigate(`/projects/${id}/backlog`)
                    }
                >
                    <ListTodo size={17} />
                    Backlog
                </button>


                <button
                    type="button"
                    className="project-section-btn"
                    onClick={() => navigate(`/projects/${id}/milestones`)}
                >
                    <Flag size={17} />
                    Milestones
                </button>

                <button
                    type="button"
                    className="project-section-btn"
                    onClick={() => navigate(`/projects/${id}/sprints`)}
                >
                    <Layers size={17} />
                    Sprints
                </button>

            </div>

<<<<<<< HEAD
=======
                
>>>>>>> 8f9ebb0 (sprint feature create successfully)

            {activeSection === "members" && (
                <div className="project-section-content">

                    <div className="team-members-header">

                        <div className="section-title">
                            <Users size={19} />
                            <h2>Team Members</h2>
                        </div>

                        <button
                            type="button"
                            className="add-member-button"
                            onClick={() => {
                                setSelectedUser("");
                                setShowAddMember(true);
                            }}
                        >
                            +
                            Add Member
                        </button>
                    </div>

                    {members.length === 0 ? (

                        <p className="empty-section-message">
                            No team members assigned to this project.
                        </p>

                    ) : (
                        <div className="project-members-list">
                            {members.map((member) => {
                                let memberUserId = null;

                                // GET USER ID FROM MEMBER OBJECT
                                if (
                                    member.user &&
                                    typeof member.user === "object"
                                ) {
                                    memberUserId = member.user.id;
                                } else if (
                                    member.user !== undefined &&
                                    member.user !== null
                                ) {
                                    memberUserId = member.user;
                                } else if (
                                    member.user_id !== undefined
                                ) {
                                    memberUserId = member.user_id;
                                }

                                // FIND COMPLETE USER DETAILS
                                const memberUser = users.find(
                                    (item) =>
                                        String(item.id) === String(memberUserId)
                                );

                                // Full name
                                const fullName =
                                    `${memberUser?.first_name || ""} ${memberUser?.last_name || ""
                                        }`.trim() ||
                                    memberUser?.username ||
                                    "Unknown User";

                                // Designation
                                const designation =
                                    typeof memberUser?.designation === "object"
                                        ? memberUser?.designation?.name
                                        : memberUser?.designation;

                                return (
                                    <div
                                        className="project-member-card"
                                        key={member.id}
                                    >
                                        {/* AVATAR */}
                                        <div className="member-avatar">
                                            {(
                                                memberUser?.first_name?.[0] ||
                                                memberUser?.username?.[0] ||
                                                "U"
                                            ).toUpperCase()}
                                        </div>

                                        {/* MEMBER INFORMATION */}
                                        <div className="member-info">
                                            <strong>
                                                {fullName}
                                            </strong>

                                            <span>
                                                {designation || "Designation not available"}
                                            </span>

                                            <span>
                                                {memberUser?.email || "Email not available"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* OVERVIEW SECTION PAGE  */}
            {activeSection === "overview" && (
                <div className="project-overview">

                    <div className="overview-header">
                        <div>
                            <h2>Project Overview</h2>
                            <p>
                                Quick summary of this project's current progress.
                            </p>
                        </div>
                    </div>

                    <div className="overview-stats">

                        <div className="overview-stat-card">
                            <span>Total Tasks</span>
                            <strong>{totalTasks}</strong>
                        </div>

                        <div className="overview-stat-card">
                            <span>Completed</span>
                            <strong>{completedTasks}</strong>
                        </div>

                        <div className="overview-stat-card">
                            <span>In Progress</span>
                            <strong>{inProgressTasks}</strong>
                        </div>

                        <div className="overview-stat-card">
                            <span>Progress</span>
                            <strong>{projectProgress}%</strong>
                        </div>

                    </div>


                    <div className="overview-progress-card">

                        <div className="overview-progress-header">
                            <div>
                                <h3>Project Progress</h3>
                                <p>
                                    {completedTasks} of {totalTasks} tasks completed
                                </p>
                            </div>

                            <strong>{projectProgress}%</strong>
                        </div>

                        <div className="overview-progress-track">
                            <div
                                className="overview-progress-fill"
                                style={{
                                    width: `${projectProgress}%`,
                                }}
                            />
                        </div>

                    </div>


                    <div className="overview-grid">

                        {/* BACKLOG */}

                        <div className="overview-card">

                            <div className="overview-card-header">

                                <div>
                                    <h3>Backlog</h3>
                                    <p>
                                        {tasks.length} backlog items
                                    </p>
                                </div>

                                <ListTodo size={20} />

                            </div>


                            <div className="overview-list">

                                {tasks.slice(0, 5).map((task) => (
                                    <div
                                        className="overview-list-item"
                                        key={task.id}
                                    >
                                        <div>
                                            <strong>
                                                {task.task_name || "-"}
                                            </strong>

                                            <span>
                                                {task.description || "No description"}
                                            </span>
                                        </div>

                                        <span
                                            className={`overview-priority ${
                                                task.priority
                                                    ?.toLowerCase()
                                                    .replace(/\s+/g, "-")
                                            }`}
                                        >
                                            {task.priority || "-"}
                                        </span>
                                    </div>
                                ))}

<<<<<<< HEAD
                                    <span
                                        className={`overview-priority ${task.priority
                                                ?.toLowerCase()
                                                .replace(/\s+/g, "-")
                                            }`}
                                    >
                                        {task.priority || "-"}
                                    </span>
=======
                                {tasks.length === 0 && (
                                    <div className="overview-empty">
                                        No backlog items found.
                                    </div>
                                )}

                            </div>


                            <button
                                type="button"
                                className="overview-view-button"
                                onClick={() =>
                                    navigate(`/projects/${id}/backlog`)
                                }
                            >
                                View Backlog →
                            </button>

                        </div>


                        {/* MILESTONES */}

                        <div className="overview-card">

                            <div className="overview-card-header">

                                <div>
                                    <h3>Milestones</h3>
                                    <p>
                                        Project milestones
                                    </p>
>>>>>>> 8f9ebb0 (sprint feature create successfully)
                                </div>

                                <Flag size={20} />

                            </div>


                            <div className="overview-list">
                                <div className="overview-empty">
                                    View project milestones and manage them from the Milestones page.
                                </div>
                            </div>

                            <button
                                type="button"
                                className="overview-view-button"
                                onClick={() =>
                                    navigate(`/projects/${id}/milestones`)
                                }
                            >
                                View Milestones →
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {showAddMember && (
                <div className="member-modal-overlay">
                    <div className="member-modal">
                        <div className="member-modal-header">

                            <div>
                                <h2>Add Team Member</h2>
                                <p>
                                    Select an existing user to add to this project.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="member-modal-close"
                                onClick={() => {
                                    setShowAddMember(false);
                                    setSelectedUser("");
                                }}
                            >
                                x
                            </button>
                        </div>

                        <div className="member-form-group">
                            <label>Select User</label>

                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                            >
                                <option value="">
                                    Select user
                                </option>

                                {users.map((user) => {

                                    const fullname =
                                        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                                        user.username ||
                                        "Unknown User";

                                    const designation =
                                        typeof user.designation === "object"
                                            ? user.designation?.name
                                            : user.designation;


                                    return (
                                        <option
                                            key={user.id} value={user.id}>
                                            {user.username || fullname}
                                            {"-"}
                                            {designation || "No Designation"}
                                        </option>
                                    );
                                })}

                            </select>
                        </div>

                        {selectedUser && (() => {

                            const selectedUserData = users.find(
                                (user) =>
                                    String(user.id) ===
                                    String(selectedUser)
                            );
                            const designation =
                                typeof selectedUserData?.designation === "object"
                                    ? selectedUserData?.designation?.name
                                    : selectedUserData?.designation;

                            return (
                                <div className="selected-user-info">

                                    <div>
                                        <label>Email</label>
                                        <p>
                                            {selectedUserData?.email || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <label>Designation</label>
                                        <p>
                                            {designation || "-"}
                                        </p>
                                    </div>

                                </div>
                            );
                        })()}

                        <div className="member-modal-actions">

                            <button
                                type="button"
                                className="member-cancel-button"
                                onClick={() => {
                                    setShowAddMember(false);
                                    setSelectedUser("");
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="member-add-button"
                                onClick={handleAddMember}
                            >
                                Add Member
                            </button>
                        </div>
                    </div>

                </div>
            )}

        </div>

    );

};


export default ProjectDetails;