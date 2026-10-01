import { useEffect, useState } from "react";
import { X } from "lucide-react";

const emptyRole = {
    role_name: "",
    description: "",
    is_active: true,
};

function RoleModal({ isOpen, onClose, onSave, role }) {
    const [formData, setFormData] = useState(emptyRole);

    useEffect(() => {
        if (role) {
            setFormData({
                role_name: role.role_name || "",
                description: role.description || "",
                is_active: role.is_active ?? true,
            });
        } else {
            setFormData(emptyRole);
        }
    }, [role, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        onSave({
            role_name: formData.role_name.trim(),
            description: formData.description.trim(),
            is_active: formData.is_active,
        });
    };

    return (
        <div
            className="modal-overlay"
            role="presentation"
            onMouseDown={onClose}
        >
            <div
                className="role-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="role-modal-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="modal-header">
                    <div>
                        <h2 id="role-modal-title">
                            {role ? "Edit Role" : "Add Role"}
                        </h2>

                        <p>
                            {role
                                ? "Update this role's details."
                                : "Create a new role for your team."}
                        </p>
                    </div>

                    <button
                        className="close-button"
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="role-name">
                            Role name
                        </label>

                        <input
                            id="role-name"
                            type="text"
                            required
                            value={formData.role_name}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    role_name: event.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role-description">
                            Description
                        </label>

                        <textarea
                            id="role-description"
                            required
                            rows="3"
                            value={formData.description}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    description: event.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role-status">
                            Status
                        </label>

                        <select
                            id="role-status"
                            value={formData.is_active}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    is_active:
                                        event.target.value === "true",
                                })
                            }
                        >
                            <option value="true">
                                Active
                            </option>

                            <option value="false">
                                Inactive
                            </option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button
                            className="cancel-button"
                            type="button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            className="save-button"
                            type="submit"
                        >
                            Save Role
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RoleModal;