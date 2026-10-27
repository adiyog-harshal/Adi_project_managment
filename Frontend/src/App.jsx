import React, { useState, useEffect } from "react";
import {
    User,
    Settings,
    LogOut
} from "lucide-react";

import {
    BrowserRouter,
    useLocation,
    useNavigate
} from "react-router-dom";

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

    // Fetch the logged-in user's profile.
    useEffect(() => {
        if (isLoginPage) {
            setUser(null);
            return;
        }

        const token = localStorage.getItem("access_token");

        if (!token) {
            setUser(null);
            return;
        }

        const controller = new AbortController();

        const fetchProfile = async () => {
            try {
                const response = await api.get("profile/", {
                    signal: controller.signal
                });

                setUser(response.data);
            } catch (error) {
                // Ignore requests cancelled during navigation/unmount.
                if (
                    error.code === "ERR_CANCELED" ||
                    controller.signal.aborted
                ) {
                    return;
                }

                console.error(
                    "Unable to fetch profile:",
                    error.response?.data || error.message
                );

                // Only redirect when authentication is rejected.
                if (error.response?.status === 401) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    setUser(null);
                    navigate("/login", { replace: true });
                }
            }
        };

        fetchProfile();

        return () => {
            controller.abort();
        };
    }, [isLoginPage, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setUser(null);
        setShowUserMenu(false);

        navigate("/login", { replace: true });
    };

    const handleProfile = () => {
        setShowUserMenu(false);
        navigate("/profile");
    };

    if (isLoginPage) {
        return <AppRoutes />;
    }

    const pageTitles = {
        "/": "Dashboard",
        "/dashboard": "Dashboard",
        "/projects": "Projects",
        "/users": "Users",
        "/roles": "Roles",
        "/designations": "Designations",
        "/milestones": "Milestones",
        "/tasks": "Tasks",
        "/profile": "Profile",
        "/settings": "Settings"
    };

    const pageTitle =
        pageTitles[location.pathname] || "Project Management";

    const avatarText =
        user?.first_name || user?.last_name
            ? `${user.first_name?.charAt(0) || ""}${
                user.last_name?.charAt(0) || ""
              }`.toUpperCase()
            : user?.username
                ? user.username.substring(0, 2).toUpperCase()
                : "U";

    return (
        <>
            <Sidebar />

            <main className="main-content">
                <header className="top-header">
                    <div className="top-header-left">
                        <span className="top-header-page-title">
                            {pageTitle}
                        </span>
                    </div>

                    <div className="top-header-right">
                        <div className="user-menu">
                            <button
                                type="button"
                                className="user-menu-button"
                                aria-label="Open user menu"
                                aria-expanded={showUserMenu}
                                onClick={() =>
                                    setShowUserMenu((current) => !current)
                                }
                            >
                                <div className="user-avatar">
                                    {avatarText}
                                </div>
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

                                    <div className="dropdown-divider" />

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
                </header>

                <AppRoutes />
            </main>
        </>
    );
}

export default App;
