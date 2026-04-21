import { useNavigate } from "react-router-dom";
import MobileShell from "../components/MobileShell";

function DashboardPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    }

    return (
        <MobileShell title="YoRoomie" subtitle={`Welkom, ${user?.name || "gast"}`}>
            <section className="hero-card">
                <div>
                    <p className="eyebrow">Deze maand</p>
                    <h2>Jouw huishouden in één overzicht</h2>
                    <p className="muted-text">
                        Bekijk open taken, gezamenlijke kosten en je huishoudens.
                    </p>
                </div>
                <button className="primary-button" onClick={() => navigate("/households")}>
                    Open huishoudens
                </button>
            </section>

            <section className="dashboard-grid">
                <article className="info-card accent-orange">
                    <p className="card-label">Open kosten</p>
                    <h3>€ 42,50</h3>
                    <span className="card-note">2 betalingen open</span>
                </article>

                <article className="info-card accent-cream">
                    <p className="card-label">Taken vandaag</p>
                    <h3>3</h3>
                    <span className="card-note">1 bijna te laat</span>
                </article>
            </section>

            <section className="list-section">
                <div className="section-header">
                    <h3>Snelle acties</h3>
                </div>

                <div className="action-list">
                    <button className="action-card" onClick={() => navigate("/households")}>
                        <div>
                            <strong>Huishouden beheren</strong>
                            <p>Maak of join een huishouden</p>
                        </div>
                        <span>→</span>
                    </button>

                    <button className="action-card" onClick={() => navigate("/tasks")}>
                        <div>
                            <strong>Taken bekijken</strong>
                            <p>Bekijk planning en taken</p>
                        </div>
                        <span>→</span>
                    </button>

                    <button className="action-card" onClick={() => navigate("/groceries")}>
                        <div>
                            <strong>Boodschappenlijst</strong>
                            <p>Zie wat nog gehaald moet worden</p>
                        </div>
                        <span>→</span>
                    </button>
                </div>
            </section>

            <button className="secondary-button" onClick={handleLogout}>
                Uitloggen
            </button>
        </MobileShell>
    );
}

export default DashboardPage;