
import React, { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("login/", {
                username: username,
                password: password,
            });

            const accessToken = response.data.access;
            const refreshToken = response.data.refresh;

            if (!accessToken) {
                throw new Error(
                    "Access token was not returned by the server."
                );
            }

            // Save JWT tokens
            localStorage.setItem("token", accessToken);

            if (refreshToken) {
                localStorage.setItem("refresh_token", refreshToken);
            }

            console.log("Login successful");
            console.log(
                "Token saved:",
                Boolean(localStorage.getItem("access_token"))
            );

            // Change "/dashboard" if your app uses a different route.
            navigate("/dashboard");

        } catch (err) {
            console.error(
                "Login failed:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.non_field_errors?.[0] ||
                err.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1>PMS</h1>
                    <h2>Login</h2>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="login-field">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
