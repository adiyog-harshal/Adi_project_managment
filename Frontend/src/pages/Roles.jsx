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

import RoleModal from "./RoleModal";
import "./Roles.css";

function Roles() {

    const [roles, setRoles] = useState([
        {
            id: 1,
            name: "Super Admin",
            description: "Full access to the PMS system",
            status: "Active",
        },


    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedRole, setSelectedRole] = useState(null);
    const [openActionRoleId, setOpenActionRoleId] = useState(null);
    const [actionMenuPosition, setActionMenuPosition] = useState({ top: 0, right: 8 });
    const actionButtonRef = useRef(null);
    const actionMenuRef = useRef(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");


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


    const handleDeleteRole = (id) => {
        setOpenActionRoleId(null);

        const confirmed = window.confirm(
            "Are you sure you want to delete this role?"
        );

        if (!confirmed) {
            return;
        }

        setRoles((previousRoles) =>
            previousRoles.filter((role) => role.id !== id)
        );
    };

    useEffect(() => {
        if (openActionRoleId === null) return undefined;

        const closeMenu = (event) => {
            if (event.type === "keydown" && event.key !== "Escape") return;
            if (event.type === "pointerdown" && (
                actionButtonRef.current?.contains(event.target) ||
                actionMenuRef.current?.contains(event.target)
            )) return;
            setOpenActionRoleId(null);
        };

        document.addEventListener("pointerdown", closeMenu);
        document.addEventListener("keydown", closeMenu);
        return () => {
            document.removeEventListener("pointerdown", closeMenu);
            document.removeEventListener("keydown", closeMenu);
        };
    }, [openActionRoleId]);

    const toggleActionMenu = (roleId, event) => {
        if (openActionRoleId === roleId) {
            setOpenActionRoleId(null);
            return;
        }

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const menuHeight = 148;
        const menuWidth = 168;
        actionButtonRef.current = button;
        setActionMenuPosition({
            top: rect.bottom + menuHeight > window.innerHeight ? rect.top - menuHeight - 4 : rect.bottom + 4,
            right: Math.min(Math.max(8, window.innerWidth - rect.right), window.innerWidth - menuWidth - 8),
        });
        setOpenActionRoleId(roleId);
    };

    const handleSaveRole = (roleData) => {

        if (selectedRole) {


            setRoles((previousRoles) =>
                previousRoles.map((role) =>
                    role.id === selectedRole.id
                        ? {
                            ...role,
                            ...roleData,
                        }
                        : role
                )
            );

        } else {


            const newRole = {
                id: Date.now(),
                ...roleData,
            };

            setRoles((previousRoles) => [
                ...previousRoles,
                newRole,
            ]);
        }

        setIsModalOpen(false);
        setSelectedRole(null);
    };


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
                                            <span span className={`roles-status ${role.status === "Active" ? "is-active" : "is-inactive"}`}>
                                                {role.status}
                                            </span>
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
