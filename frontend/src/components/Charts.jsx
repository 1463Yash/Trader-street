import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Chart } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LinearScale,
    TimeScale,
    Tooltip,
    Title,
    Legend,
    LineElement,
    PointElement,
    Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";
import "./CSS/ChartGrid.css";
import { useAuth } from "../context/AuthContext";
import StockDataTable from "./StockDataTable";

ChartJS.register(
    LinearScale, TimeScale, Tooltip, Title,
    Legend, LineElement, PointElement, Filler, zoomPlugin
);

const DEFAULT_SYMBOLS = ["ADANIPOWER.NS", "DMART.NS", "RELIANCE.NS", "TCS.NS", "BHARTIARTL.NS"];

export default function MultiSymbolCharts({ searchedSymbol }) {
    const [symbols, setSymbols]     = useState(DEFAULT_SYMBOLS);
    const [chartData, setChartData] = useState({});
    const [loading, setLoading]     = useState(false);
    const [tableView, setTableView] = useState(null); // { sym, data }
    const chartRefs                 = useRef({});
    const { user, watchlist, addToWatchlist } = useAuth();

    useEffect(() => {
        if (!searchedSymbol) return;
        setSymbols(prev =>
            prev.includes(searchedSymbol) ? prev : [searchedSymbol, ...prev]
        );
    }, [searchedSymbol]);

    useEffect(() => {
        if (symbols.length === 0) return;
        setLoading(true);
        axios.get("http://localhost:3000/stock?symbol=" + symbols.join(","))
            .then(res => {
                const dataObj = {};
                symbols.forEach(sym => {
                    dataObj[sym] = (res.data[sym] || []).map(r => ({
                        x: new Date(r.date),
                        y: r.close,
                    }));
                });
                setChartData(dataObj);
            })
            .catch(err => console.error("Chart fetch error:", err))
            .finally(() => setLoading(false));
    }, [symbols]);

    const removeSymbol = (sym) => {
        setSymbols(prev => prev.filter(s => s !== sym));
        setChartData(prev => { const n = { ...prev }; delete n[sym]; return n; });
    };

    return (
        <div className="charts-wrapper">
            {/* Full-screen table view */}
            {tableView && (
                <StockDataTable
                    sym={tableView.sym}
                    data={tableView.data}
                    onClose={() => setTableView(null)}
                />
            )}

            {loading && <p className="charts-loading">Loading charts...</p>}

            {symbols.map(sym => {
                const data  = chartData[sym] || [];
                const last  = data[data.length - 1];
                const first = data[0];
                const stats = {
                    lastClose: last?.y,
                    change:    last && first ? last.y - first.y : 0,
                    changePct: last && first ? ((last.y - first.y) / first.y) * 100 : 0,
                    high:      data.length ? Math.max(...data.map(d => d.y)) : 0,
                    low:       data.length ? Math.min(...data.map(d => d.y)) : 0,
                };
                const isUp = stats.change >= 0;
                const color = isUp ? "#16a34a" : "#dc2626";
                const lineColor = isUp ? "#4ade80" : "#f87171";

                return (
                    <div key={sym} className="chart-card">
                        <button
                            className="chart-card__remove"
                            onClick={() => removeSymbol(sym)}
                            title="Remove"
                        >✕</button>

                        <div className="chart-card__header">
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.5px" }}>{sym}</h2>
                            {data.length > 0 ? (
                                <>
                                    <div className="chart-card__price" style={{ color: lineColor, fontSize: "2rem", fontWeight: 800 }}>
                                        ₹{stats.lastClose?.toFixed(2)}
                                    </div>
                                    <p className="chart-card__change" style={{ color: lineColor }}>
                                        {isUp ? "▲" : "▼"} {Math.abs(stats.change).toFixed(2)} ({Math.abs(stats.changePct).toFixed(2)}%)
                                    </p>
                                </>
                            ) : (
                                <p className="chart-card__empty">
                                    {loading ? "Loading..." : "No data found for this symbol"}
                                </p>
                            )}
                        </div>

                        {data.length > 0 && (
                            <>
                                <Chart
                                    ref={el => { if (el) chartRefs.current[sym] = el; }}
                                    type="line"
                                    data={{
                                        datasets: [{
                                            label: `${sym} Closing Price`,
                                            data,
                                            borderColor: lineColor,
                                            borderWidth: 2.5,
                                            backgroundColor: (ctx) => {
                                                const chart = ctx.chart;
                                                const { ctx: c, chartArea } = chart;
                                                if (!chartArea) return "transparent";
                                                const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                                                if (isUp) {
                                                    gradient.addColorStop(0,   "rgba(74,222,128,0.5)");
                                                    gradient.addColorStop(0.5, "rgba(74,222,128,0.15)");
                                                    gradient.addColorStop(1,   "rgba(74,222,128,0)");
                                                } else {
                                                    gradient.addColorStop(0,   "rgba(248,113,113,0.5)");
                                                    gradient.addColorStop(0.5, "rgba(248,113,113,0.15)");
                                                    gradient.addColorStop(1,   "rgba(248,113,113,0)");
                                                }
                                                return gradient;
                                            },
                                            fill: "origin",
                                            tension: 0.3,
                                            pointRadius: 0,
                                            pointHoverRadius: 5,
                                            pointHoverBackgroundColor: lineColor,
                                            order: 0,
                                        }],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: true,
                                        interaction: { mode: "nearest", intersect: false },
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                callbacks: {
                                                    title: ctx => new Date(ctx[0].parsed.x).toLocaleDateString(),
                                                    label: ctx => `Close: ₹${ctx.parsed.y.toFixed(2)}`,
                                                    afterLabel: ctx => {
                                                        const f = ctx.dataset.data[0]?.y;
                                                        const c = ctx.parsed.y;
                                                        return `Change vs start: ₹${(c - f).toFixed(2)} (${(((c - f) / f) * 100).toFixed(2)}%)`;
                                                    },
                                                },
                                            },
                                            zoom: {
                                                pan:  { enabled: true, mode: "x" },
                                                zoom: {
                                                    wheel: { enabled: true, speed: 0.1 },
                                                    pinch: { enabled: true },
                                                    mode:  "x",
                                                },
                                            },
                                        },
                                        scales: {
                                            x: {
                                                type: "time",
                                                time: { unit: "month" },
                                                grid: { color: "rgba(148,163,184,0.1)", drawBorder: false },
                                                ticks: { color: "#94a3b8", font: { size: 11 } },
                                                border: { display: false },
                                            },
                                            y: {
                                                title: { display: false },
                                                grid: { color: "rgba(148,163,184,0.1)", drawBorder: false },
                                                ticks: { color: "#94a3b8", font: { size: 11 } },
                                                border: { display: false },
                                            },
                                        },
                                    }}
                                />
                                <div className="chart-card__footer">
                                    <span style={{ color: "#10b981", fontWeight: 600 }}>
                                        ↑ High: ₹{stats.high?.toFixed(2)}
                                    </span>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button
                                            className="chart-card__reset"
                                            onClick={() => chartRefs.current[sym]?.resetZoom()}
                                        >Reset Zoom</button>
                                        <button
                                            className="chart-card__reset"
                                            onClick={() => setTableView({ sym, data })}
                                        >📊 View Data</button>
                                        {user ? (
                                            watchlist.includes(sym) ? (
                                                <button className="chart-card__watchlist chart-card__watchlist--added" disabled>
                                                    ★ Watchlisted
                                                </button>
                                            ) : (
                                                <button
                                                    className="chart-card__watchlist"
                                                    onClick={() => addToWatchlist(sym)}
                                                >
                                                    ☆ Watchlist
                                                </button>
                                            )
                                        ) : (
                                            <button className="chart-card__watchlist chart-card__watchlist--locked" title="Login to add to watchlist">
                                                🔒 Watchlist
                                            </button>
                                        )}
                                    </div>
                                    <span style={{ color: "#f43f5e", fontWeight: 600 }}>
                                        ↓ Low: ₹{stats.low?.toFixed(2)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
