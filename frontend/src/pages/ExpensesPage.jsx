import { useEffect, useState } from "react";
import MobileShell from "../components/MobileShell";
import {
    createExpense,
    getExpensesByHousehold,
    getUserHouseholds,
    getBalancesByHousehold,
    getExpenseParticipants,
    settleParticipant,
    getSettlementsByHousehold,
} from "../services/api";

function ExpensesPage() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [households, setHouseholds] = useState([]);
    const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
    const [expenses, setExpenses] = useState([]);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [balances, setBalances] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [settlements, setSettlements] = useState([]);

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

        const [expenseResult, balanceResult, settlementResult] = await Promise.all([
            getExpensesByHousehold(householdId),
            getBalancesByHousehold(householdId),
            getSettlementsByHousehold(householdId),
        ]);

        setExpenses(Array.isArray(expenseResult) ? expenseResult : []);
        setBalances(Array.isArray(balanceResult) ? balanceResult : []);

        if (Array.isArray(settlementResult)) {
            setSettlements(settlementResult);
        } else if (Array.isArray(settlementResult?.settlements)) {
            setSettlements(settlementResult.settlements);
        } else {
            setSettlements([]);
        }
    }

    async function openExpenseDetails(expense) {
        setSelectedExpense(expense);

        const result = await getExpenseParticipants(expense.id);
        setParticipants(Array.isArray(result) ? result : []);
    }

    async function handleSettle(participantId) {
        const result = await settleParticipant(participantId);
        setMessage(result.message || "");

        if (selectedExpense) {
            await openExpenseDetails(selectedExpense);
        }

        if (selectedHouseholdId) {
            await loadExpenses(selectedHouseholdId);
        }
    }

    useEffect(() => {
        loadHouseholds();
    }, []);

    useEffect(() => {
        if (selectedHouseholdId) {
            loadExpenses(selectedHouseholdId);
            setSelectedExpense(null);
            setParticipants([]);
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
        await loadExpenses(selectedHouseholdId);
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
                        <h3>Saldo-overzicht</h3>
                    </div>

                    {balances.length === 0 ? (
                        <div className="empty-card">
                            <p>Nog geen saldo beschikbaar.</p>
                        </div>
                    ) : (
                        <div className="household-cards">
                            {balances.map((balance) => (
                                <article key={balance.userId} className="balance-card">
                                    <div>
                                        <strong>{balance.name}</strong>
                                        <p>
                                            Betaald: € {balance.paidTotal.toFixed(2)} • Aandeel: €{" "}
                                            {balance.owesTotal.toFixed(2)}
                                        </p>
                                    </div>

                                    <span
                                        className={`balance-pill ${balance.balance > 0
                                                ? "positive"
                                                : balance.balance < 0
                                                    ? "negative"
                                                    : "neutral"
                                            }`}
                                    >
                                        {balance.balance > 0
                                            ? `Krijgt € ${balance.balance.toFixed(2)}`
                                            : balance.balance < 0
                                                ? `Moet € ${Math.abs(balance.balance).toFixed(2)}`
                                                : "Gelijk"}
                                    </span>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* ===== WIE BETAALT WIE ===== */}
                <section className="list-section">
                    <div className="section-header">
                        <h3>Wie betaalt wie?</h3>
                    </div>

                    {settlements.length === 0 ? (
                        <div className="empty-card">
                            <p>Er zijn geen verrekeningen nodig.</p>
                        </div>
                    ) : (
                        <div className="household-cards">
                            {settlements.map((settlement, index) => (
                                <article key={index} className="settlement-card">
                                    <div>
                                        <strong>
                                            {settlement.fromName} betaalt {settlement.toName}
                                        </strong>
                                        <p>Verrekening op basis van gedeelde kosten</p>
                                    </div>

                                    <span className="settlement-amount">
                                        € {Number(settlement.amount).toFixed(2)}
                                    </span>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

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
                                <article
                                    key={expense.id}
                                    className="expense-item-card clickable-card"
                                    onClick={() => openExpenseDetails(expense)}
                                >
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

                {selectedExpense && (
                    <section className="list-section">
                        <div className="section-header">
                            <h3>Verdeling van {selectedExpense.title}</h3>
                        </div>

                        <div className="household-cards">
                            {participants.map((participant) => (
                                <article key={participant.id} className="participant-card">
                                    <div>
                                        <strong>{participant.name}</strong>
                                        <p>
                                            Aandeel: € {Number(participant.share_amount).toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="participant-actions">
                                        <span
                                            className={`status-pill ${participant.is_settled ? "done" : ""
                                                }`}
                                        >
                                            {participant.is_settled ? "Betaald" : "Open"}
                                        </span>

                                        {!participant.is_settled && (
                                            <button
                                                className="mini-pill"
                                                onClick={() => handleSettle(participant.id)}
                                            >
                                                Betaald
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </section>
        </MobileShell>
    );
}

export default ExpensesPage;