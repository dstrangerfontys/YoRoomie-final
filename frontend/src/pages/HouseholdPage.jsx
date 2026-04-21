import { useEffect, useState } from "react";
import { createHousehold, getUserHouseholds, joinHousehold } from "../services/api";
import MobileShell from "../components/MobileShell";

function HouseholdPage() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [households, setHouseholds] = useState([]);
    const [createName, setCreateName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [message, setMessage] = useState("");

    async function loadHouseholds() {
        if (!user?.id) return;
        const result = await getUserHouseholds(user.id);
        setHouseholds(Array.isArray(result) ? result : []);
    }

    useEffect(() => {
        loadHouseholds();
    }, []);

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

    return (
        <MobileShell title="Huishoudens" subtitle="Beheer je groepen">
            <section className="stack-section">
                <article className="form-card">
                    <h3>Nieuw huishouden</h3>
                    <form onSubmit={handleCreate} className="form">
                        <input
                            type="text"
                            placeholder="Naam huishouden"
                            value={createName}
                            onChange={(e) => setCreateName(e.target.value)}
                        />
                        <button type="submit" className="primary-button">
                            Aanmaken
                        </button>
                    </form>
                </article>

                <article className="form-card">
                    <h3>Join met code</h3>
                    <form onSubmit={handleJoin} className="form">
                        <input
                            type="text"
                            placeholder="Invite code"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                        />
                        <button type="submit" className="primary-button">
                            Joinen
                        </button>
                    </form>
                </article>

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
                                <article key={household.id} className="household-item-card">
                                    <div>
                                        <strong>{household.name}</strong>
                                        <p>Code: {household.invite_code}</p>
                                    </div>
                                    <button className="mini-pill">Open</button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </MobileShell>
    );
}

export default HouseholdPage;