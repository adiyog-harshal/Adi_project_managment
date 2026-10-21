import { useEffect, useState } from "react";
import { X } from "lucide-react";

const emptyRole = {
    name: "",
    status: "Active",
};

function RoleModal({ isOpen, onClose, onSave, role }) {
    const [formData, setFormData] = useState(emptyRole);

    useEffect(() => {
        setFormData(role ? { ...role } : emptyRole);
    }, [role, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        console.log("Save Role clicked");
        console.log("Form data:", formData);

        if (!formData.name.trim()) {
            alert("Please enter a role name");
            return;
        }

        onSave({
            name: formData.name.trim(),
            status: formData.status,
        });
    };

    return (
        <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
            <div
                className="role-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="role-modal-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="modal-header">
                    <div>
                        <h2 id="role-modal-title">{role ? "Edit Role" : "Add Role"}</h2>
                        <p>{role ? "Update this role's details." : "Create a new role for your team."}</p>
                    </div>
                    <button className="close-button" type="button" aria-label="Close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="role-name">Role name</label>
                        <input
                            id="role-name"
                            required
                            value={formData.name}
                            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role-status">Status</label>
                        <select
                            id="role-status"
                            value={formData.status}
                            onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button className="cancel-button" type="button" onClick={onClose}>Cancel</button>
                        <button className="save-button" type="submit">Save Role</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RoleModal;
