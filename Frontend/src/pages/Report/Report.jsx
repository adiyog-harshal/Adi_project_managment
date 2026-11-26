
import React, { useEffect, useState } from "react";
import {
    FileSpreadsheet,
    FileText,
    BarChart3,
    RefreshCw,
    Filter,
    CheckCircle2,
    Clock3,
    Hourglass,
    Layers,
    Users,
    AlertTriangle
} from "lucide-react";
import api from "../../services/api";
import "./Report.css";

const reportTypes = [
    {
        value: "projects",
        label: "Project Status",
        description: "Project dates, status and task completion"
    },
    {
        value: "tasks",
        label: "Task Report",
        description: "Task status, priority and overdue tasks"
    },
    {
        value: "sprints",
        label: "Sprint Progress",
        description: "Sprint progress and task completion"
    },
    {
        value: "workload",
        label: "Team Workload",
        description: "Employee assignments and workload"
    }
];

const statusOptions = ["To Do", "In Progress", "Completed", "On Hold"];

const emptyFilters = {
    project: "",
    sprint: "",
    status: "",
    assigned_to: "",
    date_from: "",
    date_to: ""
};

const getNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const normalize = (value) =>
    String(value || "").toLowerCase().trim();

const countStatus = (rows, statuses) =>
    rows.filter((row) =>
        statuses.includes(normalize(row.status))
    ).length;

const sumField = (rows, field) =>
    rows.reduce((total, row) => total + getNumber(row[field]), 0);

