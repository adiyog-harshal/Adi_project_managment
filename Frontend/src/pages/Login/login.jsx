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

        if (!username.trim() || !password.trim()) {
            setError("Username and password are required.");
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await api.post("login/", {
                username,
                password
            });
                
            

            console.log("LOGIN RESPONSE:", response.data);

            // SAVE JWT TOKENS
            localStorage.setItem("token", response.data.access);

            localStorage.setItem("refresh_token", response.data.refresh);

            console.log(
                "SAVED TOKEN:",
                localStorage.getItem("token")
            );


            // Go to dashboard
            navigate("/");

        } catch (error) {

            console.error(error);

            if (error.response?.status === 401) {
                setError("Invalid username or password.");
            } else {
                setError("Unable to connect the server. ");
            }
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

                    <p>
                        Sign in to your account
                    </p>
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