import React, { useEffect, useState } from "react";

import {
    Plus,
    Search,
    MoreVertical,
    Badge,
    Pencil,
    Trash2,
    BriefcaseBusiness
} from "lucide-react";

import api from "../../services/api";

import "./designations.css";
import {
    PMSPageHeader,
    PMSSearch,
    PMSActionButton,
} from "../../components/Common/Common";

const Designations = () => {

    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");

    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [openAction, setOpenAction] = useState(null);
    const [selectedDesignation, setSelectedDesignation] = useState(null);

    const [showForm, setShowForm] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const [designationForm, setDesignationForm] = useState({
        name: "",
        status: ""
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {

        fetchDesignations();
    }, []);

    const fetchDesignations = async () => {

        try {
            setLoading(true);

            const response = await api.get("designations/");

            console.log(
                "Designations API Response:",
                response.data
            );

            setDesignations(response.data);

            setError("");

        } catch (error) {

            console.error(
                "Designations API Error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to connect to Designations API."
            );
        } finally {

            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setDesignationForm({
            ...designationForm,
            [name]: name === "status" ? value === "true" : value
        });

        if (name === "name" && value.trim()) {
            setFormError("");
        }
    };

    const handleCreateDesignation = async () => {

        if (!designationForm.name.trim()) {
            setFormError("Designation name is required.");
            return;
        }

        if (designationForm.status === "") {
            setFormError("Status is required.");
            return;
        }

        setFormError("");

        try {
            setSaving(true);
            setError("");

            if (selectedDesignation) {

                // UPDATE
                await api.put(
                    `designations/${selectedDesignation.id}/`,
                    designationForm
                );

            } else {

                // CREATE
                await api.post(
                    "designations/",
                    designationForm
                );
            }

            setDesignationForm({
                name: "",
                status: true
            });

            setSelectedDesignation(null);
            setShowForm(false);

            await fetchDesignations();

        } catch (error) {

            console.error(
                "Designation API Error:",
                error
            );

            setError(
                error.response?.data?.name?.[0] ||
                error.response?.data?.detail ||
                "Unable to save designation."
            );

        } finally {
            setSaving(false);
        }
    };

    // EDIT DESIGNATION
    const handleEditDesignation = (designation) => {
        console.log("EDIT CLICKED:", designation);

        setSelectedDesignation(designation);

        setDesignationForm({
            name: designation.name || "",
            status:
                designation.status === true
                    ? "true"
                    : designation.status === false
                        ? "false"
                        : ""
        });

        setShowForm(true);
    };

    // DELETE 

    const handleDeleteDesignation = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this designation?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`designations/${id}/`);

            await fetchDesignations();

        } catch (error) {
            console.error(
                "Failed to delete designation:",
                error
            );

            alert("Failed to delete designation.");
        }
    };

    const handleToggleStatus = async (designation, newStatus) => {
        try {
            setError("");

            await api.put(`designations/${designation.id}/`, {
                name: designation.name,
                status: newStatus,
            });

            await fetchDesignations();
        } catch (error) {
            console.error("Failed to update designation status:", error);

            setError(
                error.response?.data?.detail ||
                error.response?.data?.status?.[0] ||
                "Unable to update designation status."
            );
        }
    };


    const filteredDesignations = designations.filter((designation) => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return String(designation.name || "")
            .toLowerCase()
            .includes(query);
    });

    const totalPages = Math.ceil(filteredDesignations.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const currentDesignations = filteredDesignations.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (

        <div className="designations-page">

            {/* PAGE HEADER */}

            <div className="designations-header">

                <div className="designation-title-section">

                    <div className="designation-title-icon">
                        <BriefcaseBusiness size={22} />
                    </div>
                    <div>
                        <h1>Designations</h1>

                        <p>Manage employee designations</p>
                    </div>
                </div>


                <button
                    className="add-designation-btn"
                    onClick={() => {
                        setSelectedDesignation(null);

                        setDesignationForm({
                            name: "",
                            status: true
                        });

                        setShowForm(true);
                    }}

                >
                    <Plus size={18} />

                    <span>
                        Add Designation
                    </span>
                </button>

            </div>

            <div className="designations-toolbar">
                <label className="designation-search" htmlFor="designation-search-input">
                    <Search size={18} aria-hidden="true" />
                    <input
                        id="designation-search-input"
                        type="search"
                        placeholder="Search designations"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </label>
            </div>

            {showForm && (

                <div className="designation-modal-overlay">

                    <div className="designation-modal">

                        {/* MODAL HEADER */}

                        <div className="designation-modal-header">

                            <h2>
                                Add New Designation
                            </h2>

                            <button
                                type="button"
                                className="designation-close-btn"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <div className="designation-form">


                            {/* NAME */}

                            <div className="designation-form-group">

                                <label>
                                    Designation Name <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={designationForm.name}
                                    onChange={handleChange}
                                    placeholder="Enter designation name"
                                />

                                {
                                    formError && (
                                        <p className="designation-form-error">
                                            {formError}
                                        </p>
                                    )
                                }

                            </div>



                            {/* STATUS */}

                            <div className="designation-form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={designationForm.status}
                                    onChange={handleChange}
                                >
                                    <option value="">
                                        Select Status
                                    </option>

                                    <option value="true">
                                        Active
                                    </option>

                                    <option value="false">
                                        Inactive
                                    </option>

                                </select>

                            </div>


                            {/* BUTTONS */}

                            <div className="designation-form-actions">

                                <button
                                    type="button"
                                    className="designation-cancel-btn"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="designation-create-btn"
                                    onClick={handleCreateDesignation}
                                    disabled={saving}
                                >
                                    {saving
                                        ? (selectedDesignation ? "Updating..." : "Creating....")
                                        : (selectedDesignation ? "Update Designation" : "Create Designation")
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {/* ERROR */}

            {error && (

                <div className="designations-error">

                    {error}

                </div>
            )}

            {/* DESIGNATIONS TABLE */}

            <div className="designations-card">

                <div className="designation-table">

                    {/* TABLE HEADER */}

                    <div className="designation-table-header">

                        <span>
                            Designation
                        </span>

                        <span>
                            Status
                        </span>

                        <span>
                            Created
                        </span>

                        <span>
                            Action
                        </span>

                    </div>

                    {/* LOADING */}

                    {loading && (

                        <div className="empty-designations">

                            Loading designations....

                        </div>

                    )}

                    {/* DATA */}

                    {!loading &&
                        currentDesignations.map((designation) => (

                            <div
                                className="designation-table-row"
                                key={designation.id}
                            >
                                <div className="designation-name">

                                    <div className="designation-icon">

                                        <BriefcaseBusiness size={18} />

                                    </div>

                                    <div>

                                        <strong>
                                            {designation.name}
                                        </strong>

                                    </div>

                                </div>



                                <div className="designation-status-menu">
                                    <button
                                        type="button"
                                        className={`designation-status-trigger ${designation.status ? "active" : "inactive"
                                            }`}
                                        onClick={() =>
                                            setOpenAction(
                                                openAction === `status-${designation.id}`
                                                    ? null
                                                    : `status-${designation.id}`
                                            )
                                        }
                                    >
                                        <span>
                                            {designation.status ? "Active" : "Inactive"}
                                        </span>

                                        <span className="status-chevron">⌄</span>
                                    </button>

                                    {openAction === `status-${designation.id}` && (
                                        <div className="designation-status-dropdown">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleToggleStatus(
                                                        designation,
                                                        !designation.status
                                                    );
                                                    setOpenAction(null);
                                                }}
                                            >
                                                {designation.status ? "Inactive" : "Active"}
                                            </button>
                                        </div>
                                    )}
                                </div>



                                <span>

                                    {designation.created_at
                                        ? (() => {

                                            const date = new Date(
                                                designation.created_at
                                            );


                                            const year = date.getFullYear();

                                            const month = String(
                                                date.getMonth() + 1
                                            ).padStart(2, "0");

                                            const day = String(
                                                date.getDate()
                                            ).padStart(2, "0");

                                            return `${year}-${month}-${day}`;
                                        })()
                                        : "-"
                                    }

                                </span>

                                <div className="designation-action-menu">

                                    <button
                                        type="button"
                                        className="designation-action-button"
                                        onClick={() => {
                                            setOpenAction(
                                                openAction === designation.id
                                                    ? null
                                                    : designation.id

                                            );
                                        }}
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {openAction === designation.id && (
                                        <div className="designation-action-dropdown">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    console.log("EDIT BUTTON CLICKED");
                                                    setOpenAction(null);
                                                    handleEditDesignation(designation);
                                                }}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setOpenAction(null);
                                                    handleDeleteDesignation(designation.id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}

                                </div>

                            </div>

                        ))
                    }

                    {/* NOT DATA */}

                    {!loading &&
                        filteredDesignations.length === 0 &&
                        !error && (

                            <div className="empty-designation">

                                {searchTerm.trim()
                                    ? "No matching designations found"
                                    : "No designations found"}

                            </div>
                        )}
                </div>

                {!loading && filteredDesignations.length > 0 && (
                    <div className="designation-pagination">
                        <div className="pagination-info">
                            Showing{" "}
                            <strong>{startIndex + 1}</strong>
                            {" - "}
                            <strong>
                                {Math.min(startIndex + itemsPerPage, filteredDesignations.length)}
                            </strong>
                            {" of "}
                            <strong>{filteredDesignations.length}</strong>
                        </div>

                        <div className="pagination-buttons">
                            <button
                                type="button"
                                className="pagination-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                                (page) => (
                                    <button
                                        type="button"
                                        key={page}
                                        className={`pagination-number ${currentPage === page ? "active" : ""
                                            }`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <button
                                type="button"
                                className="pagination-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                            >
                                Next
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </div>



    );
};

export default Designations;
