import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import "./CSS/StockDataTable.css";

export default function StockDataTable({ sym, data, onClose }) {
    const [sortDir, setSortDir] = useState("desc"); // newest first

    const rows = useMemo(() => {
        const sorted = [...data].sort((a, b) =>
            sortDir === "desc"
                ? new Date(b.x) - new Date(a.x)
                : new Date(a.x) - new Date(b.x)
        );
        // compute daily change
        const original = [...data].sort((a, b) => new Date(a.x) - new Date(b.x));
        const priceMap = {};
        original.forEach((d, i) => {
            priceMap[d.x.toISOString()] = {
                close: d.y,
                prev:  i > 0 ? original[i - 1].y : null,
            };
        });
        return sorted.map(d => {
            const info   = priceMap[d.x.toISOString()];
            const change = info?.prev != null ? d.y - info.prev : null;
            const pct    = info?.prev != null ? ((d.y - info.prev) / info.prev) * 100 : null;
            return { date: d.x, close: d.y, change, pct };
        });
    }, [data, sortDir]);

    const last  = data[data.length - 1]?.y ?? 0;
    const first = data[0]?.y ?? 0;
    const totalChange = last - first;
    const totalPct    = first ? (totalChange / first) * 100 : 0;
    const isUp        = totalChange >= 0;
    const high        = Math.max(...data.map(d => d.y));
    const low         = Math.min(...data.map(d => d.y));

    return (
        <div className="sdt-overlay">
            {/* Header */}
            <div className="sdt-header">
                <button className="sdt-back" onClick={onClose}>
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="sdt-title">
                    <span className="sdt-sym">{sym}</span>
                    <span className="sdt-price" style={{ color: isUp ? "#4ade80" : "#f87171" }}>
                        ₹{last.toFixed(2)}
                    </span>
                    <span className="sdt-change" style={{ color: isUp ? "#4ade80" : "#f87171" }}>
                        {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {isUp ? "+" : ""}{totalChange.toFixed(2)} ({totalPct.toFixed(2)}%)
                    </span>
                </div>

                <div className="sdt-stats">
                    <div className="sdt-stat">
                        <span className="sdt-stat-label">52W High</span>
                        <span className="sdt-stat-val" style={{ color: "#10b981" }}>₹{high.toFixed(2)}</span>
                    </div>
                    <div className="sdt-stat">
                        <span className="sdt-stat-label">52W Low</span>
                        <span className="sdt-stat-val" style={{ color: "#f43f5e" }}>₹{low.toFixed(2)}</span>
                    </div>
                    <div className="sdt-stat">
                        <span className="sdt-stat-label">Data Points</span>
                        <span className="sdt-stat-val">{data.length}</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="sdt-body">
                <table className="sdt-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th
                                className="sdt-sortable"
                                onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                            >
                                Date <ArrowUpDown size={13} />
                                <span className="sdt-sort-hint">{sortDir === "desc" ? "Newest" : "Oldest"}</span>
                            </th>
                            <th>Close Price</th>
                            <th>Daily Change</th>
                            <th>Change %</th>
                            <th>Signal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => {
                            const up = r.change > 0;
                            const dn = r.change < 0;
                            return (
                                <tr key={i} className={up ? "sdt-row--up" : dn ? "sdt-row--dn" : ""}>
                                    <td className="sdt-td-num">{i + 1}</td>
                                    <td className="sdt-td-date">
                                        {r.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </td>
                                    <td className="sdt-td-price">₹{r.close.toFixed(2)}</td>
                                    <td style={{ color: up ? "#4ade80" : dn ? "#f87171" : "var(--text-muted)", fontWeight: 600 }}>
                                        {r.change != null ? `${up ? "+" : ""}${r.change.toFixed(2)}` : "—"}
                                    </td>
                                    <td style={{ color: up ? "#4ade80" : dn ? "#f87171" : "var(--text-muted)", fontWeight: 600 }}>
                                        {r.pct != null ? `${up ? "+" : ""}${r.pct.toFixed(2)}%` : "—"}
                                    </td>
                                    <td>
                                        {up ? <span className="sdt-badge sdt-badge--up">▲ Up</span>
                                            : dn ? <span className="sdt-badge sdt-badge--dn">▼ Down</span>
                                            : <span className="sdt-badge">— Flat</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
