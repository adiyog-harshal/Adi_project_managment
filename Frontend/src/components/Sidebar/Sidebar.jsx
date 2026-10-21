
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
    ChevronRight,
    ClipboardList,
    LogOut
} from "lucide-react";




const Sidebar = () => {
    const [masterOpen, setMasterOpen] = useState(false);

    const location = useLocation();

    const masterActive =
        location.pathname === "/roles" ||
        location.pathname === "/designations" ||
        location.pathname === "/clients";



    return (

        <aside className="sidebar">

            {/* LOGO */}

            <div className="sidebar-logo">

                <div className="logo-icon">
                    PMS
                </div>

                <span>
                    Project Management
                </span>

            </div>

            {/* NAVIGATION */}

            <nav className="sidebar-nav">

                <p className="menu-title">
                    MAIN MENU
                </p>

                <NavLink
                    to="/"
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

                {/* MASTER MENU */}

                <div className="master-menu">

                    <button
                        type="button"
                        className={`sidebar-link master-button ${masterActive ? "active" : ""
                            }`}
                        onClick={() => setMasterOpen(!masterOpen)}
                    >

                        <div className="master-left">
                            <ShieldCheck size={20} />
                            <span>Master</span>
                        </div>

                        <ChevronRight
                            size={18}
                            className={`master-arrow ${masterOpen ? "master-arrow-open" : ""
                                }`}
                        />

                    </button>


                    {masterOpen && (

                        <div className="master-submenu">

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

                <a href="#" className="sidebar-link">

                    <Settings size={20} />
                    <span>Settings</span>
                </a>

            </nav>


        </aside>


    );

};

export default Sidebar;
