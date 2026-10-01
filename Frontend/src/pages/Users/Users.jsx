import { useState, useEffect } from 'react';
import './Users.css';
import {
    PMSPageHeader,
    PMSSearch,
    PMSActionButton,
} from "../../components/Common/Common";

import api from "../../services/api";

function Users() {
    const [users, setUsers] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [roles, setRoles] = useState([]);

    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        designation: '',
        status: 'Active',
    });

    const filteredUsers = users.filter((user) =>
        `${user.name} ${user.email} ${user.role} ${user.designation} ${user.status}`
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
            name: user.name,
            email: user.email,
            role: user.role,
            designation: user.designation,
            status: user.status,
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

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            role: formData.role,
            designation: formData.designation,
            status: formData.status,
        };

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
                error.response?.data || error
            );

            alert(
                JSON.stringify(
                    error.response?.data || "Failed to save user."
                )
            );
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
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
        fetchDesignations();
        fetchRoles();
        fetchUsers();
    }, []);

    const fetchDesignations = async () => {
        try {
            const response = await api.get("designations/");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setDesignations(data);

        } catch (error) {
            console.error(
                "Failed to fetch designations:",
                error.response?.data || error
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
                    is_active: role.role_name,
                    status: role.is_active ? "Active" : "Inactive",
                })));
        } catch (error) {
            console.error(
                "Failed to fetch roles:",
                error.response?.data || error
            );
        }
    };

    const fetchUsers = async () => {
        try {
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
                        user.username ||
                        "N/A",
                    email: user.email || "N/A",
                    role: user.role_name || user.role || "Not Assigned",
                    designation: user.designation_name || "Not Assigned",
                    status: user.is_active === false ? "Inactive" : "Active",
                }))
            );
        } catch (error) {
            console.error(
                error.response?.status,
                error.response?.data || error.message
            );
        }
    };




    return (
        <div className="users-page">

            {/* Header */}
            <div className="users-header">
                <div>
                    <h1>Users</h1>
                    <p>
                        Manage users and their access to the system.
                    </p>
                </div>

                <button
                    type="button"
                    className="add-user-btn"
                    onClick={openAddForm}
                >
                    + Add User
                </button>
            </div>

            {/* Search */}
            <PMSSearch
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                }}
                placeholder='Search users'
            />

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
                                    <td>{user.name || "N/A"}</td>
                                    <td>{user.email || "N/A"}</td>
                                    <td>{user.role || "Not Assigned"}</td>
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

                                            <button
                                                type="button"
                                                className="user-menu-btn"
                                                onClick={() =>
                                                    setOpenMenu(
                                                        openMenu === user.id
                                                            ? null
                                                            : user.id
                                                    )
                                                }
                                                aria-label="User actions"
                                            >
                                                ⋮
                                            </button>

                                            {openMenu === user.id && (
                                                <div
                                                    className={`user-action-menu ${index === filteredUsers.length - 1
                                                            ? 'user-action-menu-up'
                                                            : ''
                                                        }`}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setOpenMenu(null);
                                                            openEditForm(user);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setOpenMenu(null);
                                                            handleDelete(user.id);
                                                        }}
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
                            ×
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
                                <label>Name:</label>

                                <input
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
                                            <option
                                                key={role.id}
                                                value={role.id}
                                            >
                                                {role.name}
                                            </option>
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
                                <label>Designation:</label>

                                <select
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    className={
                                        errors.designation
                                            ? 'input-error'
                                            : ''
                                    }
                                >
                                    <option value="">
                                        Select Designation
                                    </option>

                                    {designations
                                        .filter((designation) => designation.status)
                                        .map((designation) => (
                                            <option
                                                key={designation.id}
                                                value={designation.id}
                                            >
                                                {designation.name}
                                            </option>
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
                                >
                                    Cancel
                                </button>

                                <button type="submit">
                                    {editingUser
                                        ? 'Update User'
                                        : 'Create User'}
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
