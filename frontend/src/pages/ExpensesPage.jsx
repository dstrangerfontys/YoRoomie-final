import { useEffect, useState } from "react";
import MobileShell from "../components/MobileShell";
import { createExpense, getExpensesByHousehold, getUserHouseholds } from "../services/api";

function ExpensesPage() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [households, setHouseholds] = useState([]);
    const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
    const [expenses, setExpenses] = useState([]);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
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

    async function loadExpenses(householdId) {
        if (!householdId) return;
        const result = await getExpensesByHousehold(householdId);
        setExpenses(Array.isArray(result) ? result : []);
    }

    useEffect(() => {
        loadHouseholds();
    }, []);

    useEffect(() => {
        if (selectedHouseholdId) {
            loadExpenses(selectedHouseholdId);
        }
    }, [selectedHouseholdId]);

    async function handleCreateExpense(e) {
        e.preventDefault();

        const result = await createExpense({
            householdId: Number(selectedHouseholdId),
            title,
            amount: Number(amount),
            paidByUserId: user.id,
        });

        setMessage(result.message || "");
        setTitle("");
        setAmount("");
        loadExpenses(selectedHouseholdId);
    }

    return (
        <MobileShell title="Kosten" subtitle="Gezamenlijke uitgaven">
            <section className="stack-section">
                <article className="form-card">
                    <h3>Nieuwe uitgave</h3>

                    <form onSubmit={handleCreateExpense} className="form">
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
                            placeholder="Titel van de uitgave"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <input
                            type="number"
                            step="0.01"
                            placeholder="Bedrag"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />

                        <button type="submit" className="primary-button">
                            Uitgave toevoegen
                        </button>
                    </form>
                </article>

                {message && <p className="message-card">{message}</p>}

                <section className="list-section">
                    <div className="section-header">
                        <h3>Recente kosten</h3>
                    </div>

                    {expenses.length === 0 ? (
                        <div className="empty-card">
                            <p>Nog geen kosten gevonden.</p>
                        </div>
                    ) : (
                        <div className="household-cards">
                            {expenses.map((expense) => (
                                <article key={expense.id} className="expense-item-card">
                                    <div>
                                        <strong>{expense.title}</strong>
                                        <p>Betaald door {expense.paid_by_name}</p>
                                    </div>

                                    <div className="expense-right">
                                        <span className="expense-amount">
                                            € {Number(expense.amount).toFixed(2)}
                                        </span>
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

export default ExpensesPage;