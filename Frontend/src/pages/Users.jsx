
import { useState } from 'react';
import './Users.css';

function Users() {
    const [users, setUsers] = useState([
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@gmail.com',
            role: 'Admin',
            designation: 'Administrator',
            status: 'Active',
        },
        {
            id: 2,
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            role: 'Team Member',
            designation: 'Software Developer',
            status: 'Active',
        },
    ]);

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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Stop submission if validation fails
        if (!validateForm()) {
            return;
        }

        const cleanedFormData = {
            ...formData,
            name: formData.name.trim(),
            email: formData.email.trim(),
        };

        if (editingUser) {
            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user.id === editingUser.id
                        ? { ...user, ...cleanedFormData }
                        : user
                )
            );
        } else {
            const newUser = {
                id: Date.now(),
                ...cleanedFormData,
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
            <div className="users-toolbar">
                <div className="users-search-box">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
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
                                                className={`user-action-menu ${
                                                    index === filteredUsers.length - 1
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
                                    <option value="">
                                        Select Role
                                    </option>

                                    <option value="Admin">
                                        Admin
                                    </option>

                                    <option value="Project Manager">
                                        Project Manager
                                    </option>

                                    <option value="Team Lead">
                                        Team Lead
                                    </option>

                                    <option value="Team Member">
                                        Team Member
                                    </option>

                                    <option value="Viewer">
                                        Viewer
                                    </option>
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

                                    <option value="Project Manager">
                                        Project Manager
                                    </option>

                                    <option value="Team Lead">
                                        Team Lead
                                    </option>

                                    <option value="Software Developer">
                                        Software Developer
                                    </option>

                                    <option value="Senior Software Developer">
                                        Senior Software Developer
                                    </option>

                                    <option value="QA Engineer">
                                        QA Engineer
                                    </option>

                                    <option value="UI/UX Designer">
                                        UI/UX Designer
                                    </option>

                                    <option value="Business Analyst">
                                        Business Analyst
                                    </option>

                                    <option value="HR">
                                        HR
                                    </option>

                                    <option value="Intern">
                                        Intern
                                    </option>
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
