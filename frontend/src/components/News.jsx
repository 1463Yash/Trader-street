import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./CSS/News.css";

export default function News({ externalQuery }) {
    const [news, setNews]       = useState([]);
    const [open, setOpen]       = useState(false);
    const [query, setQuery]     = useState("nifty sensex stock market india");
    const [input, setInput]     = useState("");
    const [loading, setLoading] = useState(true);
    const wrapRef               = useRef(null);

    const fetchNews = (q) => {
        setLoading(true);
        axios.get(`http://localhost:3000/news?q=${encodeURIComponent(q)}`)
            .then(r => setNews(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchNews(query); }, [query]);

    useEffect(() => {
        if (!externalQuery) return;
        setQuery(externalQuery);
        setOpen(true);
        setTimeout(() => wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, [externalQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (input.trim()) { setQuery(input.trim()); setInput(""); }
    };

    const fmt = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
            });
        } catch { return dateStr; }
    };

    return (
        <div className="news-wrap" ref={wrapRef}>

            {/* Scrolling ticker */}
            <div className="news-ticker" onClick={() => setOpen(o => !o)}>
                <span className="news-ticker__label">📰 LIVE NEWS</span>
                <div className="news-ticker__track">
                    <div className="news-ticker__inner">
                        {loading
                            ? <span className="news-ticker__item">Loading market news...</span>
                            : news.map((n, i) => (
                                <span key={i} className="news-ticker__item">
                                    {n.title}
                                    <span className="news-ticker__sep">◆</span>
                                </span>
                            ))
                        }
                    </div>
                </div>
                <span className="news-ticker__toggle">{open ? "▲" : "▼"}</span>
            </div>

            {/* Expanded panel */}
            {open && (
                <div className="news-panel">
                    <div className="news-panel__top">
                        <span className="news-panel__query">
                            📰 Showing news for: <strong>{query}</strong>
                        </span>
                        <form className="news-search" onSubmit={handleSearch}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Search news (e.g. Reliance, Nifty 50...)"
                            />
                            <button type="submit">Search</button>
                        </form>
                    </div>

                    <div className="news-grid">
                        {loading
                            ? Array(6).fill(0).map((_, i) => <div key={i} className="news-skeleton" />)
                            : news.map((n, i) => (
                                <a
                                    key={i}
                                    href={n.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="news-card"
                                >
                                    <div className="news-card__source">{n.source || "Google News"}</div>
                                    <div className="news-card__title">{n.title}</div>
                                    <div className="news-card__date">{fmt(n.pubDate)}</div>
                                </a>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
}
