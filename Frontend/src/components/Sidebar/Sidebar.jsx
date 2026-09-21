
import React from "react";
import "./Sidebar.css";

import {
    LayoutDashboard,
    FolderKanban,
    ListTodo,
    Users,
    Badge,
    Settings,
    LogOut
} from "lucide-react";

import { NavLink } from "react-router-dom";

const Sidebar = () => {

    return (

        <aside className="sidebar">

            {/* LOGO */}

            <div className="sidebar-logo">

                <div className="logo-icon">
                    PMS
                </div>

                <span>
                    Project Manager
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
                    to="/designations"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <Badge size={20} />
                    <span>Designations</span>
                </NavLink>

                <a href="#" className="sidebar-link">

                    <Settings size={20} />
                    <span>Settings</span>
                </a>
            
            </nav>
        
        
        </aside>


    );

};

export default Sidebar;
