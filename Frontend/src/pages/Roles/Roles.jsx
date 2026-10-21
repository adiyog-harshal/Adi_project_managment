import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
    Plus,
    Pencil,
    Trash2,
    ShieldCheck,
    Search,
    MoreVertical,
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
    const [openActionRoleId, setOpenActionRoleId] = useState(null);
    const [actionMenuPosition, setActionMenuPosition] = useState({ top: 0, right: 8 });
    const actionButtonRef = useRef(null);
    const actionMenuRef = useRef(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");


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

    const handleSelectStatus = async (role, isActive) => {
        try {
            await api.patch(`roles/${role.id}/`, {
                is_active: isActive
            });

            await fetchRoles();
            setOpenStatusId(null);

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
        setOpenActionRoleId(null);
        setSelectedRole(null);
        setIsModalOpen(true);
    };

    const handleEditRole = (role) => {
        setOpenActionRoleId(null);
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

        } catch (errorf) {
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
        setIsModalOpen(false);
        setSelectedRole(null);
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

        const matchesSearch = (
            role.name.toLowerCase().includes(searchText) ||
            role.description.toLowerCase().includes(searchText)
        );

        const matchesStatus =
            statusFilter === "All statuses" || role.status === statusFilter;

        return matchesSearch && matchesStatus;
    });


    return (
        <div className="roles-page">
            <div className="roles-page-header">
                <div>
                    <div className="roles-title-row">
                        <ShieldCheck size={28} className="roles-title-icon" />
                        <h1>Roles</h1>
                    </div>
                    <p className="roles-subtitle">Manage roles and permissions</p>
                </div>
                <button
                    className="roles-add-button"
                    type="button"
                    onClick={handleAddRole}
                >
                    <Plus size={18} />
                    <span>Add role</span>
                </button>
            </div>

            <div className="roles-toolbar">
                <label className="roles-search">
                    <Search size={18} aria-hidden="true" />
                    <span className="visually-hidden">Search roles</span>
                    <input
                        type="search"
                        placeholder="Search roles..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </label>
            </div>

            <section className="roles-table-card" aria-labelledby="roles-table-title">
                <div className="roles-card-header">
                    <div>
                        <h2 id="roles-table-title">All roles</h2>
                        <p>{filteredRoles.length} of {roles.length} roles shown</p>
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

                <div className="roles-table-scroll">
                    <table className="roles-table">
                        <thead>
                            <tr>
                                <th scope="col">Role</th>
                                <th scope="col">Status</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoles.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="roles-empty-state">
                                        No roles found
                                    </td>
                                </tr>
                            ) : (
                                filteredRoles.map((role) => (
                                    <tr key={role.id}>
                                        <td>
                                            <div className="roles-role-name">
                                                <span className="roles-role-icon">
                                                    <ShieldCheck size={17} />
                                                </span>
                                                <strong>{role.name}</strong>
                                            </div>

                                        </td>


                                        <td>
                                            <div className="status-dropdown-wrapper">
                                                <button
                                                    type="button"
                                                    className={`status ${role.is_active ? "active-status" : "inactive-status"
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
                                            <div className="roles-actions">
                                                <button
                                                    className="roles-action-button"
                                                    type="button"
                                                    aria-label={`Actions for ${role.name}`}
                                                    aria-haspopup="menu"
                                                    aria-expanded={openActionRoleId === role.id}
                                                    title="Role actions"
                                                    onClick={(event) => toggleActionMenu(role.id, event)}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {openActionRoleId === role.id && createPortal(
                                                    <div
                                                        ref={actionMenuRef}
                                                        className="roles-action-menu-list"
                                                        role="menu"
                                                        aria-label={`Actions for ${role.name}`}
                                                        style={{ top: actionMenuPosition.top, right: actionMenuPosition.right }}
                                                    >
                                                        <button type="button" role="menuitem" onClick={handleAddRole}>
                                                            <Plus size={16} /> Add role
                                                        </button>
                                                        <button type="button" role="menuitem" onClick={() => handleEditRole(role)}>
                                                            <Pencil size={16} /> Edit role
                                                        </button>
                                                        <button type="button" role="menuitem" className="delete-action" onClick={() => handleDeleteRole(role.id)}>
                                                            <Trash2 size={16} /> Delete role
                                                        </button>
                                                    </div>,
                                                    document.body
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

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
