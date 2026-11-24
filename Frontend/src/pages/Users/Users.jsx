import { useState, useEffect } from 'react';
import './Users.css';

import api from "../../services/api";
import CommonSearch from "../../components/Common/Common.jsx";

import {
    Plus,
    ShieldCheck,
    Users as UsersIcon,
    UserIcon,
    LockKeyhole,
} from "lucide-react";

function Users() {
    console.count("Users component rendered")
    const [users, setUsers] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [roles, setRoles] = useState([]);

    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [openMenu, setOpenMenu] = useState(null);
    const [errors, setErrors] = useState({});
=======
    const [isSaving, setIsSaving] = useState(false);
>>>>>>> fd53781dc6aa12d92a6a6980c44eeb1d9151b169

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        designation: '',
        status: 'Active',
    });

    const filteredUsers = users.filter((user) =>
        `${user.name} ${user.email} ${user.role_name} ${user.designation} ${user.status}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        // Clear the error for the field being edited
        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: '',
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        const trimmedName = formData.name.trim();
        const trimmedEmail = formData.email.trim();

        // Name validation
        if (!trimmedName) {
            newErrors.name = 'Name is required.';
        } else if (trimmedName.length < 2) {
            newErrors.name =
                'Name must contain at least 2 characters.';
        } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
            newErrors.name =
                'Name can contain only letters and spaces.';
        }

        // Email validation
        if (!trimmedEmail) {
            newErrors.email = 'Email is required.';
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
        ) {
            newErrors.email =
                'Enter a valid email address.';
        }

        // Role validation
        if (!formData.role) {
            newErrors.role = 'Please select a role.';
        }

        // Designation validation
        if (!formData.designation) {
            newErrors.designation =
                'Please select a designation.';
        }

        // Status validation
        if (!formData.status) {
            newErrors.status = 'Please select a status.';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const openAddForm = () => {
        setEditingUser(null);

        setFormData({
            name: '',
            email: '',
            role: '',
            designation: '',
            status: '',
        });

        setErrors({});
        setShowForm(true);
    };

    const openEditForm = (user) => {
        setEditingUser(user);

        setFormData({
            name: user.name === "N/A" ? "" : user.name,
            email: user.email || "",
            role: String(user.role_id ?? ""),
            designation: String(user.designationId || ""),
            status: user.status || "Active",
        });

        setErrors({});
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingUser(null);
        setErrors({});
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSaving) return;

        setIsSaving(true);

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            role: formData.role,
            designation: formData.designation,
            status: formData.status,
        };

        console.log("User update payload:", payload);
        console.log("Available designations:", designations);
        console.log("Available roles:", roles);

        try {
            if (editingUser) {
                await api.put(`users/${editingUser.id}/`, payload);
            } else {
                await api.post("users/", payload);
            }

            await fetchUsers();
            closeForm();

            alert(
                editingUser
                    ? "User updated successfully."
                    : "User created successfully."
            );
        } catch (error) {
            console.error(
                "Failed to save user:",
                error.response?.status,
                error.response?.data || error.message
            );

            const errorData = error.response?.data;

            alert(
                errorData
                    ? JSON.stringify(errorData, null, 2)
                    : "Failed to save user. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`users/${id}/`);
            await fetchUsers();

            alert("User deleted successfully.");

        } catch (error) {
            console.error(
                "Failed to delete user:",
                error.response?.data || error
            );

            alert("Failed to delete user.");
        }
    };
    useEffect(() => {
        console.log("Testing Users page");

        fetchDesignations();
        fetchRoles();
        fetchUsers();
    }, []);

    // FETCH DESIGNATION
    const fetchDesignations = async () => {
        try {
            const response = await api.get("designations/");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            console.log("Designation records:", data);

            setDesignations(
                data.map((item) => ({
                    id: item.id,
                    name:
                        item.designation_name ||
                        item.name ||
                        item.title ||
                        "",
                    is_active: item.is_active,
                }))
            );
        } catch (error) {
            console.error(
                "Failed to fetch designations:",
                error.response?.status,
                error.response?.data || error.message
            );
        }
    };

    const fetchRoles = async () => {
    try {
        const response = await api.get("roles/");

        const data = Array.isArray(response.data)
            ? response.data
            : response.data.results || [];

        setRoles(
            data.map((role) => ({
                id: role.id,
                name: role.role_name,
                is_active: role.is_active,
            }))
        );
    } catch (error) {
        console.error(
            "Failed to fetch roles:",
            error.response?.data || error
        );
    }
};
        const fetchUsers = async () => {
        try {
            // Check whether the JWT access token exists
            const token = localStorage.getItem("access_token");

            if (!token) {
                console.error(
                    "Access token missing. Please log in again."
                );
                return;
            }

            // Request users through your configured Axios instance
            const response = await api.get("users/");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            console.log("Fetched users:", data);

            setUsers(
                data.map((user) => ({
                    id: user.id,

                name:
                    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                    user.username?.replace(/_/g, " ") ||
                    "N/A",

                email: user.email || "",

                role_id: user.role_id ?? "",
                role_name: user.role_name || "",

                designationId: user.designation_id ?? "",
                designation: user.designation_name || "Not Assigned",

                is_superuser: user.is_superuser,
                status: user.is_active === false ? "Inactive" : "Active",
            }))
            );
        } catch (error) {
            console.error(
                "Users API error:",
                error.response?.status,
                error.response?.data || error.message
            );
        }
    };
    return (
        <div className="users-page">

            {/* Header */}

<div className="common-page-toolbar">

    <div className="common-page-title">
        <UsersIcon size={22} color="#D9A21B" />
        <div className="common-page-title-text">
            <h1>User Management</h1>
            <p>Manage users, roles, and designations.</p>
        </div>

    </div>


            {/* Search */}

            <CommonSearch
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                }}
                placeholder="Search users"
            />

    <button
        type="button"
        className="add-user-btn"
        onClick={openAddForm}
    >
        <Plus size={17} />
        Add User
    </button>

</div>




            {/* Users Table */}
            <div className="users-card">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Designation</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user, index) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className='user-name'>
                                            <div className='user-icon'>
                                                {user.is_superuser ? (
                                                    <ShieldCheck size={18} color="#D9A21B" />
                                                ) : (
                                                    <UserIcon size={18} />
                                                )}
                                            </div>

                                            <span>{user.name || "N/A"}</span>

                                            {user.is_superuser && (
                                                <span className='admin-badge'>ADMIN</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{user.email || "N/A"}</td>
                                    <td>
                                        {user.role_name ||
                                            roles.find(
                                                (role) => String(role.id) === String(user.role_id)
                                            )?.name ||
                                            "Not Assigned"}
                                    </td>
                                    <td>{user.designation || "Not Assigned"}</td>

                                    <td>
                                        <span
                                            className={`user-status ${(user.status || "Inactive").toLowerCase()

                                                }`}
                                        >
                                            {user.status || "Inactive"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="user-actions">
                                            {user.is_superuser ? (
                                                <span className='protected-user'>
                                                    <LockKeyhole size={14} />
                                                    Protected
                                                </span>
                                            ) : (
                                                <>
                                                   <button
                                                        type="button"
                                                        className="user-edit-btn"
                                                        onClick={() =>
                                                            openEditForm(user)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="user-delete-btn"
                                                        onClick={() =>
                                                            handleDelete(user.id)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="empty-users"
                                >
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add / Edit User Modal */}
            {showForm && (
                <div className="user-form-overlay">
                    <div className="user-form">
                        {/* Close Button */}
                        <button
                            type="button"
                            className="user-form-close"
                            onClick={closeForm}
                            aria-label="Close"
                        >
                            X
                        </button>

                        {/* Form Title */}
                        <h2>
                            {editingUser
                                ? 'Edit User'
                                : 'Add User'}
                        </h2>

                        <form onSubmit={handleSubmit}>

                            {/* Name */}
                            <div>
                                <label htmlFor="user-name">Name:</label>

                                <input
                                    id="user-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={
                                        errors.name
                                            ? 'input-error'
                                            : ''
                                    }
                                />

                                {errors.name && (
                                    <span className="field-error">
                                        {errors.name}
                                    </span>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label>Email:</label>

                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={
                                        errors.email
                                            ? 'input-error'
                                            : ''
                                    }
                                />

                                {errors.email && (
                                    <span className="field-error">
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            {/* Role */}
                            <div>
                                <label>Role:</label>

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className={
                                        errors.role
                                            ? 'input-error'
                                            : ''
                                    }
                                >
                                    <option value="">Select Role</option>

                                    {roles
                                        .filter((role) => role.is_active)
                                        .map((role) => (
                                            <option value={role.id} >{role.name}</option>
                                        ))}
                                </select>

                                {errors.role && (
                                    <span className="field-error">
                                        {errors.role}
                                    </span>
                                )}
                            </div>

                            {/* Designation */}
                            <div>
                                <label htmlFor="user-designation">Designation:</label>

                                <select
                                    id="user-designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    className={
                                        errors.designation
                                            ? 'input-error'
                                            : ''
                                    }
                                >
                                    <option value="">Select Designation</option>

                                    {designations
                                        .filter((designation) => designation.is_active !== false)
                                        .map((designation) => (
                                            <option value={designation.id}>{designation.name}</option>
                                        ))}
                                </select>

                                {errors.designation && (
                                    <span className="field-error">
                                        {errors.designation}
                                    </span>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label>Status:</label>
                                <select
                                    value={formData.status}
                                    onChange={handleChange}
                                    name="status"
                                    className={errors.status ? 'input-error' : ''}
                                >
                                    <option value="">Select Status</option>

                                    <option value="Active">Active</option>

                                    <option value="Inactive">Inactive</option>
                                </select>

                                {errors.status && (
                                    <span className="field-error">{errors.status}</span>
                                )}

                            </div>

                            {/* Form Actions */}
                            <div className="user-form-actions">

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                >
                                    {isSaving
                                        ? (editingUser ? "Updating..." : "Saving...")
                                        : (editingUser ? "Update User" : "Create User")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Users;
