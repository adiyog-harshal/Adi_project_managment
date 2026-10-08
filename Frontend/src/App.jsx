import React from "react";

import { useState, useEffect } from "react";
import {
    UserCircle,
    ChevronDown,
    User,
    Settings,
    LogOut
} from "lucide-react";

import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import AppRoutes from "./routes/AppRoutes";

import api from "./services/api";

import "./App.css";

function App() {

    return (
        <BrowserRouter>

            <RoutesLayout />

        </BrowserRouter>
    );
}

function RoutesLayout() {

    const location = useLocation();
    const navigate = useNavigate();

    const [showUserMenu, setShowUserMenu] = useState(false);

    const [user, setUser] = useState(null);
    
    const isLoginPage = location.pathname === "/login";

    // GET CURRENT LOGGED-IN USER
    useEffect(() => {

        if (isLoginPage) {
            return;
        }

        const fetchUser = async () => {

            try {

                const response = await api.get("profile/");

                console.log("CURRENT USER:", response.data);

                setUser(response.data);
            } catch (error) {

                console.error("Unable to fetch current user:", error);
                console.log("PROFILE ERROR RESPONSE:", error.response?.data);
                console.log("PROFILE STATUS:", error.response?.status);
            }
        };

        fetchUser();
    }, [isLoginPage]);

    // LOGOUT
    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");

        setUser(null);

        setShowUserMenu(false);

        navigate("/login");
    };

    // PROFILE
    const handleProfile = () => {

        setShowUserMenu(false);

        navigate("/profile");
    };

    if (isLoginPage) {
        return <AppRoutes />;
    }


    return (
        <>
            <Sidebar />

            <main className="main-content">

                {/* TOP HEADER */}

                <div className="top-header">

                    {/* LEFT SIDE */}
                    <div className="top-header-left">
                        <span className="top-header-page-title">
                            {location.pathname === "/projects"
                                ? "Projects"
                                : location.pathname === "/roles"
                                ? "Roles"
                                : location.pathname === "/designations"
                                ? "Designations"
                                : location.pathname === "/users"
                                ? "Users"
                                : location.pathname === "/milestones"
                                ? "Milestones"
                                : location.pathname === "/tasks"
                                ? "Tasks"
                                : location.pathname === "/"
                                ? "Dashboard"
                                : ""}
                        </span>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="top-header-right">

                        {/* USER MENU */}
                        <div className="user-menu">

                            <button
                                type="button"
                                className="user-menu-button"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="user-avatar">
                                    {user?.first_name || user?.last_name
                                        ? `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase()
                                        : user?.username
                                            ? user.username.substring(0, 2).toUpperCase()
                                            : "U"
                                    }
                                </div>

                                <span className="user-name">
                                    {user?.first_name || user?.last_name
                                        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                                        : user?.username || "User"}
                                </span>

                                <ChevronDown
                                    size={16}
                                    className={
                                        showUserMenu
                                            ? "user-chevron rotate"
                                            : "user-chevron"
                                    }
                                />
                            </button>

                            {showUserMenu && (
                                <div className="user-dropdown">

                                    <div className="dropdown-title">
                                        My Account
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleProfile}
                                    >
                                        <User size={20} />
                                        <span>Profile</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            navigate("/settings");
                                        }}
                                    >
                                        <Settings size={20} />
                                        <span>Settings</span>
                                    </button>

                                    <div className="dropdown-divider"></div>

                                    <button
                                        type="button"
                                        className="logout-button"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={20} />
                                        <span>Logout</span>
                                    </button>

                                </div>
                            )}

                        </div>

                    </div>

                </div>
                {/* PAGE */}

                <AppRoutes />
            </main>
        </>
    );
}

export default App;