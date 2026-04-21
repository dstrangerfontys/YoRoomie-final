import MobileShell from "../components/MobileShell";

function GroceriesPage() {
    return (
        <MobileShell title="Boodschappen" subtitle="Gezamenlijke lijst">
            <section className="list-section">
                <article className="grocery-card">
                    <div>
                        <strong>Melk</strong>
                        <p>2 pakken nodig</p>
                    </div>
                    <span className="mini-pill">Open</span>
                </article>

                <article className="grocery-card">
                    <div>
                        <strong>Pasta</strong>
                        <p>1 verpakking</p>
                    </div>
                    <span className="mini-pill">Open</span>
                </article>

                <article className="grocery-card">
                    <div>
                        <strong>Schoonmaakdoekjes</strong>
                        <p>Voor keuken en badkamer</p>
                    </div>
                    <span className="mini-pill">Open</span>
                </article>
            </section>
        </MobileShell>
    );
}

export default GroceriesPage;