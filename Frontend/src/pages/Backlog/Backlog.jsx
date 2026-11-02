import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Plus,
    Pencil,
    Trash2,
    ClipboardList,
    X,
} from "lucide-react";

import api from "../../services/api";
import "./Backlog.css";
import { PMSPageHeader } from "../../components/Common/Common.jsx";


const Backlog = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [milestones, setMilestones] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        assignedTo: "",
        priority: "",
        milestone: ""
    });


    /* =========================
       FETCH BACKLOG
    ========================= */

    const fetchBacklog = async () => {

        try {

            setLoading(true);

            const [
                projectResponse,
                tasksResponse,
                usersResponse,
            ] = await Promise.all([
                api.get(`projects/${id}/`),
                api.get("tasks/"),
                api.get("users/"),
            ]);


            const taskData =
                Array.isArray(tasksResponse.data)
                    ? tasksResponse.data
                    : tasksResponse.data.results || [];


            const userData =
                Array.isArray(usersResponse.data)
                    ? usersResponse.data
                    : usersResponse.data.results || [];


            const projectTasks = taskData.filter((task) => {

                const taskProjectId =
                    task.project &&
                    typeof task.project === "object"
                        ? task.project.id
                        : task.project;

                return String(taskProjectId) === String(id);
            });


            setProject(projectResponse.data);
            setTasks(projectTasks);
            setUsers(userData);

            console.log("Loaded task modules:", projectTasks.map((task) => ({
                task: task.task_name,
                milestone: task.milestone,
            })));
            setUsers(userData);

            console.log("PROJECT:", projectResponse.data);
            console.log("BACKLOG TASKS:", projectTasks);
            console.log("FIRST TASK:", projectTasks[0]);
            console.log("FIRST TASK MILESTONE:", projectTasks[0]?.milestone);

        } catch (error) {

            console.error(
                "Failed to fetch backlog:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

        } finally {

            setLoading(false);
        }
    };

    const fetchMilestones = async () => {
        try {
            const response = await api.get("milestones/");
            const data = response.data;

            const allMilestones = Array.isArray(data)
                ? data
                : data.results || [];

            // GET THE CURRENT PROJECT'S ID 
            const currentProjectId = id;

            const projectMilestones = allMilestones.filter((milestone) => {
                console.log("Current Backlog URL ID:", id);
                console.log("Milestone project IDs:", allMilestones.map(m => m.project));
            const milestoneProjectId =
                typeof milestone.project === "object"
                    ? milestone.project?.id
                    : milestone.project;

            return (
                String(milestoneProjectId) ===
                String(currentProjectId)
            );
        });
            setMilestones(projectMilestones);
            console.log("Loaded modules:", projectMilestones);

        } catch (error) {
            console.error(
                "Milestone API error:",
                error.response?.status,
                error.response?.data || error.message
            );
        }
    };
    useEffect(() => {

        fetchBacklog();
        fetchMilestones();
    }, [id]);


    /* =========================
       FORM CHANGE
    ========================= */

    const handleChange = (event) => {

        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };


    /* =========================
       SAVE BACKLOG
    ========================= */

    const handleSubmit = async (event) => {

        event.preventDefault();


        if (!form.title.trim()) {
            alert("Please enter backlog item.");
            return;
        }

        if (!form.priority) {
            alert("Please select priority.")
            return;
        }
        
        try {
            setSaving(true);


            const payload = {
                task_name: form.title.trim(),
                project: Number(id),
                assigned_to: form.assignedTo
                    ? Number(form.assignedTo)
                    : null,
                priority: form.priority,
                milestone: form.milestone
                ? Number(form.milestone)
                : null,
                description: form.description || "",

            };


            console.log("SAVE PAYLOAD:", payload);
            console.log("EDITING TASK:", editingTask);


            if (editingTask) {
                // Edit
                const response = await api.put(
                    `tasks/${editingTask.id}/`, 
                    payload
                );
                console.log("UPDATE RESPONSE:", response.data);
                
            } else {
                // Create
                const response = await api.post(
                    "tasks/",
                    payload
                );
                console.log("CREATE RESPONSE:", response.data);

            }

            // Clear form
            setForm({
                title: "",
                description: "",
                assignedTo: "",
                priority: "",
                milestone: "",
            });


            // Close form
            setEditingTask(null);
            setShowForm(false);


            // Reload backlog
            await fetchBacklog();


        } catch (error) {

            console.error(
                "BACKLOG SAVE ERROR:",
                error.response?.data || error
            );

            console.error(
                "STATUS:",
                error.response?.status
            );


            alert(
                editingTask
                    ? "Failed to update backlog item."
                    : "Failed to create backlog item."
            );

        } finally {
            setSaving(false);
        }
    };
    /* =========================
       DELETE BACKLOG
    ========================= */

    const handleDelete = async (taskId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this backlog item?"
        );


        if (!confirmed) {
            return;
        }


        try {

            await api.delete(
                `tasks/${taskId}/`
            );


            await fetchBacklog();


        } catch (error) {

            console.error(
                "FAILED TO DELETE BACKLOG:",
                error
            );

            console.error(
                "BACKEND ERROR:",
                error.response?.data
            );

            alert("Failed to delete backlog item.");
        }
    };


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (
            <div className="backlog-page">
                Loading backlog...
            </div>
        );
    }

    const handleEdit = (task) => {
        setEditingTask(task);

        setForm({
            title: task.task_name || "",
            description: task.description || "",
            assignedTo: task.assigned_to && typeof task.assigned_to === "object"
                ? task.assigned_to.id
                : task.assigned_to || "",
            priority: task.priority || "",
            milestone: 
                task.milestone && typeof task.milestone === "object"
                ? task.milestone.id 
                : task.milestone || "",
            
        });

        setShowForm(true);
    };
    /* =========================
       PROJECT NOT FOUND
    ========================= */

    if (!project) {

        return (
            <div className="backlog-page">

            

            </div>
        );
    }
    /* =========================
       PAGE
    ========================= */

    return (

        <div className="backlog-page">


            {/* BACK TO PROJECT */}

            <button
                type="button"
                className="backlog-back-button"
                onClick={() =>
                    navigate(`/projects/${id}`)
                }
            >
                <ArrowLeft size={16} />

                Back to Project
            </button>


            {/* PAGE HEADER */}

            <PMSPageHeader
                title={
                    <>
                        <ClipboardList
                            size={24}
                            style={{
                                color: "#6c55e8",
                                marginRight: "10px",
                                verticalAlign: "middle",
                            }}
                        />
                        Backlog
                    </>
                }
                subtitle={
                project.project_name ||
                "Project Backlog"
                }
                buttonText="Add Backlog"
                buttonIcon={
                    <Plus size={16} />
                }

                onButtonClick={() => {
                    setEditingTask(null);

                    setForm({
                        title: "",
                        assignedTo: "",
                        priority: "",
                        milestone: "",
                    });

                    setShowForm(true);
                }}
            />
            {/* =========================
                ADD BACKLOG FORM
            ========================= */}

            {showForm && (
                <div
                    className="backlog-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowForm(false);
                        }
                    }}
                >
                    <div className="backlog-modal">

                        {/* MODAL HEADER */}
                        <div className="backlog-modal-header">

                            <div>
                                <h2>
                                    {editingTask ? "Edit Backlog Item" : "Add Backlog Item"}
                                </h2>

                                <p>
                                    {editingTask
                                        ? "Update the backlog item details."
                                        : "Add a new work item to this project."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="backlog-modal-close"
                                onClick={() => setShowForm(false)}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* MODAL FORM */}
                        <form
                            className="backlog-modal-form"
                            onSubmit={handleSubmit}
                        >

                            {/* BACKLOG ITEM */}
                            <div className="backlog-form-group">

                                <label>
                                    Backlog Item
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Enter backlog item"
                                    autoFocus
                                />

                            </div>

                            {/* DESCRIPTION - NEW FIELD */}
                            <div className="backlog-form-group">
                                <label>Description</label>

                                <textarea
                                    name="description"
                                    value={form.description || ""}
                                    onChange={handleChange}
                                    placeholder="Enter backlog description"
                                    rows={2}
                                />
                            </div>
                            
                            <div className="backlog-form-group">
                                <label>Module</label>

                                <select
                                    name="milestone"
                                    value={form.milestone}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Module</option>

                                    {milestones.map((milestone) => (
                                        <option  key ={milestone.id} value={milestone.id}>
                                            {milestone.milestone_name}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            {/* ASSIGNED TO */}
                            <div className="backlog-form-group">

                                <label>
                                    Assigned To
                                </label>

                                <select
                                    name="assignedTo"
                                    value={form.assignedTo}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select user
                                    </option>

                                    {users.map((user) => {
                                        const fullName = 
                                            `${user.first_name || ""} ${
                                                user.last_name || ""
                                            }`.trim() || user.username;
 
                                        const designation = 
                                            typeof user.designation === "object"
                                                ? user.designation?.name
                                                : user.designation;

                                        return (
                                            <option
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {designation
                                                    ? `${fullName} - ${designation}`
                                                    : fullName}
                                            </option>
                                        );
                                    })}

                                </select>

                            </div>


                            {/* PRIORITY */}
                            <div className="backlog-form-group">

                                <label>
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select Priority
                                    </option>

                                    <option value="Low">
                                        Low
                                    </option>

                                    <option value="Medium">
                                        Medium
                                    </option>

                                    <option value="High">
                                        High
                                    </option>

                                </select>

                            </div>


                            {/* FOOTER */}
                            <div className="backlog-modal-footer">

                                <button
                                    type="button"
                                    className="backlog-cancel-button"
                                    onClick={() => setShowForm(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="backlog-save-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Add Backlog"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}
            {/* =========================
                BACKLOG TABLE
            ========================= */}

            <div className="backlog-card">
                {/* HEADER */}

                <div className="backlog-table-header">
                    <div>Backlog Item</div>
                    <div>Description</div>
                    <div>Module</div>
                    <div>Priority</div>
                    <div>Assigned To</div>
                    <div>Actions</div>

                </div>
                {/* EMPTY */}

                {tasks.length === 0 ? (
                    <div className="backlog-empty">

                        No backlog items found for this project.

                    </div>
                ) : (

                    tasks.map((task) => {

                        const assignedUserId =
                            task.assigned_to && typeof task.assigned_to === "object"
                                ? task.assigned_to.id
                                : task.assigned_to;

                        const user = users.find(
                            (item) =>
                                String(item.id) === String(assignedUserId)
                        );
                        
                        const assignedName =
                            `${user?.first_name || ""} ${
                                user?.last_name || ""
                            }`.trim() ||
                            user?.username ||
                            "Unassigned";                       

                        const milestoneId =
                            task.milestone && typeof task.milestone === "object"
                                ? task.milestone.id
                                : task.milestone;

                        const matchedMilestone = milestones.find(
                            (m) => String(m.id) === String(milestoneId)
                        );

                        const milestoneName =
                            (task.milestone &&
                                typeof task.milestone === "object" && 
                                (task.milestone.milestone_name ||
                                 task.milestone.name)) ||
                            matchedMilestone?.milestone_name ||
                            matchedMilestone?.name ||                   
                            "-"; 
        
                        return (

                            <div 
                                className="backlog-table-row"
                                key={task.id}
                            >
                                <div className="backlog-item-name">
                                    {task.task_name || "-"}
                                </div>

                                <div className="backlog-description">
                                    {task.description || "-"}
                                </div>

                                <div className="backlog-milestone">
                                    {milestoneName}
                                </div>
                                
                               {/* PRIORITY */}
                               <span className={`backlog-priority ${(task.priority || "").toLowerCase()}`}>
                                    {task.priority}
                                </span>
                                
                                {/* ASSIGNED */}

                                <div className="backlog-assigned">
                                    {assignedName}
                                </div>

                                {/* ACTIONS */}

                                <div className="backlog-actions">

                                    <button
                                        type="button"
                                        title="Edit"
                                        onClick={() => handleEdit(task)}
                                    >
                                        <Pencil size={15} />
                                    </button>

                                    <button
                                        type="button"
                                        title="Delete"
                                        onClick={() =>
                                            handleDelete(task.id)
                                        }
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
export default Backlog;