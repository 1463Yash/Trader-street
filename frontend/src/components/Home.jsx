import "./CSS/Home.css";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import Loginbut from "./Authform/Login";
import Watchlist from "./Watchlist";
import Asidevlogs from "./Asidevlogs";
import Chart from "./Charts";
import MLPredictionSection from "./ML_Model/MLPredictionSection";
import News from "./News";
import Footer from "./Footer";
import { Menu, X, BrainCircuit, ArrowLeft, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DrawerMenu from "./DrawerMenu";

export default function Home() {
  const { user, openLogin }       = useAuth();
  const [searchedSymbol, setSearchedSymbol] = useState(null);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [view, setView]           = useState(user ? "ml" : "charts");
  const [dark, setDark]           = useState(() => localStorage.getItem("ts_theme") !== "light");
  const [newsQuery, setNewsQuery] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("ts_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    setView(user ? "ml" : "charts");
    setSearchedSymbol(null);
  }, [user]);

  const handleSearch = (sym) => { setSearchedSymbol(sym); setMenuOpen(false); setView("charts"); };
  const handleWatchlistSelect = (sym) => { setSearchedSymbol(sym); setMenuOpen(false); setView("charts"); };
  const handleMLClick = () => { if (!user) { openLogin(); return; } setView("ml"); setSearchedSymbol(null); };
  const handleWatchlistClick = () => { if (!user) openLogin(); };
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="nav">
        {/* LEFT: hamburger (mobile) */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)}>
          <Menu size={24} />
        </button>

        {/* CENTER-LEFT: logo */}
        <div className="logo" onClick={() => window.location.reload()}>Trader's street</div>

        {/* RIGHT: desktop nav items */}
        <div className="nav-items">
          <Watchlist onSelectSymbol={handleWatchlistSelect} onLoginRequired={handleWatchlistClick} />
          <button className={`nav-btn ${user && view === "ml" ? "nav-btn--active" : ""}`} onClick={handleMLClick}>
            <BrainCircuit size={15} /> ML Predictions
          </button>
          {user && view === "charts" && (
            <button className="nav-btn nav-btn--back" onClick={() => { setView("ml"); setSearchedSymbol(null); }}>
              <ArrowLeft size={15} /> Back to ML
            </button>
          )}
          <SearchBar onSearch={handleSearch} />
          <Asidevlogs />
          <button className="dark-toggle" onClick={() => setDark(d => !d)} title={dark ? "Light mode" : "Dark mode"}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Loginbut />
        </div>

        {/* Mobile overlay */}
        <div className={`nav-overlay ${menuOpen ? "nav-overlay--open" : ""}`} onClick={closeMenu} />

        {/* Mobile right-side drawer */}
        <div className={`nav-drawer ${menuOpen ? "nav-drawer--open" : ""}`}>
          <button className="nav-drawer__close" onClick={closeMenu}><X size={22} /></button>

          {/* Profile at top */}
          {user && (
            <div className="nav-drawer__profile">
              <div className="auth-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <div className="nav-drawer__profile-name">{user.name}</div>
                <div className="nav-drawer__profile-email">{user.email}</div>
              </div>
            </div>
          )}

          <DrawerMenu
            onSelectSymbol={(s) => { handleWatchlistSelect(s); closeMenu(); }}
            onClose={closeMenu}
          />

          <Asidevlogs />

          {/* Logout before toggle */}
          <Loginbut />

          {/* Dark/Light toggle — centered at bottom */}
          <div className="nav-drawer__theme">
            <span className="nav-drawer__theme-label">
              {dark ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </span>
            <button className="theme-pill" onClick={() => setDark(d => !d)}>
              <span className={`theme-pill__option ${!dark ? "theme-pill__option--active" : ""}`}>
                <Sun size={14} /> Light
              </span>
              <span className={`theme-pill__option ${dark ? "theme-pill__option--active" : ""}`}>
                <Moon size={14} /> Dark
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile search — full width below nav */}
      <div className="mobile-search">
        <SearchBar onSearch={handleSearch} />
      </div>

      {user && view === "ml"   && <MLPredictionSection />}
      {view === "charts"       && <><News externalQuery={newsQuery} /><Chart searchedSymbol={searchedSymbol} /></>}

      <Footer onNewsSearch={(q) => { setNewsQuery(q); setView("charts"); }} />
    </>
  );
}
