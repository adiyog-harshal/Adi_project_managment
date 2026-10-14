import { useEffect, useState } from "react";

import {
    Plus,
    Pencil,
    Trash2,
    ShieldCheck,
    Search,
} from "lucide-react";

import {
    PMSPageHeader,
    PMSSearch,
    PMSActionButton,
} from "../../components/Common/Common";

import RoleModal from "./RoleModal";
import "./Roles.css";
import api from "../../services/api";


function Roles() {

    const [roles, setRoles] = useState([]);
    const [openStatusId, setOpenStatusId] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedRole, setSelectedRole] = useState(null);

    const [search, setSearch] = useState("");

    const fetchRoles = async () => {
        try {
            const response = await api.get("roles/");

            setRoles(response.data.map((role) => ({
                id: role.id,
                name: role.role_name,
                is_active: role.is_active,
                status: role.is_active ? "Active" : "Inactive"
            })));
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    
    const handleToggleRoleStatus = async (role) => {
        const newStatus = !role.is_active;

        try {
            await api.patch(`roles/${role.id}/`, {
                is_active: newStatus
            });

            await fetchRoles();

        } catch (error) {
            console.error(
                "Failed to update role status:",
                error.response?.data || error
            );

            alert("Failed to update role status.");
        }
    };


    // Open Add Role modal
    const handleAddRole = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
    };

    const handleEditRole = (role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };


    
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

            alert("Role deleted successfully.");

        } catch (error) {
            console.error(
                "Failed to delete role:",
                error.response?.data || error
            );

            alert("Failed to delete role.");
        }
    };


    // Save role
    const handleSaveRole = async (roleData) => {
        const payload = {
            role_name: roleData.name.trim(),
            is_active: roleData.status === "Active",
        };

        try {
            if (selectedRole) {
                await api.put(`roles/${selectedRole.id}/`, payload);
            } else {
                await api.post("roles/", payload);
            }

            await fetchRoles();
            setIsModalOpen(false);
            setSelectedRole(null);

        } catch (error) {
            console.error("Failed to save role:", error.response?.data || error);
            alert(
                "Failed to save role. Check the browser console for the error."
            );
        }
    };
    // Search
    const filteredRoles = roles.filter((role) => {

        const searchText = search.toLowerCase();

        return (
            role.name.toLowerCase().includes(searchText)
        );
    });

    

    return (
        <div className="roles-page">

            {/* Header */}

            <div className="page-header">

                <div>

                    <div className="page-title-wrapper">

                        <ShieldCheck
                            size={27}
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

                        <PMSSearch
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search roles..."
                                   
                        />

                    </div>

                </div>

                {/* Table */}

                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Role Name
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
                                        colSpan="5"
                                        className="empty-state"
                                    >
                                        No roles found
                                    </td>

                                </tr>

                            ) : (

                                filteredRoles.map((role, index) => (

                                    <tr key={role.id}>
                                        <td>

                                            <div className="role-name">

                                                <div className="role-icon">
                                                    <ShieldCheck size={17} />
                                                </div>

                                                {role.name}

                                            </div>

                                        </td>

                                       
                                    <td>
                                        <div className="status-dropdown-wrapper">
                                            <button
                                                type="button"
                                                className={`status ${
                                                    role.is_active ? "active-status" : "inactive-status"
                                                }`}
                                                onClick={() =>
                                                    setOpenStatusId(
                                                        openStatusId === role.id ? null : role.id
                                                    )
                                                }
                                            >
                                                {role.is_active ? "Active" : "Inactive"}
                                                <span className="status-arrow">▼</span>
                                            </button>

                                            {openStatusId === role.id && (
                                                <div className="status-dropdown-menu">
                                                    <button
                                                        type="button"
                                                        className={role.is_active ? "selected-status" : ""}
                                                        onClick={() => handleSelectStatus(role, true)}
                                                    >
                                                        Active {role.is_active ? "✓" : ""}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={!role.is_active ? "selected-status" : ""}
                                                        onClick={() => handleSelectStatus(role, false)}
                                                    >
                                                        Inactive {!role.is_active ? "✓" : ""}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
