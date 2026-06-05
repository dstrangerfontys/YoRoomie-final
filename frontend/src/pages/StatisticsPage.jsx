import { useEffect, useMemo, useState } from "react";
import MobileShell from "../components/MobileShell";
import {
    getUserHouseholds,
    getTasksByHousehold,
    getExpensesByHousehold,
    getGroceriesByHousehold,
    getBalancesByHousehold,
    getSettlementsByHousehold,
} from "../services/api";

function StatisticsPage() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [households, setHouseholds] = useState([]);
    const [selectedHouseholdId] = useState(
        localStorage.getItem("selectedHouseholdId") || ""
    );
    const [tasks, setTasks] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [groceries, setGroceries] = useState([]);
    const [balances, setBalances] = useState([]);
    const [settlements, setSettlements] = useState([]);

    async function loadHouseholds() {
        if (!user?.id) return;
        const result = await getUserHouseholds(user.id);

        if (Array.isArray(result)) {
            setHouseholds(result);
        }
    }

    async function loadStatistics(householdId) {
        if (!householdId) return;

        const [
            taskResult,
            expenseResult,
            groceryResult,
            balanceResult,
            settlementResult,
        ] = await Promise.all([
            getTasksByHousehold(householdId),
            getExpensesByHousehold(householdId),
            getGroceriesByHousehold(householdId),
            getBalancesByHousehold(householdId),
            getSettlementsByHousehold(householdId),
        ]);

        setTasks(Array.isArray(taskResult) ? taskResult : []);
        setExpenses(Array.isArray(expenseResult) ? expenseResult : []);
        setGroceries(Array.isArray(groceryResult) ? groceryResult : []);
        setBalances(Array.isArray(balanceResult) ? balanceResult : []);

        if (Array.isArray(settlementResult)) {
            setSettlements(settlementResult);
        } else if (Array.isArray(settlementResult?.settlements)) {
            setSettlements(settlementResult.settlements);
        } else {
            setSettlements([]);
        }
    }

    useEffect(() => {
        loadHouseholds();
    }, []);

    useEffect(() => {
        if (selectedHouseholdId) {
            loadStatistics(selectedHouseholdId);
        }
    }, [selectedHouseholdId]);

    const openTasks = useMemo(
        () => tasks.filter((task) => task.status !== "done").length,
        [tasks]
    );

    const completedTasks = useMemo(
        () => tasks.filter((task) => task.status === "done").length,
        [tasks]
    );

    const totalExpenses = useMemo(
        () => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
        [expenses]
    );

    const openGroceries = useMemo(
        () => groceries.filter((item) => item.status !== "done").length,
        [groceries]
    );

    const completedGroceries = useMemo(
        () => groceries.filter((item) => item.status === "done").length,
        [groceries]
    );

    const highestBalance = useMemo(() => {
        if (balances.length === 0) return null;

        return balances.reduce((highest, current) =>
            Number(current.balance) > Number(highest.balance) ? current : highest
        );
    }, [balances]);

    return (
        <MobileShell title="Statistieken" subtitle={<img src="../src/assets/logo-wit.png" alt="Logo" width="120" className="header-logo sub" />}>
            <section className="hero-card">
                <div>
                    <p className="eyebrow">Data-overzicht</p>
                    <h2 className="center">De status van je huishouden</h2>
                    <p className="muted-text status-desc">
                        Deze pagina toont taken, kosten, boodschappen en verrekeningen.
                    </p>
                </div>

                {households.length > 0 ? (
                    <select
                        className="styled-select"
                        value={selectedHouseholdId}
                        onChange={(e) => setSelectedHouseholdId(e.target.value)}
                    >
                        {households.map((household) => (
                            <option key={household.id} value={household.id}>
                                {household.name}
                            </option>
                        ))}
                    </select>
                ) : (
                    <p className="message-card">Maak eerst een huishouden aan via instellingen.</p>
                )}
            </section>

            <section className="dashboard-grid">
                <article className="info-card accent-orange">
                    <p className="card-label">Open taken</p>
                    <h3>{openTasks}</h3>
                    <span className="card-note">{completedTasks} afgerond</span>
                </article>

                <article className="info-card accent-cream">
                    <p className="card-label">Totale kosten</p>
                    <h3>€ {totalExpenses.toFixed(2)}</h3>
                    <span className="card-note">{expenses.length} uitgaven</span>
                </article>

                <article className="info-card accent-soft">
                    <p className="card-label">Boodschappen</p>
                    <h3>{openGroceries}</h3>
                    <span className="card-note">{completedGroceries} afgevinkt</span>
                </article>

                <article className="info-card accent-light">
                    <p className="card-label">Verrekeningen</p>
                    <h3>{settlements.length}</h3>
                    <span className="card-note">open betaalacties</span>
                </article>
            </section>

            <section className="list-section">
                <div className="section-header">
                    <h3>Saldo per persoon</h3>
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
                                        ? `+ € ${balance.balance.toFixed(2)}`
                                        : balance.balance < 0
                                            ? `- € ${Math.abs(balance.balance).toFixed(2)}`
                                            : "€ 0,00"}
                                </span>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="list-section">
                <div className="section-header">
                    <h3>Samenvatting</h3>
                </div>

                <div className="summary-card">
                    <p>
                        Dit huishouden heeft <strong>{tasks.length}</strong> taken,{" "}
                        <strong>{expenses.length}</strong> uitgaven en{" "}
                        <strong>{groceries.length}</strong> boodschappenitems.
                    </p>

                    {highestBalance && (
                        <p>
                            De hoogste positieve balans is van{" "}
                            <strong>{highestBalance.name}</strong> met €{" "}
                            {Number(highestBalance.balance).toFixed(2)}.
                        </p>
                    )}
                </div>
            </section>
        </MobileShell>
    );
}

export default StatisticsPage;