import { useState } from "react";

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


    const handleDeleteRole = (id) => {

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

    // Save role
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

            // Create new role
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

    // Search
    const filteredRoles = roles.filter((role) => {

        const searchText = search.toLowerCase();

        return (
            role.name.toLowerCase().includes(searchText) ||
            role.description.toLowerCase().includes(searchText)
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
                                    #
                                </th>

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
                                            {index + 1}
                                        </td>

                                        <td>

                                            <div className="role-name">

                                                <div className="role-icon">
                                                    <ShieldCheck size={17} />
                                                </div>

                                                {role.name}

                                            </div>

                                        </td>

                                        <td className="description-cell">
                                            {role.description}
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    role.status === "Active"
                                                        ? "status active-status"
                                                        : "status inactive-status"
                                                }
                                            >
                                                {role.status}
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
