import React, { useEffect, useState } from "react";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

import {
    FiActivity,
    FiClock,
    FiTrendingUp,
    FiTarget,
    FiDownload,
    FiRefreshCw
} from "react-icons/fi";

import { getAnalytics, getReports, createReport, deleteReport } from "../../services/reportService";


import "./Report.css";


const COLORS = [
    "#2463eb",
    "#60a5fa",
    "#93c5fd",
    "#cbd5e1",
    "#64748b",
    "#10b981"
];


const Reports = () => {

    const [analytics, setAnalytics] = useState(null);

    const [reports, setReports] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        report_type: "summary",
        description: ""
    });


    
    const fetchData = async () => {

        try {

            setLoading(true);
            setError("");

            const [analyticsData, reportsData] = await Promise.all([
                getAnalytics(),
                getReports()
            ]);

            setAnalytics(analyticsData);

            setReports(
                Array.isArray(reportsData)
                    ? reportsData
                    : reportsData.results || []
            );

        } catch (err) {

            console.error("Reports loading error:", err);

            setError(
                "Unable to load reports. Please check your API connection."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        fetchData();
    }, []);


   
    const handleCreateReport = async (e) => {

        e.preventDefault();

        try {

            await createReport(formData);

            setFormData({
                name: "",
                report_type: "summary",
                description: ""
            });

            setShowForm(false);

            await fetchData();

        } catch (err) {

            console.error("Create report error:", err);

            alert("Unable to create report.");

        }
    };


    
    const handleDeleteReport = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this report?"
        );

        if (!confirmDelete) return;

        try {

            await deleteReport(id);

            setReports(prev =>
                prev.filter(report => report.id !== id)
            );

        } catch (err) {

            console.error("Delete report error:", err);

            alert("Unable to delete report.");

        }
    };


    
    const exportCSV = () => {

        if (!analytics) return;

        const rows = [
            ["Metric", "Value"],

            [
                "Completion Rate",
                analytics.kpis.completion_rate + "%"
            ],

            [
                "Total Tasks",
                analytics.kpis.total_tasks
            ],

            [
                "Completed Tasks",
                analytics.kpis.completed_tasks
            ],

            [
                "Pending Tasks",
                analytics.kpis.pending_tasks
            ],

            [
                "Team Velocity",
                analytics.kpis.team_velocity
            ]
        ];

        const csvContent = rows
            .map(row =>
                row.map(value =>
                    `"${String(value).replace(/"/g, '""')}"`
                ).join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "pms-report.csv";

        link.click();

        URL.revokeObjectURL(url);
    };


    if (loading) {

        return (
            <div className="reports-loading">
                <FiRefreshCw className="loading-icon" />
                <p>Loading analytics...</p>
            </div>
        );
    }


    if (error) {

        return (
            <div className="reports-error">

                <h3>Error Loading Reports</h3>

                <p>{error}</p>

                <button onClick={fetchData}>
                    Retry
                </button>

            </div>
        );
    }


    if (!analytics) return null;


    const kpis = analytics.kpis;


    return (

        <div className="reports-page">

            <div className="reports-header">

                <div>

                    <h1>Analytics & Reports</h1>

                    <p>
                        Detailed insights into your team's performance
                    </p>

                </div>


                <div className="reports-header-actions">

                    <button
                        className="reports-refresh-btn"
                        onClick={fetchData}
                    >
                        <FiRefreshCw />
                        Refresh
                    </button>

                    <button
                        className="reports-export-btn"
                        onClick={exportCSV}
                    >
                        <FiDownload />
                        Export Report
                    </button>

                </div>

            </div>


            

            <div className="reports-kpi-grid">

                <div className="reports-kpi-card blue">

                    <div className="reports-kpi-icon">
                        <FiActivity />
                    </div>

                    <h2>
                        {kpis.completion_rate}%
                    </h2>

                    <p>Task Completion Rate</p>

                </div>


                <div className="reports-kpi-card purple">

                    <div className="reports-kpi-icon">
                        <FiClock />
                    </div>

                    <h2>
                        {kpis.average_response_time ?? "N/A"}
                    </h2>

                    <p>Average Response Time</p>

                </div>


                <div className="reports-kpi-card green">

                    <div className="reports-kpi-icon">
                        <FiTrendingUp />
                    </div>

                    <h2>
                        {kpis.team_velocity}
                    </h2>

                    <p>Team Velocity</p>

                </div>


                <div className="reports-kpi-card pink">

                    <div className="reports-kpi-icon">
                        <FiTarget />
                    </div>

                    <h2>
                        {kpis.sprint_success_rate ?? "N/A"}
                    </h2>

                    <p>Sprint Success Rate</p>

                </div>

            </div>



            <div className="reports-main-grid">


                
                <div className="reports-chart-card">

                    <div className="reports-card-header">

                        <div>

                            <h3>Monthly Progress</h3>

                            <p>Task creation trends</p>

                        </div>

                    </div>


                    <ResponsiveContainer width="100%" height={280}>

                        <AreaChart
                            data={analytics.monthly_progress}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="month"
                            />

                            <YAxis />

                            <Tooltip />

                            <Area
                                type="monotone"
                                dataKey="created"
                                name="Created Tasks"
                                stroke="#2563eb"
                                fill="#bfdbfe"
                                strokeWidth={2}
                            />

                        </AreaChart>

                    </ResponsiveContainer>

                </div>


              

                <div className="reports-chart-card">

                    <div className="reports-card-header">

                        <div>

                            <h3>Team Efficiency Trend</h3>

                            <p>Task distribution by status</p>

                        </div>

                    </div>


                    <ResponsiveContainer width="100%" height={280}>

                        <BarChart
                            data={analytics.tasks_by_status}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="status"
                            />

                            <YAxis />

                            <Tooltip />

                            <Bar
                                dataKey="total"
                                name="Tasks"
                                fill="#2563eb"
                                radius={[6, 6, 0, 0]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>


                

                <div className="reports-chart-card">

                    <div className="reports-card-header">

                        <div>

                            <h3>Tasks by Category</h3>

                            <p>Distribution across work categories</p>

                        </div>

                    </div>


                    <ResponsiveContainer width="100%" height={280}>

                        <BarChart
                            layout="vertical"
                            data={analytics.tasks_by_category}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                            />

                            <XAxis
                                type="number"
                            />

                            <YAxis
                                type="category"
                                dataKey="category"
                                width={100}
                            />

                            <Tooltip />

                            <Bar
                                dataKey="total"
                                name="Tasks"
                                fill="#2563eb"
                                radius={[0, 5, 5, 0]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>


                

                <div className="reports-chart-card">

                    <div className="reports-card-header">

                        <div>

                            <h3>Quick Insights</h3>

                            <p>Current project performance</p>

                        </div>

                    </div>


                    <div className="reports-insights">

                        <div className="insight-item">

                            <div className="insight-icon blue">
                                <FiTarget />
                            </div>

                            <div>

                                <h4>Task Completion</h4>

                                <p>
                                    {kpis.completed_tasks} tasks completed
                                    out of {kpis.total_tasks} total tasks.
                                </p>

                            </div>

                        </div>


                        <div className="insight-item">

                            <div className="insight-icon green">
                                <FiTrendingUp />
                            </div>

                            <div>

                                <h4>Team Velocity</h4>

                                <p>
                                    {kpis.team_velocity} completed tasks
                                    recorded.
                                </p>

                            </div>

                        </div>


                        <div className="insight-item">

                            <div className="insight-icon purple">
                                <FiActivity />
                            </div>

                            <div>

                                <h4>Pending Tasks</h4>

                                <p>
                                    {kpis.pending_tasks} tasks remain
                                    incomplete.
                                </p>

                            </div>

                        </div>


                        <div className="insight-item">

                            <div className="insight-icon orange">
                                <FiClock />
                            </div>

                            <div>

                                <h4>Performance Overview</h4>

                                <p>
                                    Overall task completion is
                                    {` ${kpis.completion_rate}% `}.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


        

                <div className="reports-chart-card">

                    <div className="reports-card-header">

                        <div>

                            <h3>Productivity Trends</h3>

                            <p>Tasks by status</p>

                        </div>

                    </div>


                    <ResponsiveContainer width="100%" height={280}>

                        <PieChart>

                            <Pie
                                data={analytics.tasks_by_status}
                                dataKey="total"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={100}
                                paddingAngle={3}
                            >

                                {analytics.tasks_by_status.map(
                                    (entry, index) => (

                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                COLORS[
                                                    index % COLORS.length
                                                ]
                                            }
                                        />

                                    )
                                )}

                            </Pie>

                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

            </div>


            

            <div className="reports-saved-section">

                <div className="reports-card-header">

                    <div>

                        <h3>Saved Reports</h3>

                        <p>Manage your generated reports</p>

                    </div>


                    <button
                        className="reports-create-btn"
                        onClick={() => setShowForm(true)}
                    >
                        + Create Report
                    </button>

                </div>


                {reports.length === 0 ? (

                    <div className="reports-empty">

                        <p>No saved reports available.</p>

                    </div>

                ) : (

                    <div className="reports-table-wrapper">

                        <table className="reports-table">

                            <thead>

                                <tr>

                                    <th>Report Name</th>

                                    <th>Type</th>

                                    <th>Description</th>

                                    <th>Created</th>

                                    <th>Action</th>

                                </tr>

                            </thead>


                            <tbody>

                                {reports.map(report => (

                                    <tr key={report.id}>

                                        <td>
                                            {report.name}
                                        </td>

                                        <td>
                                            {report.report_type}
                                        </td>

                                        <td>
                                            {report.description || "-"}
                                        </td>

                                        <td>
                                            {new Date(
                                                report.created_at
                                            ).toLocaleDateString()}
                                        </td>

                                        <td>

                                            <button
                                                className="reports-delete-btn"
                                                onClick={() =>
                                                    handleDeleteReport(
                                                        report.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            

            {showForm && (

                <div className="reports-modal-overlay">

                    <div className="reports-modal">

                        <div className="reports-modal-header">

                            <h2>Create Report</h2>

                            <button
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={handleCreateReport}>

                            <label>
                                Report Name
                            </label>

                            <input
                                type="text"
                                value={formData.name}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value
                                    })
                                }
                                required
                            />


                            <label>
                                Report Type
                            </label>

                            <select
                                value={formData.report_type}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        report_type: e.target.value
                                    })
                                }
                            >

                                <option value="project">
                                    Project Report
                                </option>

                                <option value="task">
                                    Task Report
                                </option>

                                <option value="team">
                                    Team Report
                                </option>

                                <option value="sprint">
                                    Sprint Report
                                </option>

                                <option value="productivity">
                                    Productivity Report
                                </option>

                                <option value="summary">
                                    Summary Report
                                </option>

                            </select>


                            <label>
                                Description
                            </label>

                            <textarea
                                value={formData.description}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value
                                    })
                                }
                            />


                            <div className="reports-modal-actions">

                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>

                                <button type="submit">
                                    Save Report
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

};


export default Reports;