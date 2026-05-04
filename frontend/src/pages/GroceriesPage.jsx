import { useEffect, useState } from "react";
import MobileShell from "../components/MobileShell";
import {
    createGrocery,
    getGroceriesByHousehold,
    completeGrocery,
    getUserHouseholds,
} from "../services/api";

function GroceriesPage() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [households, setHouseholds] = useState([]);
    const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
    const [groceries, setGroceries] = useState([]);
    const [title, setTitle] = useState("");
    const [quantity, setQuantity] = useState("");
    const [message, setMessage] = useState("");

    async function loadHouseholds() {
        if (!user?.id) return;

        const result = await getUserHouseholds(user.id);

        if (Array.isArray(result)) {
            setHouseholds(result);

            if (result.length > 0 && !selectedHouseholdId) {
                setSelectedHouseholdId(String(result[0].id));
            }
        }
    }

    async function loadGroceries(householdId) {
        if (!householdId) return;

        const result = await getGroceriesByHousehold(householdId);
        setGroceries(Array.isArray(result) ? result : []);
    }

    useEffect(() => {
        loadHouseholds();
    }, []);

    useEffect(() => {
        if (selectedHouseholdId) {
            loadGroceries(selectedHouseholdId);
        }
    }, [selectedHouseholdId]);

    async function handleCreateGrocery(e) {
        e.preventDefault();

        const result = await createGrocery({
            householdId: Number(selectedHouseholdId),
            title,
            quantity,
            addedByUserId: user.id,
        });

        setMessage(result.message || "");
        setTitle("");
        setQuantity("");
        loadGroceries(selectedHouseholdId);
    }

    async function handleComplete(itemId) {
        const result = await completeGrocery(itemId);
        setMessage(result.message || "");
        loadGroceries(selectedHouseholdId);
    }

    return (
        <MobileShell title="Boodschappen" subtitle="Gezamenlijke lijst">
            <section className="stack-section">
                <article className="form-card">
                    <h3>Nieuw item</h3>

                    <form onSubmit={handleCreateGrocery} className="form">
                        <select
                            className="styled-select"
                            value={selectedHouseholdId}
                            onChange={(e) => setSelectedHouseholdId(e.target.value)}
                        >
                            <option value="">Kies een huishouden</option>
                            {households.map((household) => (
                                <option key={household.id} value={household.id}>
                                    {household.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Product"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Hoeveelheid"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />

                        <button type="submit" className="primary-button">
                            Toevoegen
                        </button>
                    </form>
                </article>

                {message && <p className="message-card">{message}</p>}

                <section className="list-section">
                    <div className="section-header">
                        <h3>Boodschappenlijst</h3>
                    </div>

                    {groceries.length === 0 ? (
                        <div className="empty-card">
                            <p>Nog geen items gevonden.</p>
                        </div>
                    ) : (
                        <div className="household-cards">
                            {groceries.map((item) => (
                                <article key={item.id} className="grocery-card real-grocery-card">
                                    <div>
                                        <strong>{item.title}</strong>
                                        <p>
                                            {item.quantity || "Geen hoeveelheid"} • toegevoegd door{" "}
                                            {item.added_by_name || "onbekend"}
                                        </p>
                                    </div>

                                    <div className="task-actions">
                                        <span className={`status-pill ${item.status === "done" ? "done" : ""}`}>
                                            {item.status}
                                        </span>

                                        {item.status !== "done" && (
                                            <button
                                                className="mini-pill"
                                                onClick={() => handleComplete(item.id)}
                                            >
                                                Afvinken
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </MobileShell>
    );
}

export default GroceriesPage;