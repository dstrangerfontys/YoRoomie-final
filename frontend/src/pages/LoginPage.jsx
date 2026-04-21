import { useState } from "react";
import { loginUser } from "../services/api";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const result = await loginUser(form);

        if (result.token && result.user) {
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            navigate("/dashboard");
        } else {
            setMessage(result.message || "Login failed");
        }
    }

    return (
        <div className="auth-shell">
            <div className="auth-phone">
                <div className="auth-top">
                    <div className="auth-top-shape" />
                    <div className="auth-top-content">
                        <p className="auth-kicker">Samen wonen, slim geregeld</p>
                        <h1>Welkom terug</h1>
                        <p className="auth-subtext">
                            Log in om je kosten, taken en huishoudens te bekijken.
                        </p>
                    </div>
                </div>

                <div className="auth-panel">
                    <form onSubmit={handleSubmit} className="form auth-form">
                        <label className="field-group">
                            <span>E-mail</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="jij@email.com"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </label>

                        <label className="field-group">
                            <span>Wachtwoord</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Voer je wachtwoord in"
                                value={form.password}
                                onChange={handleChange}
                            />
                        </label>

                        <button type="submit" className="primary-button">
                            Inloggen
                        </button>
                    </form>

                    {message && <p className="message-card">{message}</p>}

                    <div className="auth-footer">
                        <p>Nog geen account?</p>
                        <Link to="/register" className="text-link">
                            Registreren
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;