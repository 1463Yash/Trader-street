import { useState } from "react";
import "./CSS/Watchlist.css";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Watchlist({ onSelectSymbol, onLoginRequired }) {
    const [open, setOpen] = useState(false);
    const { user, watchlist, removeFromWatchlist } = useAuth();

    const handleBtnClick = () => {
        if (!user) { onLoginRequired?.(); return; }
        setOpen(o => !o);
    };

    return (
        <div
            className="watchlist-container"
            onMouseEnter={() => user && setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <div className="watchlist-btn" onClick={handleBtnClick}>
                Watchlist <ChevronDown />
            </div>

            {open && (
                <div className="dropdown watchlist-dropdown">
                    {!user ? (
                        <p className="watchlist-empty">Login to use watchlist</p>
                    ) : watchlist.length === 0 ? (
                        <p className="watchlist-empty">No stocks added yet</p>
                    ) : (
                        watchlist.map(sym => (
                            <div key={sym} className="watchlist-item">
                                <span
                                    className="watchlist-sym"
                                    onClick={() => { onSelectSymbol?.(sym); setOpen(false); }}
                                >
                                    {sym}
                                </span>
                                <button
                                    className="watchlist-remove"
                                    onClick={() => removeFromWatchlist(sym)}
                                    title="Remove"
                                >✕</button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
