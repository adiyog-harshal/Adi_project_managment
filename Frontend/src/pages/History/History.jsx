
import { Fragment,useEffect, useState } from "react";
import {
    History as HistoryIcon,
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
} from "lucide-react";

import api from "../../services/api";
import "./History.css";

const MODULES = [
    "Projects",
    "Tasks",
    "Clients",
    "Sprints",
    "Milestones",
    "Users",
    "Comments",
    "Designations",
    "Roles",
];

const ACTIONS = [
    "Created",
    "Updated",
    "Deleted",
    "Assigned",
    "Unassigned",
    "Completed",
    "Started",
    "Status Changed",
];

const PAGE_SIZE = 10;

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString();
}

function formatJson(value) {
    return JSON.stringify(value ?? {}, null, 2);
}

function getErrorMessage(error) {
    const data = error.response?.data;

    if (data?.detail) {
        return data.detail;
    }

    if (!error.response) {
        return `Unable to connect to the API. Make sure Django is running. (${error.message})`;
    }

    return `Server error (${error.response.status}). ${
        typeof data === "string" ? data : error.message
    }`;
}

export default function History() {
    const [activities, setActivities] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [module, setModule] = useState("");
    const [action, setAction] = useState("");

    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    const [expandedId, setExpandedId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;

        const fetchHistory = async () => {
            setIsLoading(true);
            setError("");

            try {
                const response = await api.get("history/", {
                    params: {
                        page,
                        page_size: PAGE_SIZE,
                        ...(module && { module }),
                        ...(action && { action }),
                        ...(appliedSearch && { search: appliedSearch }),
                    },
                });

                if (!isCurrent) return;

                const data = response.data;
                const rows = Array.isArray(data)
                    ? data
                    : data.results || [];

                setActivities(rows);
                setTotalCount(
                    Array.isArray(data)
                        ? rows.length
                        : data.count ?? rows.length
                );

                setHasNext(Boolean(data.next));
                setHasPrevious(Boolean(data.previous));
                setExpandedId(null);
            } catch (requestError) {
                if (!isCurrent) return;

                console.error("Failed to fetch history:", requestError);
                setError(getErrorMessage(requestError));
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        };

        fetchHistory();

        return () => {
            isCurrent = false;
        };
    }, [page, module, action, appliedSearch, refreshKey]);

    const handleSearch = (event) => {
        event.preventDefault();
        setPage(1);
        setAppliedSearch(searchInput.trim());
    };

    const clearFilters = () => {
        setSearchInput("");
        setAppliedSearch("");
        setModule("");
        setAction("");
        setPage(1);
    };

    const totalPages = Math.max(
        1,
        Math.ceil(totalCount / PAGE_SIZE)
    );

    return (
        <section className="history-page">
            <div className="history-header">
                <div>
                    <div className="history-title">
                        <HistoryIcon size={26} />
                        <h2>Activity History</h2>
                    </div>

                    <p>
                        Track activities and changes made across the
                        project management system.
                    </p>
                </div>

                <button
                    type="button"
                    className="history-refresh"
                    onClick={() => setRefreshKey((current) => current + 1)}
                    title="Refresh history"
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="history-error" role="alert">
                    {error}
                </div>
            )}

            <div className="history-panel">
                <div className="history-toolbar">
                    <div className="history-summary">
                        <h2>Activity Records</h2>
                        <p>
                            {totalCount} record
                            {totalCount === 1 ? "" : "s"} found
                        </p>
                    </div>

                    <form
                        className="history-search"
                        onSubmit={handleSearch}
                    >
                        <Search size={17} />

                        <input
                            type="search"
                            placeholder="Search activities..."
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                        />

                        <button type="submit">Search</button>
                    </form>
                </div>

                <div className="history-filters">
                    <label>
                        Module

                        <select
                            value={module}
                            onChange={(event) => {
                                setModule(event.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Modules</option>

                            {MODULES.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Action

                        <select
                            value={action}
                            onChange={(event) => {
                                setAction(event.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Actions</option>

                            {ACTIONS.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="button"
                        className="history-clear"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                </div>

                <div className="history-table-wrap">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>User</th>
                                <th>Module</th>
                                <th>Action</th>
                                <th>Object</th>
                                <th>Description</th>
                                <th>Details</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="history-empty"
                                    >
                                        Loading activity history...
                                    </td>
                                </tr>
                            ) : activities.length > 0 ? (
                                activities.map((item) => (
                                    <Fragment key={item.id}>
                                        <tr>
                                            <td className="history-date">
                                                {formatDate(item.created_at)}
                                            </td>

                                            <td>
                                                {item.username || "Deleted User"}
                                            </td>

                                            <td>
                                                <span className="history-module">
                                                    {item.module}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`history-action action-${(
                                                        item.action || ""
                                                    )
                                                        .toLowerCase()
                                                        .replaceAll(" ", "-")}`}
                                                >
                                                    {item.action}
                                                </span>
                                            </td>

                                            <td>
                                                {item.object_name || "—"}
                                            </td>

                                            <td className="history-description">
                                                {item.description || "—"}
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="history-details-button"
                                                    onClick={() =>
                                                        setExpandedId(
                                                            expandedId === item.id
                                                                ? null
                                                                : item.id
                                                        )
                                                    }
                                                >
                                                    Details
                                                    <ChevronDown
                                                        size={15}
                                                        className={
                                                            expandedId === item.id
                                                                ? "history-chevron-open"
                                                                : ""
                                                        }
                                                    />
                                                </button>
                                            </td>
                                        </tr>

                                        {expandedId === item.id && (
                                            <tr
                                                key={`${item.id}-details`}
                                                className="history-expanded-row"
                                            >
                                                <td colSpan="7">
                                                    <div className="history-details">
                                                        <div>
                                                            <h4>Old Values</h4>
                                                            <pre>
                                                                {formatJson(
                                                                    item.old_values
                                                                )}
                                                            </pre>
                                                        </div>

                                                        <div>
                                                            <h4>New Values</h4>
                                                            <pre>
                                                                {formatJson(
                                                                    item.new_values
                                                                )}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="history-empty"
                                    >
                                        No activity records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="history-pagination">
                    <span>
                        Page {page} of {totalPages}
                    </span>

                    <div>
                        <button
                            type="button"
                            disabled={!hasPrevious || isLoading}
                            onClick={() =>
                                setPage((current) => current - 1)
                            }
                        >
                            <ChevronLeft size={17} />
                            Previous
                        </button>

                        <button
                            type="button"
                            disabled={!hasNext || isLoading}
                            onClick={() => setPage((current) => current + 1)}
                        >
                            Next
                            <ChevronRight size={17} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
