import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [health, setHealth] = useState("Loading...");

    useEffect(() => {
        fetch("http://localhost:3001/api/health")
            .then((res) => res.json())
            .then((data) => setHealth(`${data.message} | DB: ${data.database}`))
            .catch(() => setHealth("Could not connect to backend"));
    }, []);

    return (
        <div className="app">
            <div className="card">
                <h1>YoRoomie</h1>
                <p>Starter setup is actief.</p>
                <p>{health}</p>
            </div>
        </div>
    );
}

export default App;