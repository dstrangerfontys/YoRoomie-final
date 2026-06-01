import { useEffect, useState } from "react";
import MobileShell from "../components/MobileShell";
import {
    createTask,
    getTasksByHousehold,
    completeTask,
    deleteTask,
    updateTask,
    getUserHouseholds,
} from "../services/api";
import Avatar from "../components/Avatar";

function TasksPage() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [households, setHouseholds] = useState([]);
    const [selectedHouseholdId] = useState(
        localStorage.getItem("selectedHouseholdId") || ""
    );
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [message, setMessage] = useState("");
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDueDate, setEditDueDate] = useState("");

    async function loadHouseholds() {
        if (!user?.id) return;
        const result = await getUserHouseholds(user.id);

        if (Array.isArray(result)) {
            setHouseholds(result);
        }
    }

    async function loadTasks(householdId) {
        if (!householdId) return;
        const result = await getTasksByHousehold(householdId);
        setTasks(Array.isArray(result) ? result : []);
    }

    function startEditTask(task) {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditDescription(task.description || "");
        setEditDueDate(task.due_date ? task.due_date.slice(0, 10) : "");
    }

    function cancelEditTask() {
        setEditingTaskId(null);
        setEditTitle("");
        setEditDescription("");
        setEditDueDate("");
    }

    async function handleUpdateTask(taskId) {
        const result = await updateTask(taskId, {
            title: editTitle,
            description: editDescription,
            dueDate: editDueDate,
        });

        setMessage(result.message || "");
        cancelEditTask();
        loadTasks(selectedHouseholdId);
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

    async function handleDelete(taskId) {
        const result = await deleteTask(taskId);
        setMessage(result.message || "");
        loadTasks(selectedHouseholdId);
    }

    return (
        <MobileShell title="Huishoudelijke taken" subtitle={<img src="../src/assets/logo-wit.png" alt="Logo" width="120" className="header-logo sub" />}>

            <section className="stack-section">
                <article className="form-card">
                    <h3>Nieuwe taak toevoegen</h3>

                    <form onSubmit={handleCreateTask} className="form">
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
                                    <div key={task.id} className="editable-list-item">
                                        <article className="task-card real-task-card">
                                            <div>
                                                <strong>{task.title}</strong>

                                                {task.description && <p>{task.description}</p>}

                                                {task.due_date && (
                                                    <p>
                                                        Deadline: {task.due_date.slice(0, 10).split("-").reverse().join("-")}
                                                    </p>
                                                )}

                                                <div className="user-information">
                                                    <Avatar size={30} src={task.assigned_to_avatar} />
                                                    <span>{task.assigned_to_name || "Niet toegewezen"}</span>
                                                </div>
                                            </div>

                                            <div className="task-actions">
                                                <button
                                                    className="mini-pill"
                                                    onClick={() => startEditTask(task)}
                                                >
                                                    Edit
                                                </button>

                                                {task.status === "done" && (
                                                    <span className="status-pill done">Done</span>
                                                )}

                                                {task.status !== "done" && (
                                                    <button
                                                        className="mini-pill"
                                                        onClick={() => handleComplete(task.id)}
                                                    >
                                                        Afronden
                                                    </button>
                                                )}

                                                <button
                                                    className="delete-pill"
                                                    onClick={() => handleDelete(task.id)}
                                                >
                                                    Verwijder
                                                </button>
                                            </div>
                                        </article>

                                        {editingTaskId === task.id && (
                                            <div className="inline-edit-card">
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    placeholder="Titel"
                                                />

                                                <input
                                                    type="text"
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    placeholder="Beschrijving"
                                                />

                                                <input
                                                    type="date"
                                                    value={editDueDate}
                                                    onChange={(e) => setEditDueDate(e.target.value)}
                                                />

                                                <div className="edit-actions">
                                                    <button
                                                        className="primary-button small"
                                                        onClick={() => handleUpdateTask(task.id)}
                                                    >
                                                        Opslaan
                                                    </button>

                                                    <button
                                                        className="delete-pill"
                                                        onClick={cancelEditTask}
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

export default TasksPage;