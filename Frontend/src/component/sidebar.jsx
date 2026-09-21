import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    ShieldCheck,
    CalendarDays,
    BarChart3,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
    const menuItems = [
        {
            name: "Dashboard",
            path: "/",
            icon: LayoutDashboard,
        },
        {
            name: "Projects",
            path: "/projects",
            icon: FolderKanban,
        },
        {
            name: "Tasks",
            path: "/tasks",
            icon: CheckSquare,
        },
        {
            name: "Employees",
            path: "/employees",
            icon: Users,
        },
        {
            name: "Roles",
            path: "/roles",
            icon: ShieldCheck,
        },
        {
            name: "Calendar",
            path: "/calendar",
            icon: CalendarDays,
        },
        {
            name: "Reports",
            path: "/reports",
            icon: BarChart3,
        },
    ];

    return (
        <aside className="sidebar">

            <div className="brand">
                <div className="brand-name">
                    PMS<span>+</span>
                </div>

                <div className="brand-subtitle">
                    Project Management System
                </div>
            </div>

            <nav className="sidebar-menu">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "active" : ""}`
                            }
                        >
                            <Icon size={19} />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

        </aside>
    );
}

export default Sidebar;