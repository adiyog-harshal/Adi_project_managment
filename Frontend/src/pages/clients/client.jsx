import { useEffect, useState } from "react";
import {
    BriefcaseBusiness,
    MoreVertical,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { PMSPageHeader } from "../../components/Common/Common";
import api from "../../services/api";
import "./clientl.css";

const emptyClient = {
    client_name: "",
    project_name: "",
    phone_number: "",
    contract: "",
    address: "",
};

function getErrorMessage(error) {
    const responseData = error.response?.data;

    if (responseData?.detail) {
        return typeof responseData.detail === "string"
            ? responseData.detail
            : JSON.stringify(responseData.detail);
    }

    if (responseData && typeof responseData === "object") {
        const messages = Object.entries(responseData).flatMap(([field, value]) => {
            const details = Array.isArray(value) ? value : [value];
            return details.map((detail) =>
                `${field.replaceAll("_", " ")}: ${
                    typeof detail === "string" ? detail : JSON.stringify(detail)
                }`
            );
        });
        if (messages.length) {
            return messages.join(" ");
        }
    }

    if (!error.response) {
        return `Could not connect to the API at ${api.defaults.baseURL}. Make sure the Django server is running. (${error.message})`;
    }

    return `The server returned ${error.response.status}. ${
        typeof responseData === "string" && responseData
            ? responseData.slice(0, 300)
            : error.message
    }`;
}

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [form, setForm] = useState(emptyClient);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchClients = async () => {
        try {
            const response = await api.get("clients/");
            setClients(response.data);
            setError("");
        } catch (requestError) {
            console.error("Failed to fetch clients:", requestError);
            setError(getErrorMessage(requestError));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isCurrent = true;

        api.get("clients/")
            .then((response) => {
                if (isCurrent) {
                    setClients(response.data);
                    setError("");
                }
            })
            .catch((requestError) => {
                console.error("Failed to fetch clients:", requestError);
                if (isCurrent) {
                    setError(getErrorMessage(requestError));
                }
            })
            .finally(() => {
                if (isCurrent) {
                    setIsLoading(false);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, []);

    const filteredClients = clients.filter((client) =>
        [client.client_name, client.project_name, client.phone_number]
            .join(" ")
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    );

    const openAddForm = () => {
        setEditingClient(null);
        setForm(emptyClient);
        setError("");
        setIsModalOpen(true);
    };

    const openEditForm = (client) => {
        setEditingClient(client);
        setForm({
            client_name: client.client_name || "",
            project_name: client.project_name || "",
            phone_number: client.phone_number || "",
            contract: client.contract || "",
            address: client.address || "",
        });
        setOpenMenuId(null);
        setError("");
        setIsModalOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setError("");

        const payload = Object.fromEntries(
            Object.entries(form).map(([key, value]) => [key, value.trim()])
        );

        try {
            if (editingClient) {
                await api.put(`clients/${editingClient.id}/`, payload);
            } else {
                await api.post("clients/", payload);
            }

            setIsModalOpen(false);
            setEditingClient(null);
            setForm(emptyClient);
            await fetchClients();
        } catch (requestError) {
            console.error("Failed to save client:", requestError);
            setError(getErrorMessage(requestError));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (client) => {
        setOpenMenuId(null);
        if (!window.confirm(`Delete ${client.client_name}? This cannot be undone.`)) {
            return;
        }

        setError("");
        try {
            await api.delete(`clients/${client.id}/`);
            await fetchClients();
        } catch (requestError) {
            console.error("Failed to delete client:", requestError);
            setError(getErrorMessage(requestError));
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        setForm(emptyClient);
        setError("");
    };

    return (
        <section className="clients-page" onClick={() => setOpenMenuId(null)}>
            <PMSPageHeader
                title="Clients"
                subtitle="Manage clients and their projects."
                buttonText="Add Client"
                buttonIcon={<Plus size={16} />}
                onButtonClick={openAddForm}
            />

            {error && !isModalOpen && (
                <div className="clients-error" role="alert">{error}</div>
            )}

            <div className="clients-panel">
                <div className="clients-toolbar">
                    <div>
                        <h2>Client Directory</h2>
                        <p>{clients.length} client{clients.length === 1 ? "" : "s"}</p>
                    </div>
                    <label className="clients-search">
                        <Search size={17} aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search clients, projects, or contact"
                            aria-label="Search clients, projects, or contact"
                        />
                    </label>
                </div>

                <div className="clients-table-wrap">
                    <table className="clients-table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Project Name</th>
                                <th>Contact</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td className="clients-empty" colSpan="4">Loading clients...</td>
                                </tr>
                            ) : filteredClients.length ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id}>
                                        <td>
                                            <span className="client-name">
                                                <span className="client-icon">
                                                    <BriefcaseBusiness size={17} />
                                                </span>
                                                {client.client_name}
                                            </span>
                                        </td>
                                        <td>{client.project_name}</td>
                                        <td>{client.phone_number || "—"}</td>
                                        <td className="client-action-cell">
                                            <div
                                                className="client-action-wrap"
                                                onClick={(event) => event.stopPropagation()}
                                            >
                                                <button
                                                    type="button"
                                                    className="client-action-button"
                                                    aria-label={`Actions for ${client.client_name}`}
                                                    aria-expanded={openMenuId === client.id}
                                                    onClick={() => setOpenMenuId(
                                                        openMenuId === client.id ? null : client.id
                                                    )}
                                                >
                                                    <MoreVertical size={19} />
                                                </button>
                                                {openMenuId === client.id && (
                                                    <div className="client-action-menu">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditForm(client)}
                                                        >
                                                            <Pencil size={16} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="client-delete-action"
                                                            onClick={() => handleDelete(client)}
                                                        >
                                                            <Trash2 size={16} />
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
                                    <td className="clients-empty" colSpan="4">
                                        {search
                                            ? "No matching clients found."
                                            : "No clients yet. Add a client to get started."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="client-modal-backdrop" onMouseDown={closeModal}>
                    <section
                        className="client-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="client-modal-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="client-modal-header">
                            <div>
                                <h2 id="client-modal-title">
                                    {editingClient ? "Edit Client" : "Add Client"}
                                </h2>
                                <p>Enter the client and project details.</p>
                            </div>
                            <button
                                type="button"
                                className="client-modal-close"
                                onClick={closeModal}
                                aria-label="Close form"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {error && <div className="clients-error" role="alert">{error}</div>}

                        <form className="client-form" onSubmit={handleSubmit}>
                            <label>
                                Client Name
                                <input
                                    type="text"
                                    maxLength="200"
                                    value={form.client_name}
                                    onChange={(event) => setForm({ ...form, client_name: event.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Project Name
                                <input
                                    type="text"
                                    maxLength="200"
                                    value={form.project_name}
                                    onChange={(event) => setForm({ ...form, project_name: event.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Contact Phone
                                <input
                                    type="tel"
                                    maxLength="30"
                                    value={form.phone_number}
                                    onChange={(event) => setForm({ ...form, phone_number: event.target.value })}
                                />
                            </label>
                            <label>
                                Contract
                                <input
                                    type="text"
                                    maxLength="225"
                                    value={form.contract}
                                    onChange={(event) => setForm({ ...form, contract: event.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Address
                                <textarea
                                    rows="3"
                                    value={form.address}
                                    onChange={(event) => setForm({ ...form, address: event.target.value })}
                                    required
                                />
                            </label>
                            <div className="client-form-actions">
                                <button type="button" className="client-cancel-button" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="client-save-button" disabled={isSaving}>
                                    {isSaving
                                        ? "Saving..."
                                        : editingClient ? "Save Changes" : "Add Client"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </section>
    );
}
