import React, { useEffect, useState } from "react";

import {
    Plus,
    Search,
    MoreVertical,
    Badge
} from "lucide-react";

import api from "../../services/api";

import "./designations.css";

const Designations = () => {

    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [designationForm, setDesignationForm] = useState({
        name: "",
        description: "",
        status: true
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
            [name]: name === "status"
                ? value === "true"
                : value
        });
    };

    const handleCreateDesignation = async () => {

        if (!designationForm.name.trim()) {

            setError("Designation name is required.");

            return;
        }

        try {

            setSaving(true);

            setError("");

            await api.post(
                "designations/",
                designationForm
            );

            setDesignationForm({
                name: "",
                description: "",
                status: true
            });

            setShowForm(false);

            fetchDesignations();

        } catch (error) {

            console.error(
                "Create Designation API Error:",
                error
            );

            setError(
                error.response?.data?.name?.[0] ||
                error.response?.data?.detail ||
                "Unable to create designation."
            );

        } finally {

            setSaving(false);
        }
    };

    return (

        <div className="designations-page">

            {/* PAGE HEADER */}

            <div className="designations-header">

                <div>
                    <h1>
                        Designations
                    </h1>

                    <p>
                        Manage employee designations
                    </p>
                </div>

                <button
                    className="add-designation-btn"
                    onClick={() => setShowForm(true)}
                
                >
                    <Plus size={18} />

                    <span>
                        Add Designation
                    </span>
                </button>

            </div>

            {/* SEARCH */}

            <div className="designations-toolbar">

                <div className="designation-search-box">

                    <Search 
                        size={18} 
                        className="designation-search-icon"
                    />

                    <input
                        type="text"
                        placeholder="Search designations..."
                    />
                </div>

            </div>

            {/* ADD DESIGNATIONS MODAL */}

            {/* ADD DESIGNATIONS MODAL */}

            {showForm && (

                <div className="designation-modal-overlay">

                    <div className="designation-modal">

                        {/* MODAL HEADER */}

                        <div className="designation-modal-header">

                            <h2>
                                Add Designation
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

                            </div>


                            {/* DESCRIPTION */}

                            <div className="designation-form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={designationForm.description}
                                    onChange={handleChange}
                                    placeholder="Enter designation description"
                                    rows="4"
                                />

                            </div>


                            {/* STATUS */}

                            <div className="designation-form-group">

                                <label>
                                    Status
                                </label>

                                <select>

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
                                    {saving ? "Creating..." : "Create Designation"}
                                    
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
                            Description
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
                        designations.map((designation) => (

                            <div
                                className="designation-table-row"
                                key={designation.id}
                            >
                                <div className="designation-name">

                                    <div className="designation-icon">

                                        <Badge size={18} />

                                    </div>

                                    <div>

                                        <strong>
                                            {designation.name}
                                        </strong>

                                        <small>
                                            Designation #{designation.id}
                                        </small>

                                    </div>

                                </div>

                                <span className="designation-description">

                                    {designation.description || "_"}

                                </span>

                                <span>

                                    <span 
                                        className={
                                            designation.status
                                            ? "designation-status active"
                                            : "designation-status inactive"
                                        }
                                    >

                                        {designation.status
                                            ? "Active"
                                            : "Inactive"
                                        
                                        }

                                    </span>

                                </span>

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
                                    
                                    <button>
                                        <MoreVertical size={18} />
                                    </button>

                                </div>

                            </div>

                        ))
                    }

                    {/* NOT DATA */}

                    {!loading &&
                        designations.length === 0 &&
                        !error && (

                            <div className="empty-designation">

                                No designations found

                            </div>
                        )}
                </div>
            </div>
        </div>    

        

    );
};

export default Designations;