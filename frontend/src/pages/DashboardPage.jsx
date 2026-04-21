import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileShell from "../components/MobileShell";
import {
    getUserHouseholds,
    getTasksByHousehold,
    getExpensesByHousehold,
} from "../services/api";

function DashboardPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [households, setHouseholds] = useState([]);
    const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
    const [tasks, setTasks] = useState([]);
    const [expenses, setExpenses] = useState([]);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    }

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

    async function loadDashboardData(householdId) {
        if (!householdId) return;

        const [taskResult, expenseResult] = await Promise.all([
            getTasksByHousehold(householdId),
            getExpensesByHousehold(householdId),
        ]);

        setTasks(Array.isArray(taskResult) ? taskResult : []);
        setExpenses(Array.isArray(expenseResult) ? expenseResult : []);
    }

    useEffect(() => {
        loadHouseholds();
    }, []);

    useEffect(() => {
        if (selectedHouseholdId) {
            loadDashboardData(selectedHouseholdId);
        }
    }, [selectedHouseholdId]);

    const openTasksCount = useMemo(
        () => tasks.filter((task) => task.status !== "done").length,
        [tasks]
    );

    const totalExpenses = useMemo(
        () =>
            expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
        [expenses]
    );

    const recentTasks = tasks.slice(0, 3);
    const recentExpenses = expenses.slice(0, 3);

    return (
        <MobileShell title="YoRoomie" subtitle={`Welkom, ${user?.name || "gast"}`}>
            <section className="hero-card">
                <div>
                    <p className="eyebrow">Overzicht</p>
                    <h2>Jouw huishouden in één overzicht</h2>
                    <p className="muted-text">
                        Bekijk open taken, kosten en je huishoudens op één plek.
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
                    <button
                        className="primary-button"
                        onClick={() => navigate("/households")}
                    >
                        Maak eerst een huishouden
                    </button>
                )}
            </section>

            <section className="dashboard-grid">
                <article className="info-card accent-orange">
                    <p className="card-label">Huishoudens</p>
                    <h3>{households.length}</h3>
                    <span className="card-note">Actieve groepen</span>
                </article>

                <article className="info-card accent-cream">
                    <p className="card-label">Open taken</p>
                    <h3>{openTasksCount}</h3>
                    <span className="card-note">Nog af te ronden</span>
                </article>

                <article className="info-card accent-soft">
                    <p className="card-label">Totale kosten</p>
                    <h3>€ {totalExpenses.toFixed(2)}</h3>
                    <span className="card-note">Van geselecteerd huishouden</span>
                </article>

                <article className="info-card accent-light">
                    <p className="card-label">Uitgaven</p>
                    <h3>{expenses.length}</h3>
                    <span className="card-note">Geregistreerde kosten</span>
                </article>
            </section>

            <section className="list-section">
                <div className="section-header">
                    <h3>Recente taken</h3>
                </div>

                {recentTasks.length === 0 ? (
                    <div className="empty-card">
                        <p>Nog geen taken gevonden.</p>
                    </div>
                ) : (
                    <div className="household-cards">
                        {recentTasks.map((task) => (
                            <article key={task.id} className="task-card real-task-card">
                                <div>
                                    <strong>{task.title}</strong>
                                    <p>{task.assigned_to_name || "Niet toegewezen"}</p>
                                </div>
                                <span className={`status-pill ${task.status === "done" ? "done" : ""}`}>
                                    {task.status}
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

                {recentExpenses.length === 0 ? (
                    <div className="empty-card">
                        <p>Nog geen kosten gevonden.</p>
                    </div>
                ) : (
                    <div className="household-cards">
                        {recentExpenses.map((expense) => (
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

            <div className="button-group">
                <button
                    className="primary-button"
                    onClick={() => navigate("/expenses")}
                >
                    Naar kosten
                </button>

                <button
                    className="secondary-button"
                    onClick={() => navigate("/tasks")}
                >
                    Naar taken
                </button>

                <button className="secondary-button" onClick={handleLogout}>
                    Uitloggen
                </button>
            </div>
        </MobileShell>
    );
}

export default DashboardPage;