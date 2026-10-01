import { useState, useEffect } from "react";

import api from "../services/api";

import {
    Plus,
    Pencil,
    Trash2,
    ShieldCheck,
    Search,
} from "lucide-react";

import RoleModal from "./RoleModal";

function Roles() {

    const [roles, setRoles] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedRole, setSelectedRole] = useState(null);

    const [search, setSearch] = useState("");

    // Open Add Role modal
    const handleAddRole = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
    };

    const handleEditRole = (role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    // DELETE ROLE
    const handleDeleteRole = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this role?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(`roles/${id}/`);

            await fetchRoles();

        } catch (error) {

            console.error("Failed to delete role:", error);

            alert("Failed to delete role.");

        }
    };

    // Save role
    const handleSaveRole = async (roleData) => {
        try {
            console.log("ROLE DATA:", roleData);

            if (selectedRole) {
                await api.put(`roles/${selectedRole.id}/`, roleData);
            } else {
                await api.post("roles/", roleData);
            }

            await fetchRoles();

            // Close form after successful save
            setIsModalOpen(false);
            setSelectedRole(null);

        } catch (error) {
            console.error("Failed to save role:", error);
            console.error("Backend response:", error.response?.data);

            alert(
                error.response?.data
                    ? JSON.stringify(error.response.data)
                    : "Failed to save role."
            );
        }
    };
    // Search
    const filteredRoles = roles.filter((role) => {

        const searchText = search.toLowerCase();

        return (
            (role.role_name || "").toLowerCase().includes(searchText) ||
            (role.description || "").toLowerCase().includes(searchText)
        );
    });
    const fetchRoles = async () => {
        try {
            const response = await api.get("roles/");
            console.log("ROLES DATA:", response.data);

            setRoles(response.data);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    return (
        <div className="roles-page">

            {/* Header */}

            <div className="page-header">

                <div>

                    <div className="page-title-wrapper">

                        <ShieldCheck
                            size={22}
                            className="page-title-icon"
                        />

                        <h1>
                            Role Management
                        </h1>

                    </div>

                    <p className="page-description">
                        Manage roles and permissions
                    </p>

                </div>

                <button
                    className="add-role-button"
                    onClick={handleAddRole}
                >
                    <Plus size={18} />
                    Add Role
                </button>

            </div>


            <div className="roles-card">



                <div className="card-header">

                    <div>

                        <h2>
                            Roles
                        </h2>

                        <p>
                            {roles.length} roles configured
                        </p>

                    </div>

                    <div className="search-box">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search roles..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                </div>

                {/* Table */}

                {/* Table */}

                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Role Name
                                </th>

                                <th>
                                    Description
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredRoles.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="4"
                                        className="empty-state"
                                    >
                                        No roles found
                                    </td>

                                </tr>

                            ) : (

                                filteredRoles.map((role) => (

                                    <tr key={role.id}>

                                        <td>

                                            <div className="role-name">

                                                <div className="role-icon">
                                                    <ShieldCheck size={17} />
                                                </div>

                                                {role.role_name}

                                            </div>

                                        </td>

                                        <td className="description-cell">
                                            {role.description}
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    role.is_active
                                                        ? "status active-status"
                                                        : "status inactive-status"
                                                }
                                            >
                                                {role.is_status ? "Active" : "Inactive"}
                                            </span>

                                        </td>

                                        <td>

                                            <div className="action-buttons">

                                                <button
                                                    className="edit-button"
                                                    title="Edit Role"
                                                    onClick={() =>
                                                        handleEditRole(role)
                                                    }
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    title="Delete Role"
                                                    onClick={() =>
                                                        handleDeleteRole(role.id)
                                                    }
                                                >
                                                    <Trash2 size={17} />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* Modal */}

            <RoleModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedRole(null);
                }}
                onSave={handleSaveRole}
                role={selectedRole}
            />

        </div>
    );
}

export default Roles;
