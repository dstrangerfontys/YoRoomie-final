import { useState } from "react";
import { registerUser } from "../services/api";
import { Link, useNavigate } from "react-router-dom";

function RegisterPage() {
    const [form, setForm] = useState({
        name: "",
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

        const result = await registerUser(form);

        if (result.token && result.user) {
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            navigate("/dashboard");
        } else {
            setMessage(result.message || "Registration failed");
        }
    }

    return (
        <div className="auth-shell">
            <div className="auth-phone">
                <div className="auth-top">
                    <div className="auth-top-shape" />
                    <div className="auth-top-content">
                        <p className="auth-kicker">Start met jouw huishouden</p>
                        <h1>Maak een account</h1>
                        <p className="auth-subtext">
                            Registreer en beheer samen kosten, taken en boodschappen.
                        </p>
                    </div>
                </div>

                <div className="auth-panel">
                    <form onSubmit={handleSubmit} className="form auth-form">
                        <label className="field-group">
                            <span>Naam</span>
                            <input
                                type="text"
                                name="name"
                                placeholder="Jouw naam"
                                value={form.name}
                                onChange={handleChange}
                            />
                        </label>

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
                                placeholder="Kies een wachtwoord"
                                value={form.password}
                                onChange={handleChange}
                            />
                        </label>

                        <button type="submit" className="primary-button">
                            Account maken
                        </button>
                    </form>

                    {message && <p className="message-card">{message}</p>}

                    <div className="auth-footer">
                        <p>Heb je al een account?</p>
                        <Link to="/" className="text-link">
                            Inloggen
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;