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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingUser) {
            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user.id === editingUser.id
                        ? { ...user, ...formData }
                        : user
                )
            );
        } else {
            const newUser = {
                id: Date.now(),
                ...formData,
            };

            setUsers((previousUsers) => [
                ...previousUsers,
                newUser,
            ]);
        }

        closeForm();
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this user?'
        );

        if (!confirmed) {
            return;
        }

        setUsers((previousUsers) =>
            previousUsers.filter((user) => user.id !== id)
        );
    };

    useEffect(() => {
        fetchDesignations();
        fetchRoles();
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

            setRoles(data);
        } catch (error) {
            console.error(
                "Failed to fetch roles:",
                error.response?.data || error
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
                    setCurrentPage(1);
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
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="user-name">
                                        {user.name}
                                    </td>

                                    <td>
                                        {user.email}
                                    </td>

                                    <td>
                                        {user.role}
                                    </td>

                                    <td>
                                        {user.designation}
                                    </td>

                                    <td>
                                        <span
                                            className={`user-status ${user.status.toLowerCase()}`}
                                        >
                                            {user.status}
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
                                        .filter((role) => role.status)
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
                                    <option value="">
                                        Select Status
                                    </option>

                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>
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