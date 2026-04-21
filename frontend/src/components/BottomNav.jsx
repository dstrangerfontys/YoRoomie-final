import { Link, useLocation } from "react-router-dom";

function BottomNav() {
    const location = useLocation();

    const items = [
        { to: "/dashboard", label: "Home" },
        { to: "/households", label: "Huis" },
        { to: "/tasks", label: "Taken" },
        { to: "/groceries", label: "Lijst" },
    ];

    return (
        <nav className="bottom-nav">
            {items.map((item) => (
                <Link
                    key={item.to}
                    to={item.to}
                    className={`bottom-nav-item ${location.pathname === item.to ? "active" : ""
                        }`}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}

export default BottomNav;