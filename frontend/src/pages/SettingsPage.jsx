import { useEffect, useState } from "react";
import MobileShell from "../components/MobileShell";
import { useNavigate } from "react-router-dom";
import { updateAvatar } from "../services/api";
import {
    createHousehold,
    getUserHouseholds,
    joinHousehold,
} from "../services/api";

function SettingsPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [avatar, setAvatar] = useState(
        localStorage.getItem("avatarImage") || ""
    );

    const [households, setHouseholds] = useState([]);
    const [createName, setCreateName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [message, setMessage] = useState("");
    const [selectedHouseholdId, setSelectedHouseholdId] = useState(
        localStorage.getItem("selectedHouseholdId") || ""
    );

    async function loadHouseholds() {
        if (!user?.id) return;

        const result = await getUserHouseholds(user.id);
        setHouseholds(Array.isArray(result) ? result : []);
    }

    useEffect(() => {
        loadHouseholds();
    }, []);

    function handleAvatarUpload(e) {
        const file = e.target.files[0];

        if (file.size > 2 * 1024 * 1024) {
            alert("Kies een afbeelding kleiner dan 2MB.");
            return;
        }

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Kies een geldig afbeeldingsbestand.");
            return;
        }

        const reader = new FileReader();

        reader.onload = async () => {
            const result = await updateAvatar({
                userId: user.id,
                avatarImage: reader.result,
            });

            const updatedUser = {
                ...user,
                avatarImage: result.avatarImage,
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));
            localStorage.setItem("avatarImage", result.avatarImage);
            setAvatar(result.avatarImage);
        };

        reader.readAsDataURL(file);
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("avatarImage");

        navigate("/");
    }

    function removeAvatar() {
        localStorage.removeItem("avatarImage");
        setAvatar("");
    }

    async function handleCreate(e) {
        e.preventDefault();

        const result = await createHousehold({
            name: createName,
            userId: user.id,
        });

        setMessage(result.message || "");
        setCreateName("");
        loadHouseholds();
    }

    async function handleJoin(e) {
        e.preventDefault();

        const result = await joinHousehold({
            inviteCode,
            userId: user.id,
        });

        setMessage(result.message || "");
        setInviteCode("");
        loadHouseholds();
    }

    async function copyInviteCode(code) {
        await navigator.clipboard.writeText(code);
        setMessage("Invite code gekopieerd.");
    }

    return (
        <MobileShell title="Instellingen" subtitle={<img src="../src/assets/logo-wit.png" alt="Logo" width="120" className="header-logo sub" />}>
            <section className="form-card">
                <h3>Profielfoto</h3>

                <div className="profile-photo-preview">
                    {avatar ? <img src={avatar} alt="Profielfoto" /> : <span>🧑</span>}
                </div>

                <p className="muted-text">Ingelogd als {user?.name || "gebruiker"}</p>

                <label className="upload-button">
                    Foto kiezen
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        hidden
                    />
                </label>

                {avatar && (
                    <button className="secondary-button" onClick={removeAvatar}>
                        Profielfoto verwijderen
                    </button>
                )}
            </section>

            <section className="form-card">
                <h3>Nieuw huishouden aanmaken</h3>

                <form onSubmit={handleCreate} className="form">
                    <input
                        type="text"
                        placeholder="Naam voor je huishouden"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                    />

                    <button type="submit" className="primary-button">
                        Huishouden aanmaken
                    </button>
                </form>
            </section>

            <section className="form-card">
                <h3>Deelnemen aan huishouden</h3>

                <form onSubmit={handleJoin} className="form">
                    <input
                        type="text"
                        placeholder="Voer invite code in"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                    />

                    <button type="submit" className="primary-button">
                        Join huishouden
                    </button>
                </form>
            </section>

            {message && <p className="message-card">{message}</p>}

            <section className="list-section">
                <div className="section-header">
                    <h3>Mijn huishoudens</h3>
                </div>

                {households.length === 0 ? (
                    <div className="empty-card">
                        <p>Nog geen huishoudens gevonden.</p>
                    </div>
                ) : (
                    <div className="household-cards">
                        {households.map((household) => (
                            <article
                                key={household.id}
                                className={`household-item-card ${selectedHouseholdId === String(household.id)
                                        ? "selected-household"
                                        : ""
                                    }`}
                            >
                                <div>
                                    <strong>{household.name}</strong>
                                    <p>
                                        <strong>Code:</strong> {household.invite_code}
                                    </p>

                                    {selectedHouseholdId === String(household.id) && (
                                        <p className="active-household-label">Actief huishouden</p>
                                    )}
                                </div>

                                <div className="household-actions">
                                    <button
                                        className="mini-pill"
                                        onClick={() => copyInviteCode(household.invite_code)}
                                    >
                                        Kopieer
                                    </button>

                                    <button
                                        className="primary-button small"
                                        onClick={() => {
                                            localStorage.setItem("selectedHouseholdId", String(household.id));
                                            localStorage.setItem("selectedHouseholdName", household.name);

                                            setSelectedHouseholdId(String(household.id));
                                            setMessage(`${household.name} is geselecteerd`);
                                        }}
                                    >
                                        Selecteer
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
            <section className="form-card">
                <h3>Support</h3>
                <p>Loop je ergens tegenaan? Maak een ticket aan voor hulp.</p>

                <a
                    href="https://forms.office.com/Pages/ResponsePage.aspx?id=ZWdrxpS3K0qE7YRbNBwIakqjoEBmVWNDnEEJO5_3MeRUNUVRTU4xQ0ZWWTk2Q0U5VU9SOUhSUUJUSS4u"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="logout-button"
                    style={{ display: "inline-block", textAlign: "center", textDecoration: "none", color: "#754226", background: "#75422617" }}
                >
                    Ticket aanmaken
                </a>
            </section>
            <section className="form-card">
                <h3>Account</h3>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Uitloggen
                </button>
            </section>
        </MobileShell>
    );
}

export default SettingsPage;