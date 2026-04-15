import { useEffect, useState } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import { Chart } from "react-chartjs-2";
import {
    Chart as ChartJS,
    TimeScale,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import "./Nifty.css";

ChartJS.register(TimeScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

export default function PredictionChart({ modelKey, title, onClose }) {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        axios.get(`http://localhost:3000/predict/${modelKey}`)
            .then(res => setData(res.data))
            .catch(err => {
                console.error(err);
                setError("Failed to load prediction");
            })
            .finally(() => setLoading(false));
    }, [modelKey]);

    const historyPoints = data?.history.map(h => ({ x: new Date(h.date), y: h.close })) ?? [];
    const lastDate      = historyPoints[historyPoints.length - 1]?.x;
    const nextDate      = lastDate ? new Date(lastDate.getTime() + 86400000) : new Date();
    const predPoint     = { x: nextDate, y: data?.prediction };
    const lastClose     = historyPoints[historyPoints.length - 1]?.y ?? 0;
    const change        = (data?.prediction ?? 0) - lastClose;
    const changePct     = lastClose ? (change / lastClose) * 100 : 0;
    const isPositive    = change >= 0;

    const modal = (
        <div className="pred-overlay" onClick={onClose}>
            <div className="pred-modal" onClick={e => e.stopPropagation()}>
                <button className="pred-close" onClick={onClose}>✕</button>

                {loading && <div className="pred-loading">Loading {title}...</div>}
                {error   && <div className="pred-error">{error}</div>}

                {data && (
                    <div className="pred-card">
                        <div className="pred-header">
                            <h2>{title}</h2>
                            <div className="pred-price" style={{ color: isPositive ? "#16a34a" : "#dc2626" }}>
                                ₹{data.prediction.toFixed(2)}
                            </div>
                            <div className="pred-change" style={{ color: isPositive ? "#16a34a" : "#dc2626" }}>
                                {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(2)} ({Math.abs(changePct).toFixed(2)}%)
                            </div>
                            <div className="pred-label">Next Day Prediction</div>
                        </div>

                        <Chart
                            type="line"
                            data={{
                                datasets: [
                                    {
                                        label: "Historical Close",
                                        data: historyPoints,
                                        borderColor: "#3b82f6",
                                        backgroundColor: "rgba(59,130,246,0.1)",
                                        pointRadius: 0,
                                        tension: 0.2,
                                    },
                                    {
                                        label: "Predicted",
                                        data: [historyPoints[historyPoints.length - 1], predPoint],
                                        borderColor: isPositive ? "#16a34a" : "#dc2626",
                                        backgroundColor: isPositive ? "#16a34a" : "#dc2626",
                                        borderDash: [6, 3],
                                        pointRadius: [0, 6],
                                        pointBackgroundColor: isPositive ? "#16a34a" : "#dc2626",
                                        tension: 0,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: true, position: "top" },
                                    tooltip: {
                                        callbacks: {
                                            label: ctx => `₹${ctx.parsed.y.toFixed(2)}`,
                                            title: ctx => new Date(ctx[0].parsed.x).toLocaleDateString(),
                                        },
                                    },
                                },
                                scales: {
                                    x: { type: "time", time: { unit: "day" } },
                                    y: { title: { display: true, text: "Price (₹)" } },
                                },
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );

    // Render modal at document.body level so z-index is never clipped by parent
    return createPortal(modal, document.body);
}
