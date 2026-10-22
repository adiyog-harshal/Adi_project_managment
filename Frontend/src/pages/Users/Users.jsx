import { useState, useEffect } from 'react';
import './Users.css';

import api from "../../services/api";
import CommonSearch from "../../components/Common/Common.jsx";

import {
    Plus,
    Pencil,
    Trash2,
    ShieldCheck,
    Search,
} from "lucide-react";

function Users() {
    const [users, setUsers] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [roles, setRoles] = useState([]);

    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

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
    };

    const openAddForm = () => {
        setEditingUser(null);

        setFormData({
            name: '',
            email: '',
            role: '',
            designation: '',
            status: 'Active',
        });

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

        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingUser(null);
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
233

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
            const token = localStorage.getItem("token");

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
                        user.username ||
                        "N/A",
                    email: user.email || "N/A",
                    role: user.role_name || user.role || "Not Assigned",
                    designation: user.designation_name || "Not Assigned",
                    status: user.is_active === false
                        ? "Inactive"
                        : "Active",
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
        <Users size={22} color="#D9A21B" />
        <h1>User Management</h1>
        <p>Manage users, roles, and designations.</p>
    </div>

    <CommonSearch
        search={search}
        setSearch={setSearch}
        placeholder="Search users..."
    />

    <button
        type="button"
        className="add-user-btn"
        onClick={() => setShowForm(true)}
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
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className='user-name'>
                                            <div className='user-icon'>
                                                <Users size={18} />
                                            </div>

                                            <span>{user.name || "N/A"}</span>
                                        </div>
                                    </td>
                                    <td>{user.email || "N/A"}</td>
                                    <td>{user.role || "Not Assigned"}</td>
                                    <td>{user.designation || "Not Assigned"}</td>

                                    <td>
                                        <span
                                            className={`user-status ${
                                                (user.status || "Inactive").toLowerCase()

                                            }`}
                                        >
                                            {user.status || "Inactive"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="user-actions">

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
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label>Email:</label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label>Role:</label>

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
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
                            </div>

                            {/* Designation */}
                            <div>
                                <label>Designation:</label>

                                <select
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select Designation
                                    </option>

                                    {designations
                                        .filter((designation) => designation.is_active)
                                        .map((designation) => (
                                            <option key={designation.id} value={designation.id}>
                                                {designation.designation_name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label>Status:</label>

                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Status</option>

                                    <option value="Active">Active</option>

                                    <option value="Inactive">Inactive</option>
                                </select>
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