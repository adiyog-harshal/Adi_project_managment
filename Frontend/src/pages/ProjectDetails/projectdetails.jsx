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
import "./projectdetails.css";

const ProjectDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activeSection, setActiveSection] = useState("details");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showAddMember, setShowAddMember] = useState(false);

    const [projectSprints, setProjectSprints] = useState([]);
    const [sprintLoading, setSprintLoading] = useState(true);

    const [projectModules, setProjectModules] = useState([]);
    const [modulesLoading, setModulesLoading] = useState(true);

const getMemberUserId = (member) => {
    if (member.user && typeof member.user === "object") {
        return member.user.id;
    }

    if (member.user !== undefined && member.user !== null) {
        return member.user;
    }

    return member.user_id ?? null;
};

const assignedUserIds = new Set(
    members
        .map(getMemberUserId)
        .filter((userId) => userId !== null)
        .map(String)
);

    useEffect(() => {
        fetchProject();
        fetchProjectSprints();
        fetchProjectModules();
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

    // FETCH SPRINTS FOR THIS PROJECT
    const fetchProjectSprints = async () => {
        setSprintLoading(true);

        try{
            const response = await api.get("sprints/");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            // keep sprints belonging to this project
            const projectData = data.filter((sprint) => {
                const sprintProjectId =
                    typeof sprint.project === "object"
                        ? sprint.project?.id
                        : sprint.project;
                return String(sprintProjectId) === String(id);
            });

            setProjectSprints(projectData);
        } catch (error) {
            console.error("Failed to fetch project sprints:",
                error.response?.data || error.message);
            setProjectSprints([]);
        } finally {
            setSprintLoading(false);
        }
    };

    const fetchProjectModules = async () => {
        try {
            setModulesLoading(true);

            const response = await api.get("milestones/");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            const filteredModules = data
                .filter((module) =>
                    String(
                        typeof module.project === "object"
                            ? module.project?.id
                            : module.project
                    ) === String(id)
                )
                .reverse();
            setProjectModules(filteredModules);
        } catch (error) {
            console.error(
                "Error fetching project modules:",
                error.response?.data || error
            );
            setProjectModules([]);
        } finally {
            setModulesLoading(false);
        }
    };

    const handleAddMember = async () => {

        if (selectedUsers.length === 0) {
            alert("Please select at least one employee.");
            return;
        }

        try {

            // Send API request for each selected employee
            const results = await Promise.all(
                selectedUsers.map(async (userId) => {

                    const employee = users.find(
                        (user) => String(user.id) === String(userId)
                    );

                    const employeeName =
                        `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim() ||
                        employee?.username ||
                        "Unknown Employee";

                    try {

                        await api.post(`projects/${id}/members/`, {
                            project: Number(id),
                            user: Number(userId),
                        });

                        return {
                            success: true,
                            userId,
                            employeeName
                        };

                    } catch (error) {

                        const errorData = error.response?.data;

                        const reason =
                            errorData?.detail ||
                            errorData?.non_field_errors?.[0] ||
                            errorData?.user?.[0] ||
                            error.message ||
                            "Unknown error";

                        return {
                            success: false,
                            userId,
                            employeeName,
                            reason: typeof reason === "string"
                                ? reason
                                : JSON.stringify(reason)
                        };
                    }
                })
            );

            // Separate successful and failed employees
            const successfulEmployees = results.filter(
                (result) => result.success
            );

            const failedEmployees = results.filter(
                (result) => !result.success
            );

            // Refresh project members
            const membersResponse = await api.get(
                `projects/${id}/members/`
            );

            const memberData = Array.isArray(membersResponse.data)
                ? membersResponse.data
                : membersResponse.data.results || [];

            setMembers(memberData);

            // Keep only failed employees selected for retry
            if (failedEmployees.length > 0) {

                setSelectedUsers(
                    failedEmployees.map((employee) => String(employee.userId))
                );

            } else {

                setSelectedUsers([]);
                setShowAddMember(false);
            }

            // Prepare result message
            let message = `${successfulEmployees.length} employee(s) added successfully.\n`;

            if (failedEmployees.length > 0) {

                message += `\nFailed to add ${failedEmployees.length} employee(s):\n\n`;

                failedEmployees.forEach((employee, index) => {

                    message += `${index + 1}. ${employee.employeeName}\n`;
                    message += `   Reason: ${employee.reason}\n\n`;

                });

            }

            alert(message);

        } catch (error) {

            console.error("Failed to refresh project members:", error);

            alert(
                error.response?.data
                    ? JSON.stringify(error.response.data)
                    : "Unable to refresh team members. Please try again."
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
            return "Not Started";
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


const handleMemberRoleChange = async (
    memberId,
    roleField,
    checked
) => {
    const previousMembers = members;

    setMembers((currentMembers) =>
        currentMembers.map((member) => {
            if (String(member.id) === String(memberId)) {
                return { ...member, [roleField]: checked };
            }
            //  if assigning a role, uncheck it for other members.
            if (checked) {
                return { ...member, [roleField]: false};
            }

            return member;
        })
    );

    try {
        const response = await api.patch(
            `projects/${id}/members/roles/${memberId}/`,
            {
                [roleField]: checked,
            }
        );

        // Sync the updated member with the backend response.
        if (response.data && typeof response.data === "object") {
            setMembers((currentMembers) =>
                currentMembers.map((member) =>
                    String(member.id) === String(memberId)
                        ? { ...member, ...response.data }
                        : member
                )
            );
        }
    } catch (error) {
        console.error(
            "Failed to update member role:",
            error.response?.status,
            error.response?.data || error.message
        );

        setMembers(previousMembers);

        alert(
            JSON.stringify(
                error.response?.data ||
                error.message ||
                "Failed to update member role."
            )
        );
    }
};

    return (
        <div className="project-details-page">

            <div className="project-workspace">
                {/* LEFT SIDEBAR */}

                <aside className="project-workspace-sidebar">
                    <div className="workspace-sidebar-heading">
                        PROJECT MENU
                    </div>

                    <div className="section-title">
                        <FileText size={19} />
                        <h2>Project Details</h2>

                    </div>

                    <button
                        type="button"
                        className={`project-section-btn ${
                            activeSection === "members" ? "active" : ""
                        }`}
                        onClick={() => setActiveSection("members")}
                    >
                        <Users size={17} />
                        Team Members
                    </button>

                    <button
                        type="button"
                        className="project-section-btn"
                        onClick={() => navigate(`/projects/${id}/milestones`)}
                    >
                        <Flag size={17} />
                        Modules
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
                        onClick={() => navigate(`/projects/${id}/sprints`)}
                    >
                        <Layers size={17} />
                        Sprints
                    </button>

                    <button
                        type="button"
                        className={`project-section-btn ${
                            activeSection === "overview" ? "active" : ""
                        }`}
                        onClick={() => setActiveSection("overview")}
                    >
                        <FileText size={17} />
                        Overview
                    </button>

                </aside>

                {/* RIGHT SIDE CONTENT */}
                <main className="project-workspace-content">
                {/* OVERVIEW SECTION PAGE  */}

                {activeSection === "details" && (
                    <div className="project-details-content">

                    {/* BACK BUTTON */}

                        <button
                            type="button"
                            className="back-project-btn"
                            onClick={() => navigate("/projects")}
                        >
                            <ArrowLeft size={16} />
                            Back to Project
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

                            <div className="project-information-grid">

                                <div className="project-description">

                                    <div className="description-header">
                                        <h3>Description</h3>
                                    </div>

                                    <p>{project.description || "No description available."}</p>
                                </div>

                            </div>

                        </div>
                    </div>
                )}

                    {activeSection === "overview" && (
                        <div className="overview-scroll-content">
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

                            {/* ALL PROJECTS SPRINTS */}
                            <div className="overview-sprints-card">
                                <div className="overview-card-header">
                                    <div>
                                        <h3>Project Sprints</h3>
                                        <p>{projectSprints.length} total sprints</p>
                                    </div>

                                    <button
                                        type="button"
                                        className="overview-view-button"
                                        onClick={() => navigate(`/projects/${id}/sprints`)}
                                    >
                                        Manage Sprints
                                    </button>
                                </div>

                                {sprintLoading ? (
                                    <div className="overview-empty">Loading sprints...</div>
                                ) : projectSprints.length === 0 ? (
                                    <div className="overview-empty">
                                        No sprints created for this project.
                                    </div>
                                ) : (

                                <div className="overview-sprints-list">
                                {projectSprints.map((sprint) => (
                                    <div
                                        className="overview-sprint-item clickable-sprint"
                                        key={sprint.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() =>
                                            navigate(`/projects/${id}/sprints/${sprint.id}`)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                navigate(`/projects/${id}/sprints/${sprint.id}`);
                                            }
                                        }}
                                    >
                                        <div className="overview-sprint-info">
                                            <strong>{sprint.sprint_name}</strong>

                                            <span>
                                                {sprint.start_date || "No start date"}
                                                {" - "}
                                                {sprint.end_date || "No end date"}
                                            </span>

                                            {sprint.goal && <span>{sprint.goal}</span>}
                                        </div>

                                        <span className="overview-sprint-status">
                                            {sprint.status || "Upcoming"}
                                        </span>
                                    </div>
                                ))}
                                </div>
                            )}
                            </div>

                            <div className="overview-grid">
                                {/* BACKLOG */}
                                <div className="overview-card">

                                    <div className="overview-card-header">

                                        <div>
                                            <h3>Backlog</h3>
                                            <p>
                                                {tasks.length} total tasks
                                            </p>
                                        </div>

                                        <ListTodo size={20} />

                                    </div>


                                    <div className="overview-list">

                                    <div className="overview-list backlog-scroll-list">
                                        {tasks.map((task) => (
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
                                    </div>

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
                                            <h3>Modules</h3>
                                            <p>
                                                Project modules
                                            </p>
                                        </div>

                                        <Flag size={20} />
                                    </div>

                                    <div className="overview-list overview-modules-lest">
                                        {modulesLoading ? (
                                            <div className="overview-empty">
                                                Loading modules...
                                            </div>
                                        ) : projectModules.length === 0 ? (
                                            <div className="overview-empty">
                                                No modules created for this project.
                                            </div>
                                        ) : (
                                            projectModules.map((module) => (
                                                <div
                                                    className="overview-module-item"
                                                    key={module.id}
                                                >
                                                    {module.milestone_name || module.name || "Untitled Module"}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="overview-view-button"
                                        onClick={() =>
                                            navigate(`/projects/${id}/milestones`)
                                        }
                                    >
                                        View Modules →
                                    </button>

                                </div>
                            </div>

                        </div>
                        </div>
                    )}

                    {/* TEAM MEMBERS */}
                    {activeSection === "members" && (
                        <div className="members-scroll-content">
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
                                    setSelectedUsers("");
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
                                        `${memberUser?.first_name || ""} ${
                                            memberUser?.last_name || ""
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

                                            {/* MEMBER ROLE CHECKBOXES */}

                                            <div className="member-role-checkboxes">

                                                <label className="member-role-option">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(member.is_team_leader)}
                                                        onChange={(e) =>
                                                            handleMemberRoleChange(
                                                                member.id,
                                                                "is_team_leader",
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                    <span>Team Leader</span>
                                                </label>

                                                <label className="member-role-option">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(member.is_project_manager)}
                                                        onChange={(e) =>
                                                            handleMemberRoleChange(
                                                                member.id,
                                                                "is_project_manager",
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                    <span>Project Manager</span>
                                                </label>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    </div>
                    )}

                </main>
            </div>

            {/* PROJECT WORKSPACE LAYOUT */}
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
                                    setSelectedUsers([]);
                                    setShowAddMember(true);
                                }}
                            >
                                x
                            </button>
                        </div>

                        {/* MULTIPLE EMPLOYEE SECTION */}
                        <div className="member-form-group">

                            <label>Select Team Members</label>

                            <div className="member-selection-list">

                                {users.length === 0 ? (

                                    <p className="no-available-members">
                                        No employees found.
                                    </p>

                                ) : (

                                    users.map((user) => {

                                        const isAlreadyAssigned = assignedUserIds.has(
                                            String(user.id)
                                        );

                                        const isSelected = selectedUsers.includes(
                                            String(user.id)
                                        );

                                        const fullName =
                                            `${user.first_name || ""} ${user.last_name || ""}`.trim()
                                            || user.username
                                            || "Unknown User";

                                        const designation =
                                            typeof user.designation === "object"
                                                ? user.designation?.name ||
                                                user.designation?.designation_name
                                                : user.designation_name ||
                                                user.designation ||
                                                "No Designation";

                                        return (
                                            <label
                                                key={user.id}
                                                className={`member-selection-option ${
                                                    isAlreadyAssigned ? "assigned-member-option" : ""
                                                }`}
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={isAlreadyAssigned || isSelected}
                                                    disabled={isAlreadyAssigned}
                                                    onChange={(e) => {

                                                        const userId = String(user.id);

                                                        setSelectedUsers((previousUsers) =>
                                                            e.target.checked
                                                                ? [...previousUsers, userId]
                                                                : previousUsers.filter(
                                                                    (id) => id !== userId
                                                                )
                                                        );
                                                    }}
                                                />

                                                <div className="member-selection-info">

                                                    <strong>{fullName}</strong>

                                                    <span>{designation}</span>

                                                    <span>
                                                        {user.email || "Email not available"}
                                                    </span>

                                                </div>

                                                {isAlreadyAssigned ? (
                                                    <span className="member-assigned-badge">
                                                        Already Assigned
                                                    </span>
                                                ) : (
                                                    <span className="member-available-badge">
                                                        Available
                                                    </span>
                                                )}

                                            </label>
                                        );
                                    })

                                )}

                            </div>

                            <p className="selected-members-count">
                                {selectedUsers.length} employee(s) selected
                            </p>

                        </div>


                        <div className="member-modal-actions">

                            <button
                                type="button"
                                className="member-cancel-button"
                                onClick={() => {
                                    setShowAddMember(false);
                                    setSelectedUsers([]);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="member-add-button"
                                onClick={handleAddMember}
                                disabled={selectedUsers.length === 0}
                            >
                                Add {selectedUsers.length > 0
                                    ? `${selectedUsers.length} Members`
                                    : "Members"}
                            </button>
                        </div>
                    </div>

                </div>
            )}

        </div>

    );

};
export default ProjectDetails;
