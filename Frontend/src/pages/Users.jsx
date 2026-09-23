import {useState} from 'react';
function Users() {
    const [users, setUsers] = useState([
        { id: 1, name: 'Admin User', email: 'admin@gmail.com',
            role: 'Admin',designation:'Administrator',
        status:'Active' },
        {id: 2, name: 'John Doe', email: 'john.doe@gmail.com',
            role: 'User',designation:'Software Engineer',
        status:'Active' },
    ]);
    const [search,setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingUser, setEditingUser] = useState(null)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        designation:'',
        status:'Active'
    });
    const filteredUsers = users.filter((user) =>
        `${user.name} ${user.email} ${user.role} ${user.designation} ${user.status}`.toLowerCase().includes(search.toLowerCase()));
    
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

    }
    const openAddForm = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            role: '',
            designation:'',
            status:'Active'
        });
        setShowForm(true);
    }

    const openEditForm = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            designation:user.designation,
            status:user.status
        });
        setShowForm(true);
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user.id === editingUser.id ? { ...user, ...formData } : user
                )
            );
        } else {
            const newUser = {
                id: Date.now(),
                ...formData,
            };
            setUsers((previousUsers) => [...previousUsers, newUser]);
        }
        setShowForm(false)
        setEditingUser(null)
    }
    const handleDelete = (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this user?')
        if (!confirmed) {
            return
        }

        setUsers((previousUsers) =>
            previousUsers.filter((user) => user.id !== id)
        )
    }

    return (
        <div className="users-page">
            <div className="users-header">
                <div>
                    <h1>Users</h1>
                    <p>Mnaage users and their access to the system.</p>
                </div>
                <button type="button" onClick={openAddForm}>
                    + Add User
                </button>
            </div>

            <div className="users-toolbar">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="users-table-container">
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
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.designation}</td>
                                    <td>{user.status}</td>
                                    <td>
                                        <button type="button" onClick={() => openEditForm(user)}>
                                            Edit
                                        </button>
                                        <button type="button" onClick={() => handleDelete(user.id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="user-form-overlay">
                    <div className="user-form">
                        <h2>
                            {editingUser ? 'Edit User' : 'Add User'}
                        </h2>
                        <form onSubmit={handleSubmit}>
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
                            <div>
                                <label>Role:</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="User">User</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Team Lead">Team Lead</option>
                                    <option value="Team Member">Team Member</option>
                                    <option value="Viewer">Viewer</option>
                                </select>
                            </div>
                            <div>
                                <label>Designation:</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Status:</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="user-form-actions">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingUser(null)
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit">{editingUser ? 'Update User' : 'Create User'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Users
