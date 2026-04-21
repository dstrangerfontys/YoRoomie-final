import BottomNav from "./BottomNav";

function MobileShell({ title, subtitle, children }) {
    return (
        <div className="app-shell">
            <div className="phone-frame">
                <header className="app-header">
                    <div className="header-shape" />
                    <div className="header-content">
                        <p className="header-subtitle">{subtitle}</p>
                        <h1 className="header-title">{title}</h1>
                    </div>
                </header>

                <main className="app-content">{children}</main>

                <BottomNav />
            </div>
        </div>
    );
}

export default MobileShell;