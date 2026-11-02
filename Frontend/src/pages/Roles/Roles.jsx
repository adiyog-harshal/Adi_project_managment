import { useEffect, useState } from "react";

import {
    Plus,
    Pencil,
    Trash2,
    ShieldCheck,
    Search,
    MoreVertical,
} from "lucide-react";

import RoleModal from "./RoleModal";
import "./Roles.css";
import api from "../../services/api";


function Roles() {

    const [roles, setRoles] = useState([]);
    const [openStatusId, setOpenStatusId] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedRole, setSelectedRole] = useState(null);

    const [search, setSearch] = useState("");

    const [openActionId, setOpenActionId] = useState(null);

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

    
    const handleToggleRoleStatus = async (role, newStatus) => {
         try {
            await api.patch(`roles/${role.id}/`, {
                is_active: newStatus,
            });

            setOpenStatusId(null);
            await fetchRoles();
        } catch (error) {
            console.error(
                "Failed to update role status:",
                error.response?.data || error
            );
            alert("Failed to update role status.");
        }
    };

    const handleSelectStatus = async (role, isActive) => {
        if (role.is_active === isActive){
            setOpenStatusId(null);
            return;
        } 

        await handleToggleRoleStatus(role, isActive);
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

                </div>

                {/* Table */}

                <div className="table-container">

                    <table>

                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>Status</th>
                                <th>Actions</th>
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
                                            </button>

                                        
                                        </div>
                                    </td>
                                        <td>
                                            <div className="role-actions-menu">
                                                <button
                                                    type="button"
                                                    className="role-actions-trigger"
                                                    title="Actions"
                                                    aria-label={`Actions for ${role.name}`}
                                                    onClick={() =>
                                                        setOpenActionId(
                                                            openActionId === role.id ? null : role.id
                                                        )
                                                    }
                                                >
                                                    <MoreVertical size={20} />
                                                </button>
                                                 
                                                 {openActionId === role.id && (
                                                    <div className="role-actions-dropdown">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenActionId(null);
                                                                handleEditRole(role);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="role-delete-action"
                                                            onClick={() => {
                                                                setOpenActionId(null);
                                                                handleDeleteRole(role.id);
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