const Report = () => {
    const [reportType, setReportType] = useState("projects");

    const [options, setOptions] = useState({
        projects: [],
        sprints: [],
        employees: []
    });

    const [filters, setFilters] = useState({ ...emptyFilters });
    const [appliedFilters, setAppliedFilters] = useState({ ...emptyFilters });

    const [rows, setRows] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const response = await api.get("reports/options/");

                setOptions({
                    projects: response.data.projects || [],
                    sprints: response.data.sprints || [],
                    employees: response.data.employees || []
                });
            } catch (err) {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load report filter options."
                );
            }
        };

        loadOptions();
    }, []);

    useEffect(() => {
        const loadReport = async () => {
            setLoading(true);
            setError("");

            try {
                const params = {
                    report_type: reportType,
                    ...appliedFilters
                };

                Object.keys(params).forEach((key) => {
                    if (params[key] === "") delete params[key];
                });

                const response = await api.get("reports/", { params });

                setRows(response.data.rows || []);
                setCount(response.data.count || 0);
            } catch (err) {
                console.error("Report API Error:", err);
                console.error("Response:", err.response?.data);

                setRows([]);
                setCount(0);

                setError(
                    err.response?.data?.error ||
                    err.response?.data?.detail ||
                    `Unable to generate report. Status: ${
                        err.response?.status || "Network Error"
                    }`
                );
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, [reportType, appliedFilters]);

    const updateFilter = (name, value) => {
        setFilters((current) => ({
            ...current,
            [name]: value,
            ...(name === "project" ? { sprint: "" } : {})
        }));
    };

    const applyFilters = (event) => {
        event.preventDefault();

        if (
            filters.date_from &&
            filters.date_to &&
            filters.date_from > filters.date_to
        ) {
            setError("Start date cannot be after end date.");
            return;
        }

        setAppliedFilters({ ...filters });
    };

    const resetFilters = () => {
        setFilters({ ...emptyFilters });
        setAppliedFilters({ ...emptyFilters });
        setError("");
    };

    const exportReport = async (format) => {
        setExporting(format);
        setError("");

        try {
            const params = {
                report_type: reportType,
                export_format: format,
                ...appliedFilters
            };

            Object.keys(params).forEach((key) => {
                if (params[key] === "") delete params[key];
            });

            const response = await api.get("reports/", {
                params,
                responseType: "blob"
            });

            const mimeType = format === "excel"
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "application/pdf";

            const blob = new Blob([response.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `${reportType}_report.${
                format === "excel" ? "xlsx" : "pdf"
            }`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Report export error:", err);
            setError("Export failed. Please try again.");
        } finally {
            setExporting("");
        }
    };

    const visibleSprints = options.sprints.filter((sprint) =>
        !filters.project ||
        String(sprint.project_id) === String(filters.project)
    );

    const showTaskFilters = ["tasks", "sprints", "workload"].includes(reportType);
    const showSprintFilter = ["tasks", "sprints"].includes(reportType);
    const showAssigneeFilter = ["tasks", "sprints", "workload"].includes(reportType);

    const formatHeading = (key) =>
        key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

    const selectedReport = reportTypes.find(
        (item) => item.value === reportType
    );

    // Calculate summary cards from the actual API rows.
    const getSummaryCards = () => {
        if (reportType === "workload") {
            return [
                {
                    label: "Team Members",
                    value: count,
                    icon: Users,
                    color: "purple"
                },
                {
                    label: "Completed Tasks",
                    value: sumField(rows, "completed_tasks"),
                    icon: CheckCircle2,
                    color: "green"
                },
                {
                    label: "In Progress",
                    value: sumField(rows, "in_progress_tasks"),
                    icon: Clock3,
                    color: "blue"
                },
                {
                    label: "Pending Tasks",
                    value: sumField(rows, "pending_tasks"),
                    icon: Hourglass,
                    color: "orange"
                }
            ];
        }

        const completed = countStatus(rows, ["completed"]);
        const inProgress = countStatus(rows, ["in progress"]);
        const pending = reportType === "projects"
            ? countStatus(rows, ["planning", "on hold"])
            : reportType === "sprints"
                ? countStatus(rows, ["planned", "cancelled"])
                : countStatus(rows, ["to do", "on hold"]);

        const totalLabel = {
            projects: "Total Projects",
            tasks: "Total Tasks",
            sprints: "Total Sprints"
        }[reportType];

        return [
            {
                label: totalLabel,
                value: count,
                icon: Layers,
                color: "purple"
            },
            {
                label: "Completed",
                value: completed,
                icon: CheckCircle2,
                color: "green"
            },
            {
                label: "In Progress",
                value: inProgress,
                icon: Clock3,
                color: "blue"
            },
            {
                label: reportType === "projects" ? "Planning / On Hold" : "Pending",
                value: pending,
                icon: Hourglass,
                color: "orange"
            }
        ];
    };

    const summaryCards = getSummaryCards();

    // Display colored status and priority labels.
    const renderBadge = (value, type = "status") => {
        const normalized = normalize(value).replace(/\s+/g, "-");

        return (
            <span className={`report-badge ${type}-${normalized}`}>
                {value}
            </span>
        );
    };

    // Display completion as a progress bar.
    const renderProgress = (value) => {
        const numericValue = Math.min(
            100,
            Math.max(0, getNumber(String(value).replace("%", "")))
        );

        return (
            <div className="report-progress">
                <div className="report-progress-track">
                    <div
                        className={`report-progress-fill ${
                            numericValue === 100 ? "complete" : ""
                        }`}
                        style={{ width: `${numericValue}%` }}
                    />
                </div>
                <span>{numericValue}%</span>
            </div>
        );
    };

    const renderCell = (key, value) => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        if (key === "status") {
            return renderBadge(value, "status");
        }

        if (key === "priority") {
            return renderBadge(value, "priority");
        }

        if (key === "completion") {
            return renderProgress(value);
        }

        if (key === "overdue_days" && getNumber(value) > 0) {
            return (
                <span className="report-overdue">
                    <AlertTriangle size={13} />
                    {value} days
                </span>
            );
        }

        return String(value);
    };

    return (
        <div className="report-page">
            <div className="report-header">
                <div className="report-heading">
                    <BarChart3 size={27} />
                    <div>
                        <h2>Reports</h2>
                        <p>Generate, review and export project management reports.</p>
                    </div>
                </div>
            </div>

            <section className="report-type-section">
                <div className="report-section-heading">
                    <h3>Select Report</h3>
                    <span>Choose the information you want to review</span>
                </div>

                <div className="report-type-grid">
                    {reportTypes.map((item) => (
                        <button
                            type="button"
                            key={item.value}
                            className={`report-type-card ${
                                reportType === item.value ? "selected" : ""
                            }`}
                            onClick={() => setReportType(item.value)}
                        >
                            <span className="report-type-icon">
                                <BarChart3 size={20} />
                            </span>
                            <span className="report-type-content">
                                <strong>{item.label}</strong>
                                <small>{item.description}</small>
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="report-filter-section">
                <div className="report-section-heading">
                    <div className="report-filter-title">
                        <Filter size={18} />
                        <h3>Report Filters</h3>
                    </div>
                    <span>Apply filters to refine your report</span>
                </div>

                <form onSubmit={applyFilters}>
                    <div className="report-filter-grid">
                        <label>
                            <span>Project</span>
                            <select
                                value={filters.project}
                                onChange={(e) => updateFilter("project", e.target.value)}
                            >
                                <option value="">All Projects</option>
                                {options.projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {showSprintFilter && (
                            <label>
                                <span>Sprint</span>
                                <select
                                    value={filters.sprint}
                                    onChange={(e) => updateFilter("sprint", e.target.value)}
                                >
                                    <option value="">All Sprints</option>
                                    {visibleSprints.map((sprint) => (
                                        <option key={sprint.id} value={sprint.id}>
                                            {sprint.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}

                        {showTaskFilters && (
                            <label>
                                <span>Task Status</span>
                                <select
                                    value={filters.status}
                                    onChange={(e) => updateFilter("status", e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}

                        {showAssigneeFilter && (
                            <label>
                                <span>Assigned Employee</span>
                                <select
                                    value={filters.assigned_to}
                                    onChange={(e) => updateFilter("assigned_to", e.target.value)}
                                >
                                    <option value="">All Employees</option>
                                    {options.employees.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}

                        <label>
                            <span>From Date</span>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => updateFilter("date_from", e.target.value)}
                            />
                        </label>

                        <label>
                            <span>To Date</span>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => updateFilter("date_to", e.target.value)}
                            />
                        </label>
                    </div>

                    <div className="report-filter-actions">
                        <button
                            type="button"
                            className="report-reset-button"
                            onClick={resetFilters}
                        >
                            <RefreshCw size={15} />
                            Reset
                        </button>
                        <button type="submit" className="report-apply-button">
                            <Filter size={15} />
                            Apply Filters
                        </button>
                    </div>
                </form>
            </section>

            <section className="report-preview-section">
                <div className="report-preview-header">
                    <div>
                        <h3>{selectedReport?.label} Report</h3>
                        <p>{selectedReport?.description}</p>
                    </div>

                    <div className="report-export-actions">
                        <button
                            type="button"
                            className="report-excel-button"
                            onClick={() => exportReport("excel")}
                            disabled={loading || exporting !== ""}
                        >
                            <FileSpreadsheet size={16} />
                            {exporting === "excel" ? "Exporting..." : "Excel"}
                        </button>

                        <button
                            type="button"
                            className="report-pdf-button"
                            onClick={() => exportReport("pdf")}
                            disabled={loading || exporting !== ""}
                        >
                            <FileText size={16} />
                            {exporting === "pdf" ? "Exporting..." : "PDF"}
                        </button>
                    </div>
                </div>

                {/* Dynamic summary cards */}
                <div className="report-summary-grid">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                className={`report-summary-card ${card.color}`}
                                key={card.label}
                            >
                                <div className="report-summary-top">
                                    <span>{card.label}</span>
                                    <div className="report-summary-icon">
                                        <Icon size={19} />
                                    </div>
                                </div>
                                <strong>{card.value}</strong>
                            </div>
                        );
                    })}
                </div>

                <div className="report-result-summary">
                    <span>
                        {loading ? "Generating report..." : `${count} records found`}
                    </span>
                    <button
                        type="button"
                        className="report-refresh-button"
                        onClick={() => setAppliedFilters({ ...filters })}
                        disabled={loading}
                        title="Refresh report"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                {error && <div className="report-error">{error}</div>}

                <div className="report-table-container">
                    {loading ? (
                        <div className="report-empty-state">Loading report data...</div>
                    ) : rows.length === 0 ? (
                        <div className="report-empty-state">
                            No records found for the selected filters.
                        </div>
                    ) : (
                        <table className="report-table">
                            <thead>
                                <tr>
                                    {Object.keys(rows[0]).map((key) => (
                                        <th key={key}>{formatHeading(key)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={index}>
                                        {Object.keys(rows[0]).map((key) => (
                                            <td key={key}>
                                                {renderCell(key, row[key])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="report-table-footer">
                    <span>{count} total records</span>
                    <span>Export includes the currently applied filters.</span>
                </div>
            </section>
        </div>
    );
};

export default Report;
