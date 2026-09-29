import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListTodo, ShieldCheck } from "lucide-react";
import React from "react";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">P</div>
        <div>
          <h2>Project Hub</h2>
          <span>Management</span>
        </div>
      </div>
      <nav className="sidebar-menu" aria-label="Main navigation">
        <p className="menu-title">WORKSPACE</p>
        <ul className="sidebar-nav-list">
          <li>
            <NavLink className={({ isActive }) => `menu-item${isActive ? " active" : ""}`} to="/dashboard">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink className={({ isActive }) => `menu-item${isActive ? " active" : ""}`} to="/roles">
              <ShieldCheck size={18} />
              <span>Roles</span>
            </NavLink>
          </li>
          <li>
            <NavLink className={({ isActive }) => `menu-item${isActive ? " active" : ""}`} to="/tasks">
              <ListTodo size={18} />
              <span>Tasks</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
export default Sidebar;
