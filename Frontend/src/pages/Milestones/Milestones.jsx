import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";

import './Milestones.css';
<<<<<<< HEAD
import { ArrowLeft, Flag } from "lucide-react";
=======
>>>>>>> c5314eb (In projectDetails page ashows overview page and Bachlog page)
import {
    PMSPageHeader,
    PMSSearch,
    PMSActionButton,
} from "../../components/Common/Common";
import api from "../../services/api";

const initialFormData = {
    name: '',
    project: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Not Started',
};
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const statusToBackend = {
    'Not Started': 'Not_Started',
    'In Progress': 'In_Progress',
    'Completed': 'Completed',
    'On Hold': 'On_Hold',
};

const statusToFrontend = {
    Not_Started: 'Not Started',
    In_Progress: 'In Progress',
    Completed: 'Completed',
    On_Hold: 'On Hold',
};

function Milestones() {
    

    const { id } = useParams();
    const navigate = useNavigate();

    const [milestones, setMilestones] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        fetchProjects();
        fetchMilestones();
    }, []);
    const fetchProjects = async () => {
        try {
            const response = await api.get("projects/");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setProjects(data);
        } catch (err) {
            console.error('Error loading projects:', error.response?.data || error);
            setError('Unable to load projects.');
        }
    };

    const fetchMilestones = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/milestones/`);

            if (!response.ok) {
                throw new Error('Failed to load milestones.');
            }

            const data = await response.json();
            console.log("MILESTONE API DATA:", data);

            const milestoneList = Array.isArray(data)
                ? data
                : data.results || [];

            const projectMilestones = milestoneList.filter(
                (milestone) => 
                    Number(milestone.project) === Number(id)
            );

            const formattedMilestones = projectMilestones.map((milestone) => ({
                id: milestone.id,
                name: milestone.milestone_name,
                project: milestone.project,
                description: milestone.description || '',
                startDate: milestone.start_date || "",
                endDate: milestone.due_date || '',
                status:
                    statusToFrontend[milestone.status] ||
                    milestone.status,
            }));

            setMilestones(formattedMilestones);
        } catch (err) {
            console.error('Error loading milestones:', err);
            setError('Unable to load milestones.');
        } finally {
            setLoading(false);
        }
    };

    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);

    const [formData, setFormData] = useState({
        ...initialFormData,
    });

    const filteredMilestones = milestones.filter((milestone) => {
    const project = projects.find(
        (item) => Number(item.id) === Number(milestone.project)
    );

    const projectName = project?.project_name || '';

    return `${milestone.name}
        ${projectName}
        ${milestone.description}
        ${milestone.startDate}
        ${milestone.endDate}
        ${milestone.status}`
        .toLowerCase()
        .includes(search.toLowerCase());
});

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const openAddForm = () => {
        setEditingMilestone(null);
        setOpenMenu(null);

        setFormData({
            ...initialFormData,
            project: id,
        });

        setShowForm(true);
    };

    const openEditForm = (milestone) => {
        setEditingMilestone(milestone);
        setOpenMenu(null);

        setFormData({
            name: milestone.name || "",
            project: id,
            description: milestone.description || "",
            startDate: milestone.startDate || "",
            endDate: milestone.endDate || "",
            status: milestone.status || "Not Started",
        });

        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingMilestone(null);

        setFormData({
            ...initialFormData,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            formData.startDate &&
            formData.endDate &&
            formData.endDate < formData.startDate
        ) {
            alert('End date cannot be before start date.');
            return;
        }

        const payload = {
            project: Number(id),
            milestone_name: formData.name,
            description: formData.description,
            start_date: formData.startDate,
            due_date: formData.endDate,
            status: statusToBackend[formData.status],
        };

        try {
            let response;

            if (editingMilestone) {
                response = await fetch(
                    `${API_BASE_URL}/milestones/${editingMilestone.id}/update/`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    }
                );
            } else {
                response = await fetch(
                    `${API_BASE_URL}/milestones/create/`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    }
                );
            }

            if (!response.ok) {
                const responseData = await response.json();
                console.error(responseData);
                throw new Error('Unable to save milestone.');
            }

            await fetchMilestones();
            closeForm();
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this milestone?'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/milestones/${id}/delete/`,
                {
                    method: 'DELETE',
                }
            );

            if (!response.ok) {
                throw new Error('Unable to delete milestone.');
            }

            setOpenMenu(null);
            await fetchMilestones();

        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const getProjectName = (projectId) => {
        const project = projects.find(
            (item) => Number(item.id) === Number(projectId)
        );

        return project?.project_name || 'Unknown Project';
    };

    return (
        <div className="milestones-page">

            {/* Header */}
            <button
                type="button"
<<<<<<< HEAD
                className="back-to-projects-btn"
                onClick={() =>
                    navigate(-1)}
            >
                <ArrowLeft size={16} />
                Back to Project
            </button>

            <div className="milestones-header">
                
                <div>
                    <h1 className='milestones-title'>
                        <Flag size={16} />
                        Milestones</h1>
=======
                className="milestones-back-btn"
                onClick={() => navigate(`/projects/${id}`)}
            >
                    ← Back to Project
            </button>
            <div className="milestones-header">
                
                <div>
                    <h1>Milestones</h1>
>>>>>>> c5314eb (In projectDetails page ashows overview page and Bachlog page)

                    <p>
                        Manage project milestones and track their progress.
                    </p>
                </div>

                <button
                    type="button"
                    className="add-milestone-btn"
                    onClick={openAddForm}
                >
                    + Add Milestone
                </button>
            </div>

            {/* Search */}
            <div className="milestones-toolbar">
                <div className="milestones-search-box">
                    <PMSSearch
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        placeholder="Search milestones..."
                    />
                </div>
            </div>

            {/* Milestones Table */}
            <div className="milestones-card">

                <table className="milestones-table">

                    <thead>
                        <tr>
                            <th>Name</th>
<<<<<<< HEAD
=======
                            <th>Project</th>
>>>>>>> c5314eb (In projectDetails page ashows overview page and Bachlog page)
                            <th>Description</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="empty-milestones">
                                        Loading milestones...
                                    </td>
                                </tr>
                            ) : filteredMilestones.length > 0 ? (

                            filteredMilestones.map((milestone) => (

                                <tr key={milestone.id}>

                                    <td className="milestone-name">
                                        {milestone.name || "-"}
                                    </td>
                                    <td>
                                        {getProjectName(milestone.project)}
                                    </td>

                                    <td>
                                        {milestone.description || "-"}
                                    </td>

                                    <td>
                                        {milestone.startDate || "-"}
                                    </td>

                                    <td>
                                        {milestone.endDate || "-"}
                                    </td>

                                    <td>
                                        <span className="milestone-status">
                                            {milestone.status || "-"}
                                        </span>
                                    </td>

                                    {/* 3 DOT ACTION MENU */}
                                    <td>

                                        <div className="milestone-actions">

                                            <button
                                                type="button"
                                                className="milestone-menu-btn"
                                                onClick={() =>
                                                    setOpenMenu(
                                                        openMenu ===
                                                            milestone.id
                                                            ? null
                                                            : milestone.id
                                                    )
                                                }
                                                aria-label="More actions"
                                            >
                                                ⋮
                                            </button>

                                            {openMenu === milestone.id && (
                                                <div
                                                    className={`milestone-action-menu ${
                                                        milestone.id === filteredMilestones[filteredMilestones.length - 1].id
                                                            ? "menu-up"
                                                            : ""
                                                    }`}
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditForm(
                                                                milestone
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete-action"
                                                        onClick={() =>
                                                            handleDelete(
                                                                milestone.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
                                            )}

                                        </div>

                                    </td>

                                </tr>

                            ))

                        ) : (

                            <tr>
                                <td
                                    colSpan="7"
                                    className="empty-milestones"
                                >
                                    No milestones found.
                                </td>
                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

<<<<<<< HEAD
            
            {/* Add / Edit Milestone Modal */}
            {showForm && (
                <div className="milestone-form-overlay">
                    <div className="milestone-form">

                        {/* Form Header */}
                        <div className="milestone-form-header">
                            <h2>
                                {editingMilestone
                                    ? "Edit Milestone"
                                    : "Add Milestone"}
                            </h2>

                            <button
                                type="button"
                                className="milestone-form-close"
                                onClick={closeForm}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
=======
            {/* Add / Edit Milestone Modal */}
            {showForm && (

                <div className="milestone-form-overlay">

                    <div className="milestone-form">

                        {/* Close Button */}
                        <button
                            type="button"
                            className="milestone-form-close"
                            onClick={closeForm}
                            aria-label="Close"
                        >
                            ×
                        </button>

                        {/* Form Title */}
                        <h2>
                            {editingMilestone
                                ? 'Edit Milestone'
                                : 'Add Milestone'}
                        </h2>
>>>>>>> c5314eb (In projectDetails page ashows overview page and Bachlog page)

                        <form onSubmit={handleSubmit}>

                            {/* Name */}
<<<<<<< HEAD
                            <div className="milestone-form-group">
                                <label>Name</label>
=======
                            <div>
                                <label>Name:</label>

>>>>>>> c5314eb (In projectDetails page ashows overview page and Bachlog page)
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
<<<<<<< HEAD
                                    placeholder="Enter milestone name"
=======
>>>>>>> c5314eb (In projectDetails page ashows overview page and Bachlog page)
                                    required
                                />
                            </div>

<<<<<<< HEAD
                            {/* Description */}
                            <div className="milestone-form-group">
                                <label>Description</label>
=======
                            

                            {/* Description */}
                            <div>
                                <label>Description:</label>

>>>>>>> c5314eb (In projectDetails page ashows overview page and Bachlog page)
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter milestone description"
<<<<<<< HEAD
                                    rows={3}
                                />
                            </div>

                            {/* Dates */}
                            <div className="milestone-form-date-row">
                                <div className="milestone-form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate || ""}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="milestone-form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate || ""}
                                        onChange={handleChange}
                                        min={formData.startDate || undefined}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="milestone-form-group">
                                <label>Status</label>
=======
                                />
                            </div>

                            {/* Start Date */}
                            <div>
                                <label>Start Date:</label>

                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label>End Date:</label>

                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label>Status:</label>

>>>>>>> c5314eb (In projectDetails page ashows overview page and Bachlog page)
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                >
<<<<<<< HEAD
                                    <option value="Not Started">Not Started</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="On Hold">On Hold</option>
=======
                                    <option value="Not Started">
                                        Not Started
                                    </option>

                                    <option value="In Progress">
                                        In Progress
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="On Hold">
                                        On Hold
                                    </option>
>>>>>>> c5314eb (In projectDetails page ashows overview page and Bachlog page)
                                </select>
                            </div>

                            {/* Form Actions */}
                            <div className="milestone-form-actions">
<<<<<<< HEAD
                                <button
                                    type="button"
                                    className="milestone-cancel-button"
=======

                                <button
                                    type="button"
>>>>>>> c5314eb (In projectDetails page ashows overview page and Bachlog page)
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>

<<<<<<< HEAD
                                <button
                                    type="submit"
                                    className="milestone-save-button"
                                >
                                    {editingMilestone
                                        ? "Update Milestone"
                                        : "Create Milestone"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

=======
                                <button type="submit">
                                    {editingMilestone
                                        ? 'Update Milestone'
                                        : 'Create Milestone'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}
>>>>>>> c5314eb (In projectDetails page ashows overview page and Bachlog page)

        </div>
    );
}

export default Milestones;