import { useEffect, useState } from "react";
import MobileShell from "../components/MobileShell";
import {
    createTask,
    getTasksByHousehold,
    completeTask,
    getUserHouseholds,
} from "../services/api";

function TasksPage() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [households, setHouseholds] = useState([]);
    const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
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

    async function loadTasks(householdId) {
        if (!householdId) return;
        const result = await getTasksByHousehold(householdId);
        setTasks(Array.isArray(result) ? result : []);
    }

    useEffect(() => {
        loadHouseholds();
    }, []);

    useEffect(() => {
        if (selectedHouseholdId) {
            loadTasks(selectedHouseholdId);
        }
    }, [selectedHouseholdId]);

    async function handleCreateTask(e) {
        e.preventDefault();

        const result = await createTask({
            householdId: Number(selectedHouseholdId),
            title,
            description,
            assignedToUserId: user.id,
            dueDate,
        });

        setMessage(result.message || "");
        setTitle("");
        setDescription("");
        setDueDate("");
        loadTasks(selectedHouseholdId);
    }

    async function handleComplete(taskId) {
        const result = await completeTask(taskId);
        setMessage(result.message || "");
        loadTasks(selectedHouseholdId);
    }

    return (
        <MobileShell title="Taken" subtitle="Planning en verdeling">
            <section className="stack-section">
                <article className="form-card">
                    <h3>Nieuwe taak</h3>

                    <form onSubmit={handleCreateTask} className="form">
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
                            placeholder="Titel van de taak"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Beschrijving"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />

                        <button type="submit" className="primary-button">
                            Taak toevoegen
                        </button>
                    </form>
                </article>

                {message && <p className="message-card">{message}</p>}

                <section className="list-section">
                    <div className="section-header">
                        <h3>Mijn taken</h3>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="empty-card">
                            <p>Nog geen taken gevonden.</p>
                        </div>
                    ) : (
                        <div className="household-cards">
                            {tasks.map((task) => (
                                <article key={task.id} className="task-card real-task-card">
                                    <div>
                                        <strong>{task.title}</strong>
                                        <p>
                                            {task.description || "Geen beschrijving"} •{" "}
                                            {task.assigned_to_name || "Niet toegewezen"}
                                        </p>
                                        {task.due_date && <p>Deadline: {task.due_date.slice(0, 10)}</p>}
                                    </div>

                                    <div className="task-actions">
                                        <span className={`status-pill ${task.status === "done" ? "done" : ""}`}>
                                            {task.status}
                                        </span>

                                        {task.status !== "done" && (
                                            <button
                                                className="mini-pill"
                                                onClick={() => handleComplete(task.id)}
                                            >
                                                Afronden
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

export default TasksPage;