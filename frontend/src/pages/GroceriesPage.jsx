import { useEffect, useState } from "react";
import MobileShell from "../components/MobileShell";
import {
    createGrocery,
    getGroceriesByHousehold,
    completeGrocery,
    deleteGrocery,
    updateGrocery,
    getUserHouseholds,
} from "../services/api";

function GroceriesPage() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [households, setHouseholds] = useState([]);
    const [selectedHouseholdId] = useState(
        localStorage.getItem("selectedHouseholdId") || ""
    );
    const [groceries, setGroceries] = useState([]);
    const [title, setTitle] = useState("");
    const [quantity, setQuantity] = useState("");
    const [message, setMessage] = useState("");
    const [editingItemId, setEditingItemId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editQuantity, setEditQuantity] = useState("");

    async function loadHouseholds() {
        if (!user?.id) return;
        const result = await getUserHouseholds(user.id);

        if (Array.isArray(result)) {
            setHouseholds(result);
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

    async function handleDelete(itemId) {
        const result = await deleteGrocery(itemId);
        setMessage(result.message || "");
        loadGroceries(selectedHouseholdId);
    }

    function startEditItem(item) {
        setEditingItemId(item.id);
        setEditTitle(item.title);
        setEditQuantity(item.quantity || "");
    }

    function cancelEditItem() {
        setEditingItemId(null);
        setEditTitle("");
        setEditQuantity("");
    }

    async function handleUpdateItem(itemId) {
        const result = await updateGrocery(itemId, {
            title: editTitle,
            quantity: editQuantity,
        });

        setMessage(result.message || "");
        cancelEditItem();
        loadGroceries(selectedHouseholdId);
    }

    return (
            <MobileShell title="Boodschappenlijst" subtitle={<img src="../src/assets/logo-wit.png" alt="Logo" width="120" className="header-logo sub" />}>

            <section className="stack-section">
                <article className="form-card">
                    <h3>Product toevoegen</h3>

                    <form onSubmit={handleCreateGrocery} className="form">
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
                            Toevoegen aan boodschappenlijst
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
                            <p>Nog geen boodschappen toegevoegd aan de lijst.</p>
                        </div>
                    ) : (
                        <div className="household-cards">
                                {groceries.map((item) => (
                                    <div key={item.id} className="editable-list-item">
                                        <article className="grocery-card real-grocery-card">
                                            <div>
                                                <strong>{item.title}</strong>
                                                <p>
                                                    {item.quantity || "Geen hoeveelheid"} toegevoegd door{" "}
                                                    {item.added_by_name || "onbekend"}
                                                </p>
                                            </div>

                                            <div className="task-actions">
                                                <button
                                                    className="mini-pill"
                                                    onClick={() => startEditItem(item)}
                                                >
                                                    Edit
                                                </button>

                                                {item.status === "done" && (
                                                    <span className="status-pill done">Done</span>
                                                )}

                                                {item.status !== "done" && (
                                                    <button
                                                        className="mini-pill"
                                                        onClick={() => handleComplete(item.id)}
                                                    >
                                                        Afvinken
                                                    </button>
                                                )}

                                                <button
                                                    className="delete-pill"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    Verwijder
                                                </button>
                                            </div>
                                        </article>

                                        {editingItemId === item.id && (
                                            <div className="inline-edit-card">
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    placeholder="Product"
                                                />

                                                <input
                                                    type="text"
                                                    value={editQuantity}
                                                    onChange={(e) => setEditQuantity(e.target.value)}
                                                    placeholder="Hoeveelheid"
                                                />

                                                <div className="edit-actions">
                                                    <button
                                                        className="primary-button small"
                                                        onClick={() => handleUpdateItem(item.id)}
                                                    >
                                                        Opslaan
                                                    </button>

                                                    <button
                                                        className="delete-pill"
                                                        onClick={cancelEditItem}
                                                    >
                                                        Annuleren
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </section>
            </section>
        </MobileShell>
    );
}

export default GroceriesPage;