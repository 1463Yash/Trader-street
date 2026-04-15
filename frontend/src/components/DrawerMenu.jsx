import { useState } from "react";
import { ChevronDown, TrendingUp, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PredictionChart from "./ML_Model/PredictionChart";
import "./CSS/DrawerMenu.css";

const ML_MODELS = [
    { key: "nifty50",   label: "Nifty 50"     },
    { key: "niftybank", label: "Nifty Bank"    },
    { key: "niftyit",   label: "Nifty IT"      },
    { key: "niftyauto", label: "Nifty Auto"    },
    { key: "niftynext", label: "Nifty Next 50" },
];

export default function DrawerMenu({ onSelectSymbol, onClose }) {
    const { user, watchlist, removeFromWatchlist, openLogin } = useAuth();

    // open by default only if logged in
    const [watchlistOpen, setWatchlistOpen] = useState(!!user);
    const [mlOpen, setMlOpen]               = useState(!!user);
    const [activePred, setActivePred]       = useState(null);

    const handleWatchlistToggle = () => {
        if (!user) { openLogin(); onClose(); return; }
        setWatchlistOpen(o => !o);
    };

    const handleMLToggle = () => {
        // toggle accordion — but items inside will guard login
        setMlOpen(o => !o);
    };

    const handleSymbolClick = (sym) => {
        onSelectSymbol?.(sym);
        onClose();
    };

    const handleModelClick = (model) => {
        if (!user) { openLogin(); onClose(); return; }
        setActivePred(model);
    };

    return (
        <>
            {/* Watchlist accordion */}
            <div className="dm-section">
                <button className="dm-header" onClick={handleWatchlistToggle}>
                    <span>Watchlist</span>
                    {!user
                        ? <Lock size={14} className="dm-lock" />
                        : <ChevronDown size={16} className={`dm-chevron ${watchlistOpen ? "dm-chevron--open" : ""}`} />
                    }
                </button>
                {user && watchlistOpen && (
                    <div className="dm-body">
                        {watchlist.length === 0 ? (
                            <p className="dm-empty">No stocks in watchlist yet</p>
                        ) : (
                            watchlist.map(sym => (
                                <div key={sym} className="dm-item">
                                    <span className="dm-item__sym" onClick={() => handleSymbolClick(sym)}>
                                        <TrendingUp size={13} /> {sym}
                                    </span>
                                    <button className="dm-item__remove" onClick={() => removeFromWatchlist(sym)}>✕</button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* ML Predictions accordion */}
            <div className="dm-section">
                <button className="dm-header" onClick={handleMLToggle}>
                    <span>ML Predictions</span>
                    <ChevronDown size={16} className={`dm-chevron ${mlOpen ? "dm-chevron--open" : ""}`} />
                </button>
                {mlOpen && (
                    <div className="dm-body">
                        {ML_MODELS.map(m => (
                            <button
                                key={m.key}
                                className={`dm-model-btn ${!user ? "dm-model-btn--locked" : ""}`}
                                onClick={() => handleModelClick(m)}
                            >
                                {!user && <Lock size={12} />}
                                {m.label}
                            </button>
                        ))}
                        {!user && (
                            <p className="dm-login-hint" onClick={() => { openLogin(); onClose(); }}>
                                🔐 Login to view predictions
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Prediction modal */}
            {activePred && (
                <PredictionChart
                    modelKey={activePred.key}
                    title={activePred.label}
                    onClose={() => setActivePred(null)}
                />
            )}
        </>
    );
}
