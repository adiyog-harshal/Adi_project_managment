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
    MoreVertical,
    Pencil,
    Trash2,
    X,
    Copy,
} from "lucide-react";

function Users() {
    console.count("Users component rendered")
    const [users, setUsers] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [roles, setRoles] = useState([]);

    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [credentials, setCredentials] = useState(null);

    const [currentUser, setCurrentUser] = useState(null);
    const [openActionId, setOpenActionId] = useState(null);

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

    const fetchCurrentUser = async () => {
        try {
            const response = await api.get("profile/");
            setCurrentUser(response.data);
        } catch (error) {
            console.error("Failed to fetch current user:", error);
        }
    };

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
            name: user.name === "N/A" ? "" : user.name,
            email: user.email || "",
            role: String(user.role_id ?? ""),
            designation: String(user.designationId || ""),
            status: user.status || "Active",
        });

        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingUser(null);
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

    try {
        if (editingUser) {
            // Update existing user
            await api.put(`users/${editingUser.id}/`, payload);

            await fetchUsers();
            closeForm();

            alert("User updated successfully.");

        } else {
            // Create new user
            const response = await api.post("users/", payload);

            console.log("Create user response:", response.data);

            await fetchUsers();
            closeForm();

            // Display generated login credentials
            if (response.data.credentials) {
                setCredentials(response.data.credentials);
            } else {
                alert("User created, but login credentials were not returned by the backend.");
            }
        }

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

// Reset Employee Password
const handleResetPassword = async (user) => {
    const confirmReset = window.confirm(
        `Are you sure you want to reset password for ${user.name}?`
    );

    if (!confirmReset) return;

    try {
        const response = await api.post(
            `users/${user.id}/reset-password/`
        );

        setCredentials(response.data.credentials);

    } catch (error) {
        console.error("Password reset failed:", error);

        alert(
            error.response?.data?.detail ||
            "Failed to reset password."
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

    <CommonSearch
        search={search}
        setSearch={setSearch}
        placeholder="Search users..."
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
                            filteredUsers.map((user) => (
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
                                            className={`user-status ${
                                                (user.status || "Inactive").toLowerCase()

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
                                                <div className="action-menu-wrapper">

                                                    {/* THREE DOTS BOTTON */}
                                                    <button
                                                        type="button"
                                                        className='action-menu-trigger'
                                                        onClick={() =>
                                                            setOpenActionId(
                                                                openActionId === user.id ? null : user.id
                                                            )
                                                        }
                                                        title="More actions"
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>

                                                    {/* DROPDOWN Menu */}
                                                    {openActionId === user.id && (
                                                        <div className='action-dropdown'>

                                                            <button
                                                                type="button"
                                                                onClick={() =>{
                                                                    openEditForm(user);
                                                                    setOpenActionId(null);
                                                                }}
                                                            >
                                                                <Pencil size={15} />
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="delete-action"
                                                                onClick={() => {
                                                                    handleDelete(user.id);
                                                                    setOpenActionId(null);
                                                                }}
                                                            >
                                                                <Trash2 size={15} />
                                                                Delete
                                                            </button>
                                                            
                                                        {/* {(currentUser?.is_staff || currentUser?.is_superuser) && ( */}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    handleResetPassword(user);
                                                                    setOpenActionId(null);
                                                                }}                                                                
                                                            >
                                                                <LockKeyhole size={15} />
                                                                Reset Password
                                                            </button>

                                                        
                                                        
                                                        </div>
                                                    )}
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
                                            <option value={role.id} >{role.name}</option>
                                        ))}
                                </select>
                            </div>

                            {/* Designation */}
                            <div>
                                <label htmlFor="user-designation">Designation:</label>

                                <select
                                    id="user-designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Designation</option>

                                    {designations
                                        .filter((designation) => designation.is_active !== false)
                                        .map((designation) => (
                                            <option value={designation.id}>{designation.name}</option>
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
            {/* Employee Login Credentials Modal */}
            {/* Employee Login Credentials Modal */}
            {credentials && (
                <div className="credentials-overlay">
                    <div className="credentials-modal">

                        {/* Close Button */}
                        <button
                            type="button"
                            className="credentials-close"
                            onClick={() => setCredentials(null)}
                        >
                            <X size={20} />
                        </button>

                        {/* Header */}
                        <div className="credentials-header">
                            <div className="credentials-icon">
                                <ShieldCheck size={30} />
                            </div>

                            <h2>Employee Created Successfully!</h2>

                            <p>
                                Employee login credentials are ready.
                                Share them securely with the employee.
                            </p>
                        </div>

                        {/* Username */}
                        <div className="credentials-field">
                            <label>Username</label>

                            <div className="credentials-input-group">
                                <input
                                    type="text"
                                    value={credentials.username}
                                    readOnly
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigator.clipboard.writeText(credentials.username)
                                    }
                                >
                                    <Copy size={16} />
                                    Copy
                                </button>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="credentials-field">
                            <label>Temporary Password</label>

                            <div className="credentials-input-group">
                                <input
                                    type="text"
                                    value={credentials.password}
                                    readOnly
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigator.clipboard.writeText(credentials.password)
                                    }
                                >
                                    <Copy size={16} />
                                    Copy
                                </button>
                            </div>
                        </div>

                        {/* Security Message */}
                        <div className="credentials-warning">
                            <LockKeyhole size={18} />

                            <p>
                                Please share these credentials securely.
                                The employee should change their password
                                after logging in.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="credentials-footer">
                            <button
                                type="button"
                                className="credentials-done-btn"
                                onClick={() => setCredentials(null)}
                            >
                                Done
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
export default Users;