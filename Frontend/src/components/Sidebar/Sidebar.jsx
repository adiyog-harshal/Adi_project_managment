
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
    LogOut,
    User,
    Handshake,
    History as HistoryIcon,
} from "lucide-react";

    const Sidebar = ({
    user,
    avatarText,
    showUserMenu,
    setShowUserMenu,
    handleLogout,
    handleProfile
}) => {
    const [masterOpen, setMasterOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setShowUserMenu]);

    const displayName = user?.username || "My Account";
    const masterActive =
        location.pathname === "/roles" ||
        location.pathname === "/designations" ||
        location.pathname === "/clients";

    return (

        <aside className="sidebar">
            {/* LOGO */}
            <div className="sidebar-logo">
                            {/* LOGO */}
            <div className="sidebar-logo">
                <div className="logo-icon">PMS</div>
                <span>Project Management System</span>
            </div>
            </div>


            {/* NAVIGATION */}

            {/* NAVIGATION */}
            <nav className="sidebar-nav">
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


                <NavLink
                    to="/milestones"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <ClipboardList size={20} />
                    <span>Milestones</span>
                </NavLink>
                <NavLink
                    to="/history"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <HistoryIcon size={20} />
                    <span>History</span>
                </NavLink>


                {/* MASTER MENU */}

                <div className="master-menu">

                    <button
                        type="button"
                        className={`sidebar-link master-button ${
                            masterActive ? "active" : ""
                        }`}
                        onClick={() => setMasterOpen(!masterOpen)}
                    >

                        <div className="master-left">
                            <ShieldCheck size={20} />
                            <span>Master</span>
                        </div>

                        <ChevronRight
                            size={18}
                            className={`master-arrow ${
                                masterOpen ? "master-arrow-open" : ""
                            }`}
                        />
                    </button>

                    {masterOpen && (

                        <div className="master-submenu">

                            <NavLink
                                to="/roles"
                                className={({ isActive }) =>
                                    `master-submenu-link ${
                                        isActive ? "active" : ""
                                    }`
                                }
                            >
                                <ShieldCheck size={18} />
                                <span>Roles</span>
                            </NavLink>

                            <NavLink
                                to="/designations"
                                className={({ isActive }) =>
                                    `master-submenu-link ${
                                        isActive ? "active" : ""
                                    }`
                                }
                            >
                                <BriefcaseBusiness size={18} />
                                <span>Designations</span>
                            </NavLink>

                            <NavLink
                                to="/clients"
                                className={({ isActive }) =>
                                    `master-submenu-link ${
                                        isActive ? "active" : ""
                                    }`
                                }
                            >
                                <Handshake size={18} />
                                <span>Clients</span>
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

                    {/* BOTTOM USER PROFILE */}
                    <div className="sidebar-profile-section" ref={profileRef}>

                        {showUserMenu && (
                            <div className="sidebar-profile-dropdown">

                                <div className="sidebar-dropdown-title">
                                    My Account
                                </div>

                                <button type="button" onClick={handleProfile}>
                                    <User size={18} />
                                    <span>Profile</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        navigate("/settings");
                                    }}
                                >
                                    <Settings size={18} />
                                    <span>Settings</span>
                                </button>

                                <div className="sidebar-dropdown-divider" />

                                <button
                                    type="button"
                                    className="sidebar-logout-button"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>

                            </div>
                        )}

                        <button
                            type="button"
                            className="sidebar-profile-button"
                            onClick={() => setShowUserMenu(current => !current)}
                            aria-expanded={showUserMenu}
                        >
                            <div className="sidebar-profile-avatar">
                                {avatarText || "U"}
                            </div>

                            <span className="sidebar-profile-name">
                                {displayName}
                            </span>
                        </button>

                    </div>

                    </aside>
    );
};

export default Sidebar;
