import React, { useEffect, useState } from "react";
import api from "../../services/api";

import "./dashboards.css";

import {
    Search,
    Bell,
    FolderKanban,
    CircleCheck,
    TrendingUp,
    CircleAlert,
    MoreHorizontal,
    Plus,
    LayoutDashboard,
    Users,
    Filter,
    ArrowUpDown,
    Download,
    ChevronDown
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
    console.log("================= Dashboard Render ==============");
    
    const [projects, setProjects] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);

    const [showTotalProjects, setShowTotalProjects] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);

    const [selectedProject, setSelectedProject] = useState("null");
    const [selectedProgressProject, setSelectedProgressProject] = useState(null);
    const [projectTasks, setProjectTasks] = useState([]);

    const [selectedUser, setSelectedUser] = useState("");
    const [users, setUsers] = useState([]);
    const [savingMember, setSavingMember] = useState(false);

    const [filterStatus, setFilterStatus] = useState("all");
    const [sortBy, setSortBy] = useState("none");

    const [showFilterMenu, setShowFilterMenu] = useState(false)
    const [showSortMenu, setShowSortMenu] = useState(false);

    useEffect(() => {
        fetchProjects();
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchProjectTasks = async () => {

            if (!selectedProgressProject?.id) {
                setProjectTasks([]);
                return;
            }

            try {
                const response = await api.get("tasks/");

                console.log("========== PROJECT TASK DEBUG ==========");
                console.log("SELECTED PROJECT:", selectedProgressProject);
                console.log("SELECTED PROJECT ID:", selectedProgressProject.id);
                console.log("RAW TASK RESPONSE:", response.data);

                // Handle normal array OR DRF pagination
                const allTasks = Array.isArray(response.data)
                    ? response.data
                    : response.data.results || [];

                console.log("ALL TASKS:", allTasks);

                const selectedProjectId = Number(
                    selectedProgressProject.id
                );

                const selectedTasks = allTasks.filter((task) => {
                    let taskProjectId = null;

                    // Case 1:
                    // { project: 14 }
                    if (
                        task.project !== null &&
                        task.project !== undefined &&
                        typeof task.project !== "object"
                    ) {
                        taskProjectId = Number(task.project);
                    }

                    // Case 2:
                    // { project_id: 14 }
                    if (
                        taskProjectId === null &&
                        task.project_id !== null &&
                        task.project_id !== undefined
                    ) {
                        taskProjectId = Number(task.project_id);
                    }

                    // Case 3:
                    // { project: { id: 14, ... } }
                    if (
                        taskProjectId === null &&
                        task.project &&
                        typeof task.project === "object"
                    ) {
                        taskProjectId = Number(task.project.id);
                    }

                    console.log(
                        "TASK:",
                        task,
                        "TASK PROJECT ID:",
                        taskProjectId,
                        "SELECTED PROJECT ID:",
                        selectedProjectId
                    );

                    return taskProjectId === selectedProjectId;
                });

                console.log(
                    "SELECTED PROJECT TASKS:",
                );

                console.log(selectedTasks);

                setProjectTasks(selectedTasks);

            } catch (error) {
                
                console.error(
                    "FAILED TO FETCH TASKS:",
                    error.response?.data || error
                );

                setProjectTasks([]);
            }
        };

        fetchProjectTasks();
    }, [selectedProgressProject]);




    const fetchProjects = async () => {
        try {
            const response = await api.get("projects/");

            console.log("ALL PROJECTS:", response.data);

            const projectData = response.data;
            // Store projects
            setProjects(projectData);

            // Store all team members
            const allMembers = [];

            for (const project of projectData) {

                try {

                    const memberResponse = await api.get(
                        `projects/${project.id}/members/`
                    );

                    console.log(
                        `MEMBERS FOR PROJECT ${project.id}:`,
                        memberResponse.data 
                    );

                    allMembers.push(...memberResponse.data);
                } catch (error) {

                    console.error(
                        `Failed to fetch members for project ${project.id}:`,
                        error
                    );
                }
            }
            setTeamMembers(allMembers);

            console.log("ALL TEAM MEMBERS:", allMembers);

            
        } catch (error) {
            console.error(
                "Dashboard project fetch error:", 
                error
            );
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get("users/");

            console.log("ALL USERS:", response.data);

            setUsers(response.data);
        } catch (error) {

            console.error(
                "Failed to fetch users:",
                error
            );
        }
    };

    const handleAddMember = async () => {
        if (!selectedProject) {
            alert("Please select a project.");
            return;
        }

        if (!selectedUser) {
            alert("Please select a user.");
            return;
        }

        try {
            setSavingMember(true);

            console.log("ADDING TEAM MEMBER:");
            console.log("Project ID:", selectedProject);
            console.log("User ID:", selectedUser);

            const response = await api.post(
                `projects/${selectedProject}/members/`,
                {
                    project: Number(selectedProject),
                    user: Number(selectedUser),
                }
            );

            console.log("ADD MEMBER RESPONSE:", response.data);

            alert("Team member added successfully.");

            setSelectedProject("");
            setSelectedUser("");
            setShowAddMember(false);

            // Refresh team members
            await fetchProjects();

        } catch (error) {
            console.error("========== ADD MEMBER ERROR ==========");
            console.error("Status:", error.response?.status);
            console.error("URL:", error.config?.url);
            console.error("Response:", error.response?.data);
            console.error("Full error:", error);
            console.error("======================================");

            alert(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                JSON.stringify(error.response?.data) ||
                "Failed to add team member."
            );
        } finally {
            setSavingMember(false);
        }
    };

    const totalProjects = projects.length;

    // ===============================
    // PROJECT STATUS COUNTS
    // ===============================

    const getProjectStatus = (project) => {
        return String(project.status || "")
            .toLowerCase()
            .replace(/[-_]/g, " ")
            .trim();
    };

    const completedProjects = projects.filter(
        (project) => getProjectStatus(project) === "completed"
    );

    const completedProjectCount = completedProjects.length;

    const runningProjects = projects.filter((project) => {
        const status = getProjectStatus(project);

        return (
            status === "in progress" ||
            status === "running"
        );
    }).length;

    const pendingProjects = projects.filter((project) => {
        const status = getProjectStatus(project);

        return (
            status === "pending" ||
            status === "not started" ||
            status === "stopped"
        );
    }).length;


    // ===============================
    // ON TIME / DELAYED PROJECTS
    // ===============================

    const onTimeProjects = completedProjects.filter((project) => {
        if (!project.end_date || !project.completed_at) {
            return false;
        }

        const completedDate = new Date(project.completed_at);
        const deadlineDate = new Date(project.end_date);

        if (
            Number.isNaN(completedDate.getTime()) ||
            Number.isNaN(deadlineDate.getTime())
        ) {
            return false;
        }

        return completedDate <= deadlineDate;
    });

    const delayedProjects = completedProjects.filter((project) => {
        if (!project.end_date || !project.completed_at) {
            return false;
        }

        const completedDate = new Date(project.completed_at);
        const deadlineDate = new Date(project.end_date);

        if (
            Number.isNaN(completedDate.getTime()) ||
            Number.isNaN(deadlineDate.getTime())
        ) {
            return false;
        }

        return completedDate > deadlineDate;
    });

    const onTimeProjectCount = onTimeProjects.length;
    const delayedProjectCount = delayedProjects.length;


    // ===============================
    // PROJECT PROGRESS CALCULATION
    // ===============================

    const getTaskStatus = (task) => {
        return String(task.status || "")
            .toLowerCase()
            .replace(/[-_]/g, " ")
            .trim();
    };

    const completedTasks = projectTasks.filter((task) => {
        return getTaskStatus(task) === "completed";
    }).length;

    const inProgressTasks = projectTasks.filter((task) => {
        const status = getTaskStatus(task);

        return (
            status === "in progress" ||
            status === "running"
        );
    }).length;

    const pendingTasks = projectTasks.filter((task) => {
        const status = getTaskStatus(task);

        return (
            status === "pending" ||
            status === "not started" ||
            status === ""
        );
    }).length;

    const totalTasks = projectTasks.length;

    const actualProjectProgress =
        totalTasks > 0
            ? Math.round(
                (completedTasks / totalTasks) * 100
            )
            : 0;

    console.log("DASHBOARD PROJECT COUNTS:", {
        totalProjects,
        completedProjectCount,
        runningProjects,
        pendingProjects,
        onTimeProjectCount,
        delayedProjectCount
    });

    console.log("PROJECT PROGRESS:", {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        actualProjectProgress
    });

    const filteredProjects = projects.filter((project) => {
        if (filterStatus === "all") {
            return true;
        }

        const status = String(project.status || "")
            .toLowerCase()
            .replace(/[-_]/g, " ")
            .trim();

        if (filterStatus === "completed") {
            return status === "completed";
        }

        if (filterStatus === "running") {
            return (
                status === "running" ||
                status === "in progress"
            );
        }

        if (filterStatus === "pending") {
            return (
                status === "pending" ||
                status === "not started" ||
                status === "stopped"
            );
        }

        return true;
    });

    const displayedProjects = [...filteredProjects].sort((a, b) => {
        if (sortBy === "name") {
            return (a.project_name || "").localeCompare(
                b.project_name || ""
            );
        }

        if (sortBy === "start_date") {

            return new Date(a.start_date || 0) - 
                new Date(b.start_date || 0);
        }

        if (sortBy === "end_date") {
            return new Date(a.end_date || 0) -
                new Date(b.end_date || 0);
        }

        if (sortBy === "status") {

            return (a.status || "").localeCompare(
                b.status || ""
            );
        }
        return 0;
    });

    // PROJECTS CUMULATIVE

    const getCompletedProjectsCumulative = (projects) => {
        const currentYear = new Date().getFullYear();

        const monthlyCounts = Array(12).fill(0);

        projects.forEach((project) => {
            if (!project.end_date) {
                return;
            }

            const completionDate = new Date(project.end_date);

            if (Number.isNaN(completionDate.getTime())) {
                return;
            }

            // Only completed projects
            if (completionDate > new Date()) {
                return;
            }

            // Only current year
            if (completionDate.getFullYear() !== currentYear) {
                return;
            }

            const month = completionDate.getMonth();

            monthlyCounts[month] += 1;
        });


        let cumulative = 0;

        return monthlyCounts.map((count, index) => {

            cumulative += count;

            return {
                month: new Date(
                    currentYear,
                    index,
                    1
                ).toLocaleString("en-US", {
                    month: "short",
                }),

                completed: cumulative,
            };
        });
    };

    const completedProjectsData = 
        getCompletedProjectsCumulative(projects);

    /* =========================
       MONTH DATA FOR ANALYTICS
    ========================= */

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    const monthCounts = months.map((_, index) => {
        return projects.filter((project) => {

            if (!project.start_date) return false;

            const date = new Date(project.start_date);

            return date.getMonth() === index;

        }).length;
    });

    const maxMonthCount = Math.max(...monthCounts, 1);

    /* =========================
       TEAM / PROJECT DATA
    ========================= */

    const recentProjects = projects.slice(0, 5);

    // EXPORT FUNCTION

    const handleExport = () => {

        if (displayedProjects.length === 0){
            alert("No projects available to export. ");
            return;
        }

        const headers = [
            "Id",
            "Project Name",
            "Start Date",
            "End Date",
            "status"
        ];

    const rows = displayedProjects.map((project, index) => [
        project.id || index + 1,
        project.project_name || "",
        project.start_date || "",
        project.end_date || "",
        project.status || ""
    ]);

    const csvContent = [
        headers,
        ...rows
    ]
        .map((row) => 
            row
                .map((value) =>
                    `"${String(value).replace(/"/g, '""')}"`
                )
                .join(",")
        )
        .join("/n");
    
    const blob = new Blob(
        [csvContent],
        {
            type: "text/csv;chardet=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "projects.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

    console.log("=====================BEFORE DASHBOARD RETURN");

    return (

        <div className="dashboard-page">

            {/* =================================
                HEADER
            ================================= */}

            <div className="dashboard-header">

                <div className="dashboard-heading">

                    <h1>
                        <LayoutDashboard 
                            size={22}
                            color="#D9A21B"
                        />
                        Dashboard</h1>

                    <p>
                        Monitor all of your projects and tasks here
                    </p>

                </div>


                <div className="dashboard-header-right">

                    {/* SEARCH */}

                    <div className="dashboard-search">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search anything"
                        />

                    </div>


                    {/* NOTIFICATION */}

                    <button
                        type="button"
                        className="dashboard-notification"
                        title="Notification"
                    >
                        <Bell size={19} />
                    </button>


                    {/* AVATAR */}

                    <div className="dashboard-avatar">
                        U
                    </div>

                </div>

            </div>


            {/* =================================
                DASHBOARD CONTENT
            ================================= */}

            <div className="dashboard-content">


                {/* =================================
                    TOP SECTION
                ================================= */}

                <div className="dashboard-top-grid">


                    {/* =============================
                        STATISTICS
                    ============================= */}

                    <div className="dashboard-stats">


                        {/* TOTAL */}

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <p>Total Project</p>

                                <button className="card-more">
                                    <MoreHorizontal size={17} />
                                </button>

                            </div>

                            <h2>{totalProjects}</h2>

                            <div className="stat-bottom">

                                <span className="stat-icon total-icon">
                                    <FolderKanban size={20} />
                                </span>

                            </div>
                        </div>


                        {/* COMPLETED */}

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <p>Completed Projects</p>

                                <button className="card-more">
                                    <MoreHorizontal size={17} />
                                </button>

                            </div>

                            <h2>{completedProjects}</h2>

                            <div className="stat-bottom">

                                <span className="stat-icon completed-icon">
                                    <CircleCheck size={20} />
                                </span>

                            </div>

                        </div>


                        {/* RUNNING */}

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <p>Running Project</p>

                                <button className="card-more">
                                    <MoreHorizontal size={17} />
                                </button>

                            </div>

                            <h2>{runningProjects}</h2>

                            <div className="stat-bottom">

                                <span className="stat-icon running-icon">
                                    <TrendingUp size={20} />
                                </span>

                            </div>

                        </div>


                        {/* PENDING */}

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <p>Pending Projects</p>

                                <button className="card-more">
                                    <MoreHorizontal size={17} />
                                </button>

                            </div>

                            <h2>{pendingProjects}</h2>

                            <div className="stat-bottom">

                                <span className="stat-icon pending-icon">
                                    <CircleAlert size={20} />
                                </span>

                            </div>

                        </div>

                        {/* ON TIME  */}
                        <div className="stat-card">

                            <div className="stat-card-top">
                                <p>On Time Projects</p>

                                <button className="card-more">
                                    <MoreHorizontal size={17} />
                                </button>                                                   
                            </div>

                            <h2>{onTimeProjectCount}</h2>

                            <div className="stat-bottom">

                                <span className="stat-icon on-time-icon">
                                    <CircleCheck size={20} />
                                </span>
                            </div>
                        </div>

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <p>Delayed Projects</p>

                                <button className="card-more">
                                    <MoreHorizontal size={17} />
                                </button>
                            </div>

                            <h2>{delayedProjectCount}</h2>

                            <div className="stat-bottom">

                                <span className="stat-icon delayed-icon">
                                    <CircleAlert size={20} />
                                </span>
                            </div>
                        </div>

                    </div>


                    {/* =============================
                        PROJECT ANALYTICS
                    ============================= */}

                    <div className="dashboard-chart-card">

                        <div className="dashboard-chart-header">
                            <div>
                                <h2>Completed Projects - Cumulative</h2>
                                <p>
                                    Cumulative number of projects completed
                                </p>
                            </div>
                        </div>


                        <div className="dashboard-line-chart">

                            <ResponsiveContainer
                                width="100%"
                                height={280}
                            >

                                <LineChart
                                    data={completedProjectsData}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 5,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="month"
                                        tick={{
                                            fontSize: 10,
                                            fill: "#6b7280",
                                        }}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                        tickCount={10}
                                        tick={{
                                            fontSize: 10,
                                            fill: "#6b7280",
                                        }}

                                    />

                                    <Tooltip />

                                    <Line
                                        type="monotone"
                                        dataKey="completed"
                                        name="Completed Projects"
                                        stroke="#6c55e8"
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                        }}
                                        activeDot={{
                                            r: 6,
                                        }}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>


                {/* =================================
                    BOTTOM SECTION
                ================================= */}

                {/* =================================
                    PROJECTS + PROJECT PROGRESS
                ================================= */}

                <div className="dashboard-project-section">

                    {/* =================================
                        PROJECT LIST
                    ================================= */}

                    <div className="dashboard-table-card dashboard-project-list-card">

                        <div className="table-header">

                            <div className="table-title">
                                <div className="table-icon">
                                    <FolderKanban size={18} />
                                </div>

                                <strong>
                                    Total Projects: {totalProjects}
                                </strong>
                            </div>

                        </div>

                        <div className="project-table-wrapper">

                            <table className="project-table">

                                <thead>
                                    <tr>
                                    
                                        <th>Project Name</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {displayedProjects.length > 0 ? (

                                        displayedProjects.map((project, index) => (

                                            <tr
                                                key={project.id || index}
                                                className={
                                                    selectedProgressProject?.id === project.id
                                                        ? "selected-project-row"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setSelectedProgressProject(project)
                                                }
                                            >


                                                <td>
                                                    {project.project_name || "-"}
                                                </td>

                                                <td>
                                                    {project.start_date || "-"}
                                                </td>

                                                <td>
                                                    {project.end_date || "-"}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`table-status ${
                                                            project.status
                                                                ?.toLowerCase()
                                                                .replace(/\s+/g, "-")
                                                        }`}
                                                    >
                                                        {project.status || "-"}
                                                    </span>
                                                </td>

                                            </tr>

                                        ))

                                    ) : (

                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="no-projects"
                                            >
                                                No projects available
                                            </td>
                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>


                    {/* =================================
                        PROJECT PROGRESS
                    ================================= */}

                    <div className="project-progress-card dashboard-project-progress-card">

                        <div className="section-header">

                            <div>
                                <h2>Project Progress</h2>

                                <span className="selected-project-name">
                                    {selectedProgressProject
                                        ? selectedProgressProject.project_name
                                        : "Select a project"}
                                </span>
                            </div>

                        </div>


                        <div className="project-progress-content">

                            <div
                                className="progress-circle"
                                style={{
                                    background: 
                                        totalTasks > 0 
                                        ? `conic-gradient(
                                            #12b76a 0% ${
                                                (completedTasks / totalTasks) * 100
                                            }%,

                                            #f79009 ${
                                                (completedTasks / totalTasks) * 100

                                            }% ${
                                                ((completedTasks + inProgressTasks) / totalTasks) * 100
                                            }%,

                                            #d0d5dd ${
                                                ((completedTasks + inProgressTasks) / totalTasks) * 100
                                            }% 100%
                                        
                                        )`
                                        : "#e4e7ec"                    
                                }}
                            >
                                <div className="progress-circle-inner">
                                    <span>{actualProjectProgress}%</span>

                                    <small>Progress</small>
                                </div>
                            </div>


                            <div className="progress-details">

                                <p>
                                    <span className="progress-dot completed-dot"></span>
                                    <span>Complete</span>
                                    <strong>{completedTasks}</strong>
                                </p>

                                <p>
                                    <span className="progress-dot running-dot"></span>
                                    <span>In Progress</span>
                                    <strong>{inProgressTasks}</strong>
                                </p>

                                <p>
                                    <span className="progress-dot pending-dot"></span>
                                    <span>Incomplete</span>
                                    <strong>{pendingTasks}</strong>
                                </p>

                            </div>

                        </div>

                    </div>

                </div>
                
            </div>

        </div>
    );
};

export default Dashboard;