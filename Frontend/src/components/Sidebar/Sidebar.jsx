
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

import {
    LayoutDashboard,
    FolderKanban,
    BriefcaseBusiness,
    Users,
    Settings,
    ShieldCheck,
    ChevronDown
} from "lucide-react";

const Sidebar = () => {
    const location = useLocation();
    const masterPaths = ["/roles", "/clients", "/designations"];
    const masterActive = masterPaths.includes(location.pathname);
    const [masterState, setMasterState] = useState({
        pathname: location.pathname,
        open: masterActive,
    });
    const masterOpen = masterState.pathname === location.pathname
        ? masterState.open
        : masterActive;

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="">PMS  <span> <h3>Project Management System</h3></span></div>
                
            </div>

            <nav className="sidebar-nav">
                <p className="menu-title">MAIN MENU</p>
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/projects"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <FolderKanban size={20} />
                    <span>Projects</span>
                </NavLink>

                <NavLink
                    to="/users"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <Users size={20} />
                    <span>Users</span>
                </NavLink>

                <div className="master-menu">
                    <button
                        type="button"
                        className={`sidebar-link master-button ${masterActive ? "active" : ""
                            }`}
                        onClick={() => setMasterState({
                            pathname: location.pathname,
                            open: !masterOpen,
                        })}
                        aria-expanded={masterOpen}
                        aria-controls="master-submenu"
                    >
                        <div className="master-left">
                            <ShieldCheck size={20} />
                            <span>Master</span>
                        </div>
                        <ChevronDown
                            size={18}
                            className={`master-arrow ${masterOpen ? "master-arrow-open" : ""
                                }`}
                        />
                    </button>

                    {masterOpen && (
                        <div className="master-submenu" id="master-submenu">
                            <NavLink
                                to="/roles"
                                className={({ isActive }) =>
                                    `master-submenu-link ${isActive ? "active" : ""
                                    }`
                                }
                            >
                                <ShieldCheck size={18} />
                                <span>Roles</span>
                            </NavLink>

                            <NavLink
                                to="/clients"
                                className={({ isActive }) =>
                                    `master-submenu-link ${isActive ? "active" : ""
                                    }`
                                }
                            >
                                <Users size={18} />
                                <span>Clients</span>
                            </NavLink>

                            <NavLink
                                to="/designations"
                                className={({ isActive }) =>
                                    `master-submenu-link ${isActive ? "active" : ""
                                    }`
                                }
                            >
                                <BriefcaseBusiness size={18} />
                                <span>Designations</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
