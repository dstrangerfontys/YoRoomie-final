import { useEffect, useState } from "react";

function App() {
    const [data, setData] = useState("");

    useEffect(() => {
        fetch("http://localhost:3000/api/health")
            .then(res => res.json())
            .then(data => setData(data.message))
            .catch(() => setData("Backend niet bereikbaar"));
    }, []);

    return (
        <div>
            <h1>YoRoomie</h1>
            <p>{data}</p>
        </div>
    );
}

export default App;