import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, CalendarDays, Layers } from "lucide-react";
import api from "../../services/api";
import "./sprints.css";

const Sprints = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sprints, setSprints] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedSprint, setSelectedSprint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [saving, setSaving] = useState(false);
    const [showAddTasks, setShowAddTasks] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [assigningTasks, setAssigningTasks] = useState(false);
    const [editingSprintId, setEditingSprintId] = useState(null);

    const [error, setError] = useState("");

    const [sprintForm, setSprintForm] = useState({
        sprint_name: "",
        goal: "",
        milestone: "",
        start_date: "",
        end_date: "",
        status: "Planned"
    });

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [sprintResponse, taskResponse] = await Promise.all([
                api.get("sprints/"),
                api.get("tasks/")
            ]);

            const sprintData = Array.isArray(sprintResponse.data)
                ? sprintResponse.data
                : sprintResponse.data.results || [];

            const taskData = Array.isArray(taskResponse.data)
                ? taskResponse.data
                : taskResponse.data.results || [];

            const projectSprints = sprintData.filter(
                sprint => String(
                    typeof sprint.project === "object"
                        ? sprint.project.id
                        : sprint.project
                ) === String(id)
            );

            const projectTasks = taskData.filter(
                task => String(
                    typeof task.project === "object"
                        ? task.project.id
                        : task.project
                ) === String(id)
            );

            setSprints(projectSprints);
            setTasks(projectTasks);

            setSelectedSprint(current => {
                if (current) {
                    const stillExists = projectSprints.find(
                        sprint => sprint.id === current.id
                    );
                    if (stillExists) return stillExists;
                }
                return projectSprints[0] || null;
            });
        } catch (err) {
            console.error("Failed to load sprints:", err.response?.data || err);
            setError(
                err.response?.status === 401
                    ? "Your session may have expired. Please log in again."
                    : "Could not load sprints. Check the backend and API routes."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);


    const handleCreateSprint = async (e) => {
        e.preventDefault();
        setError("");

        if (sprintForm.end_date < sprintForm.start_date) {
            setError("End date cannot be earlier than start date.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                sprint_name: sprintForm.sprint_name.trim(),
                goal: sprintForm.goal.trim(),
                project: Number(id),
                milestone: sprintForm.milestone
                    ? Number(sprintForm.milestone)
                    : null,
                start_date: sprintForm.start_date,
                end_date: sprintForm.end_date,
                status: sprintForm.status,
            };

            if (editingSprintId !== null) {
                await api.put(
                    `sprints/${editingSprintId}/`,
                    payload
                );
            } else {
                await api.post("sprints/", payload);
            }

            setShowForm(false);
            setEditingSprintId(null);

            setSprintForm({
                sprint_name: "",
                goal: "",
                milestone: "",
                start_date: "",
                end_date: "",
                status: "Planned",
            });

            await loadData();

        } catch (err) {
            console.error(
                "Save sprint error:",
                err.response?.data || err
            );

            setError(
                JSON.stringify(
                    err.response?.data || "Failed to save sprint."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const handleAssignTasks = async () => {
        if (!selectedSprint) {
            setError("Please select a sprint first.");
            return;
        }

        if (selectedTaskIds.length === 0) {
            setError("Please select at least one task.");
            return;
        }

        try {
            setAssigningTasks(true);
            setError("");

            await api.post(
                `sprints/${selectedSprint.id}/tasks/`,
                {
                    task_ids: selectedTaskIds
                }
            );

            setShowAddTasks(false);
            setSelectedTaskIds([]);

            // Reload tasks and sprint task counts from the backend
            await loadData();
        } catch (err) {
            console.error(
                "Failed to assign tasks:",
                err.response?.data || err
            );

            const data = err.response?.data;
            setError(
                typeof data === "string"
                    ? data
                    : data
                        ? JSON.stringify(data)
                        : "Failed to add tasks to this sprint."
            );
        } finally {
            setAssigningTasks(false);
        }
    };

    const sprintTasks = tasks.filter(task =>
        String(
            typeof task.sprint === "object"
                ? task.sprint?.id
                : task.sprint
        ) === String(selectedSprint?.id)
    );

    const getTaskStatus = task => {
        const status = (task.status || "").toLowerCase().replace(/_/g, " ");
        if (status === "completed" || status === "done") return "Completed";
        if (status === "in progress" || status === "in review") return "In Progress";
        return "To Do";
    };

    const columns = ["To Do", "In Progress", "Completed"];

    if (loading) {
        return <div className="sprints-page"><p>Loading sprints...</p></div>;
    }

    const handleStartSprint = async (sprintId) => {
        try {
            await api.post(`sprints/${sprintId}/start/`);

            // Refresh sprint list after starting
            await fetchSprints();
        } catch (error) {
            alert(
                error.response?.data?.detail ||
                "Unable to start sprint."
            );
        }
    };

    return (
        <div className="sprints-page">
            <button
                className="sprints-back-button"
                onClick={() => navigate(`/projects/${id}`)}
            >
                <ArrowLeft size={17} /> Back to Project
            </button>

            <div className="sprints-header">
                <div>
                    <span className="sprints-eyebrow">PROJECT WORKSPACE</span>
                    <h1>Sprint Management</h1>
                    <p>Plan your sprints and track task progress.</p>
                </div>

                <button
                    type="button"
                    className="sprints-create-button"
                    onClick={() => {
                        setError("");
                        setShowAddTasks(false);
                        setEditingSprintId(null);

                        setSprintForm({
                            sprint_name: "",
                            goal: "",
                            milestone: "",
                            start_date: "",
                            end_date: "",
                            status: "Planned",
                        });
                        setShowForm(true);
                    }}
                >
                    <Plus size={18} />
                    Create Sprint
                </button>



            </div>

            {error && <div className="sprints-error">{error}</div>}

            {showForm && (
                <form className="sprint-form" onSubmit={handleCreateSprint}>
                    <h2>
                        {editingSprintId !== null
                            ? "Edit Sprint" :
                            "Create New Sprint"}
                    </h2>

                    <div className="sprint-form-grid">
                        <label>
                            Sprint Name *
                            <input
                                required
                                value={sprintForm.sprint_name}
                                placeholder="e.g. Sprint 1"
                                onChange={(e) =>
                                    setSprintForm({
                                        ...sprintForm,
                                        sprint_name: e.target.value,
                                    })}
                            />
                        </label>

                        <label>
                            Status
                            <select
                                value={sprintForm.status}
                                onChange={(e) => setSprintForm({
                                    ...sprintForm,
                                    status: e.target.value
                                })}
                            >
                                <option value="Planned">Planned</option>
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </label>

                        <label>
                            Start Date *
                            <input
                                required
                                type="date"
                                value={sprintForm.start_date}
                                onChange={(e) => setSprintForm({
                                    ...sprintForm,
                                    start_date: e.target.value
                                })}
                            />
                        </label>

                        <label>
                            End Date *
                            <input
                                required
                                type="date"
                                min={sprintForm.start_date || undefined}
                                value={sprintForm.end_date}
                                onChange={(e) => setSprintForm({
                                    ...sprintForm,
                                    end_date: e.target.value
                                })}
                            />
                        </label>

                        <label className="sprint-form-full">
                            Sprint Goal *
                            <textarea
                                required
                                rows="3"
                                value={sprintForm.goal}
                                placeholder="What should this sprint achieve?"
                                onChange={e => setSprintForm({
                                    ...sprintForm,
                                    goal: e.target.value
                                })}
                            />
                        </label>
                    </div>

                    <div className="sprint-form-actions">
                        <button
                            type="button"
                            className="sprint-cancel-button"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="sprints-create-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingSprintId !== null
                                    ? "Update Sprint"
                                    : "Save Sprint"}
                        </button>
                    </div>
                </form>
            )}

            <div className="sprint-list-heading">
                <div>
                    <h2>Your Sprints</h2>
                    <p>{sprints.length} sprint{sprints.length !== 1 ? "s" : ""} in this project</p>
                </div>
            </div>

            {sprints.length === 0 ? (
                <div className="sprints-empty">
                    <Layers size={36} />
                    <h3>No sprints created yet</h3>
                    <p>Create your first sprint to start planning project tasks.</p>
                </div>
            ) : (
                <div className="sprint-cards">
                    {sprints.map(sprint => (
                        <div
                            key={sprint.id}
                            className={`sprint-card ${selectedSprint?.id === sprint.id ? "selected" : ""
                                }`}
                            onClick={() => setSelectedSprint(sprint)}
                        >
                            <div className="sprint-card-top">
                                <span className="sprint-card-icon"><Layers size={19} /></span>

                                <span className="sprint-card-actions">
                                    <span
                                        className={`sprint-status ${(sprint.status || "").toLowerCase()
                                            }`}
                                    >
                                        {sprint.status}
                                    </span>

                                    {/* Start sprint Button */}
                                    {sprint.status === "Planned" && (
                                        <button
                                            type="button"
                                            className="start-sprint-button"
                                            title="Start Sprint"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStartSprint(sprint.id);
                                            }}

                                        >
                                            Start Sprint
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="edit-sprint-button"
                                        title="Edit Sprint"
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            setError("");
                                            setEditingSprintId(sprint.id);

                                            setSprintForm({
                                                sprint_name: sprint.sprint_name || "",
                                                goal: sprint.goal || "",
                                                milestone:
                                                    typeof sprint.milestone === "object"
                                                        ? sprint.milestone?.id || ""
                                                        : sprint.milestone || "",
                                                start_date: sprint.start_date || "",
                                                end_date: sprint.end_date || "",
                                                status: sprint.status || "Planned",
                                            });

                                            setShowForm(true);
                                        }}
                                    >
                                        <Pencil size={16} />
                                    </button>
                                </span>

                            </div>

                            <h3>{sprint.sprint_name}</h3>
                            <p>{sprint.goal}</p>

                            <div className="sprint-card-dates">
                                <CalendarDays size={15} />
                                {sprint.start_date} – {sprint.end_date}
                            </div>

                            <span className="sprint-task-count">
                                {(sprint.task_ids || []).length} assigned tasks
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {selectedSprint && (
                <section className="sprint-board-section">
                    <div className="sprint-board-header">
                        <div>
                            <span className="sprints-eyebrow">SELECTED SPRINT</span>
                            <h2>{selectedSprint.sprint_name} — Board</h2>
                            <p>{selectedSprint.goal}</p>
                        </div>

                        <button
                            type="button"
                            className="sprints-create-button"
                            onClick={() => {
                                setError("");
                                setEditingSprintId(null);
                                setSprintForm({
                                    sprint_name: "",
                                    goal: "",
                                    start_date: "",
                                    end_date: "",
                                    status: "Planned",
                                });
                                setShowForm(true);
                            }}
                        >
                            <Plus size={18} />
                            Add Tasks
                        </button>
                    </div>

                    {showAddTasks && (
                        <div className="add-sprint-tasks">
                            <h3>Add Backlog Tasks to {selectedSprint.sprint_name}</h3>
                            <p>Select multiple tasks to include in this sprint.</p>

                            {tasks.filter(task => {
                                const sprintId =
                                    typeof task.sprint === "object"
                                        ? task.sprint?.id
                                        : task.sprint;

                                return !sprintId;
                            }).length === 0 ? (
                                <p>No unassigned backlog tasks are available</p>
                            ) : (
                                <div className="availabe-sprint-tasks">
                                    {tasks
                                        .filter(task => {
                                            const sprintId =
                                                typeof task.sprint === "object"
                                                    ? task.sprint?.id
                                                    : task.sprint;

                                            return !sprintId;
                                        })
                                        .map(task => (
                                            <label
                                                key={task.id}
                                                className="available-sprint-task"
                                                htmlFor={`sprint-task-${task.id}`}
                                            >
                                                <input
                                                    id={`sprint-task-${task.id}`}
                                                    type="checkbox"
                                                    checked={selectedTaskIds.includes(Number(task.id))}
                                                    onChange={(e) => {
                                                        const taskId = Number(task.id);

                                                        setSelectedTaskIds(previous => {
                                                            if (e.target.checked) {
                                                                return previous.includes(taskId)
                                                                    ? previous
                                                                    : [...previous, taskId];
                                                            }
                                                            return previous.filter(id => id !== taskId);
                                                        });
                                                    }}
                                                />

                                                <span>
                                                    <strong>
                                                        {task.task_name || task.title || `Task ${task.id}`}
                                                    </strong>
                                                    <small>
                                                        TASK-{task.id} . {task.status || "To Do"}
                                                    </small>
                                                </span>
                                            </label>
                                        ))}
                                </div>
                            )}

                            <div className="add-sprint-tasks-actions">
                                <span>{selectedTaskIds.length} selected</span>

                                <button
                                    type="button"
                                    className="sprint-cancel-button"
                                    onClick={() => {
                                        setShowAddTasks(false);
                                        setSelectedTaskIds([]);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="sprint-create-button"
                                    onClick={handleAssignTasks}
                                    disabled={
                                        assigningTasks || selectedTaskIds.length === 0
                                    }
                                >
                                    {assigningTasks ? "Adding..." : "Add Selected Tasks"}
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="sprint-kanban">
                        {columns.map(column => {
                            const columnTasks = sprintTasks.filter(
                                task => getTaskStatus(task) === column
                            );

                            return (
                                <div className="sprint-kanban-column" key={column}>
                                    <div className="kanban-column-header">
                                        <h3>{column}</h3>
                                        <span>{columnTasks.length}</span>
                                    </div>

                                    {columnTasks.length === 0 ? (
                                        <div className="kanban-empty">No tasks here</div>
                                    ) : columnTasks.map(task => (
                                        <article className="kanban-task-card" key={task.id}>
                                            <span className="kanban-task-id">TASK-{task.id}</span>
                                            <h4>{task.task_name || task.title || `Task ${task.id}`}</h4>
                                            <p>{task.description || "No description provided."}</p>
                                            <div className="kanban-task-footer">
                                                <span>{task.priority || "Normal"} priority</span>
                                                <span>{getTaskStatus(task)}</span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );


};

export default Sprints;
