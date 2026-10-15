
import React, { useEffect, useState } from "react";
import {
    UserRound,
    Bell,
    Palette,
    ShieldCheck,
    Settings as SettingsIcon,
    Save,
    LockKeyhole
} from "lucide-react";
import "./Settings.css";

const tabs = [
    { id: "account", label: "Account", icon: UserRound },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: LockKeyhole },
    { id: "admin", label: "Admin Settings", icon: SettingsIcon, adminOnly: true }
];

const defaultPreferences = {
    language: "English",
    dateFormat: "DD/MM/YYYY",
    emailNotifications: true,
    taskAssignments: true,
    taskDeadlines: true,
    projectUpdates: true,
    milestoneUpdates: true,
    sprintUpdates: true,
    theme: "light",
    compactSidebar: false
};

function Settings() {
    const [activeTab, setActiveTab] = useState("account");
    const [preferences, setPreferences] = useState(defaultPreferences);
    const [savedMessage, setSavedMessage] = useState("");
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Read the user's role from the saved profile if available.
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadSettings() {
            try {
                const { default: api } = await import("../../services/api");
                const response = await api.get("profile/");
                const profile = response.data || {};

                if (!mounted) return;

                const role = String(
                    profile.role_name ||
                    profile.role ||
                    profile.user_role ||
                    ""
                ).toLowerCase();

                setIsAdmin(role === "admin");

                const stored = localStorage.getItem("pmsSettings");
                if (stored) {
                    setPreferences({
                        ...defaultPreferences,
                        ...JSON.parse(stored)
                    });
                }
            } catch (error) {
                console.error("Unable to load Settings profile:", error);
            }
        }

        loadSettings();

        return () => {
            mounted = false;
        };
    }, []);

    const updatePreference = (name, value) => {
        setPreferences(previous => ({
            ...previous,
            [name]: value
        }));
        setSavedMessage("");
    };

    const savePreferences = () => {
        try {
            localStorage.setItem("pmsSettings", JSON.stringify(preferences));
            setSavedMessage("Preferences saved in this browser.");
        } catch {
            setSavedMessage("Unable to save preferences.");
        }
    };

    const updatePassword = event => {
        event.preventDefault();

        if (!passwords.currentPassword || !passwords.newPassword) {
            setSavedMessage("Enter your current and new passwords.");
            return;
        }

        if (passwords.newPassword.length < 8) {
            setSavedMessage("The new password must contain at least 8 characters.");
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setSavedMessage("The new passwords do not match.");
            return;
        }

        setSavedMessage(
            "Password changing is not connected to the backend yet."
        );
    };

    const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

    useEffect(() => {
        if (!visibleTabs.some(tab => tab.id === activeTab)) {
            setActiveTab("account");
        }
    }, [isAdmin, activeTab]);

    const Toggle = ({ label, description, checked, onChange }) => (
        <label className="settings-toggle-row">
            <span className="settings-toggle-copy">
                <strong>{label}</strong>
                {description && <small>{description}</small>}
            </span>
            <input
                type="checkbox"
                checked={checked}
                onChange={event => onChange(event.target.checked)}
            />
        </label>
    );

    return (
        <main className="settings-page">
            <header className="settings-header">
                <div>
                    <p className="settings-eyebrow">PREFERENCES</p>
                    <h1>Settings</h1>
                    <p>Manage your account and personalize your workspace.</p>
                </div>
            </header>

            <div className="settings-layout">
                <aside className="settings-tabs" aria-label="Settings categories">
                    {visibleTabs.map(tab => {
                        const Icon = tab.icon;

                        return (
                            <button
                                type="button"
                                key={tab.id}
                                className={`settings-tab ${
                                    activeTab === tab.id ? "active" : ""
                                }`}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSavedMessage("");
                                }}
                            >
                                <Icon size={19} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </aside>

                <section className="settings-panel">
                    {activeTab === "account" && (
                        <>
                            <div className="settings-section-heading">
                                <h2>Account preferences</h2>
                                <p>Choose your regional and display preferences.</p>
                            </div>

                            <div className="settings-field">
                                <label htmlFor="settings-language">Language</label>
                                <select
                                    id="settings-language"
                                    value={preferences.language}
                                    onChange={event =>
                                        updatePreference("language", event.target.value)
                                    }
                                >
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Marathi</option>
                                </select>
                            </div>

                            <div className="settings-field">
                                <label htmlFor="settings-date-format">Date format</label>
                                <select
                                    id="settings-date-format"
                                    value={preferences.dateFormat}
                                    onChange={event =>
                                        updatePreference("dateFormat", event.target.value)
                                    }
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                        </>
                    )}

                    {activeTab === "notifications" && (
                        <>
                            <div className="settings-section-heading">
                                <h2>Notification preferences</h2>
                                <p>Choose which updates you want to enable.</p>
                            </div>

                            <Toggle
                                label="Email notifications"
                                description="Master preference for email alerts."
                                checked={preferences.emailNotifications}
                                onChange={value => updatePreference("emailNotifications", value)}
                            />
                            <Toggle
                                label="Task assignments"
                                description="When a task is assigned to you."
                                checked={preferences.taskAssignments}
                                onChange={value => updatePreference("taskAssignments", value)}
                            />
                            <Toggle
                                label="Task deadlines"
                                description="Reminders for upcoming task deadlines."
                                checked={preferences.taskDeadlines}
                                onChange={value => updatePreference("taskDeadlines", value)}
                            />
                            <Toggle
                                label="Project updates"
                                checked={preferences.projectUpdates}
                                onChange={value => updatePreference("projectUpdates", value)}
                            />
                            <Toggle
                                label="Milestone updates"
                                checked={preferences.milestoneUpdates}
                                onChange={value => updatePreference("milestoneUpdates", value)}
                            />
                            <Toggle
                                label="Sprint updates"
                                checked={preferences.sprintUpdates}
                                onChange={value => updatePreference("sprintUpdates", value)}
                            />
                        </>
                    )}

                    {activeTab === "appearance" && (
                        <>
                            <div className="settings-section-heading">
                                <h2>Appearance</h2>
                                <p>Customize the way your workspace is displayed.</p>
                            </div>

                            <div className="settings-field">
                                <label htmlFor="settings-theme">Theme</label>
                                <select
                                    id="settings-theme"
                                    value={preferences.theme}
                                    onChange={event =>
                                        updatePreference("theme", event.target.value)
                                    }
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark (preference only)</option>
                                </select>
                                <small>
                                    The theme choice is stored as a preference. Full dark-mode
                                    styling must be implemented separately.
                                </small>
                            </div>

                            <Toggle
                                label="Compact sidebar"
                                description="Save this preference for a future sidebar layout."
                                checked={preferences.compactSidebar}
                                onChange={value => updatePreference("compactSidebar", value)}
                            />
                        </>
                    )}

                    {activeTab === "security" && (
                        <>
                            <div className="settings-section-heading">
                                <h2>Security</h2>
                                <p>Update your account password.</p>
                            </div>

                            <form onSubmit={updatePassword}>
                                <div className="settings-field">
                                    <label htmlFor="current-password">Current password</label>
                                    <input
                                        id="current-password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={passwords.currentPassword}
                                        onChange={event =>
                                            setPasswords(previous => ({
                                                ...previous,
                                                currentPassword: event.target.value
                                            }))
                                        }
                                    />
                                </div>

                                <div className="settings-field">
                                    <label htmlFor="new-password">New password</label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={passwords.newPassword}
                                        onChange={event =>
                                            setPasswords(previous => ({
                                                ...previous,
                                                newPassword: event.target.value
                                            }))
                                        }
                                    />
                                </div>

                                <div className="settings-field">
                                    <label htmlFor="confirm-password">Confirm new password</label>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={passwords.confirmPassword}
                                        onChange={event =>
                                            setPasswords(previous => ({
                                                ...previous,
                                                confirmPassword: event.target.value
                                            }))
                                        }
                                    />
                                </div>

                                <p className="settings-note">
                                    Password changes are not active until a backend endpoint
                                    is implemented and connected.
                                </p>

                                <button className="settings-save-button" type="submit">
                                    <LockKeyhole size={17} />
                                    Validate password fields
                                </button>
                            </form>
                        </>
                    )}

                    {activeTab === "admin" && isAdmin && (
                        <>
                            <div className="settings-section-heading">
                                <h2>Admin settings</h2>
                                <p>Organization-wide configuration options.</p>
                            </div>

                            <div className="settings-admin-notice">
                                <ShieldCheck size={22} />
                                <div>
                                    <strong>Administrative configuration</strong>
                                    <p>
                                        Default project statuses, task priorities, sprint
                                        duration, and organization preferences can be configured
                                        here after the backend permissions and settings API
                                        are implemented.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab !== "security" && (
                        <div className="settings-panel-footer">
                            {savedMessage && (
                                <p className="settings-message" role="status">
                                    {savedMessage}
                                </p>
                            )}
                            <button
                                type="button"
                                className="settings-save-button"
                                onClick={savePreferences}
                            >
                                <Save size={17} />
                                Save preferences
                            </button>
                        </div>
                    )}

                    {activeTab === "security" && savedMessage && (
                        <p className="settings-message" role="status">
                            {savedMessage}
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}

export default Settings;
