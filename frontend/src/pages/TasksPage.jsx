import MobileShell from "../components/MobileShell";

function TasksPage() {
    return (
        <MobileShell title="Taken" subtitle="Planning en verdeling">
            <section className="list-section">
                <article className="task-card">
                    <div>
                        <strong>Badkamer schoonmaken</strong>
                        <p>Morgen • Toegewezen aan Dylan</p>
                    </div>
                    <span className="status-pill">Open</span>
                </article>

                <article className="task-card">
                    <div>
                        <strong>Vuilnis buiten zetten</strong>
                        <p>Vandaag • Toegewezen aan Naomi</p>
                    </div>
                    <span className="status-pill done">Done</span>
                </article>
            </section>
        </MobileShell>
    );
}

export default TasksPage;