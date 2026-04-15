import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart } from "react-chartjs-2";
import {
    Chart as ChartJS, TimeScale, LinearScale,
    LineElement, PointElement, Tooltip, Legend, Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { useAuth } from "../../context/AuthContext";
import "./MLPrediction.css";

ChartJS.register(TimeScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

const MODELS = [
    { key: "nifty50",   label: "Nifty 50"      },
    { key: "niftybank", label: "Nifty Bank"     },
    { key: "niftyit",   label: "Nifty IT"       },
    { key: "niftyauto", label: "Nifty Auto"     },
    { key: "niftynext", label: "Nifty Next 50"  },
];

const STAGES = [
    "Fetching 60-day market data...",
    "Normalizing features with MinMaxScaler...",
    "Feeding sequence into LSTM network...",
    "Running forward pass through layers...",
    "Inverse transforming prediction...",
    "Prediction ready ✓",
];

const STAGE_DELAYS = [1800, 1600, 2000, 1700, 1500];

export default function MLPredictionSection() {
    const { user } = useAuth();
    const [activeModel, setActiveModel] = useState(MODELS[0]);
    const [rows, setRows]               = useState([]);
    const [result, setResult]           = useState(null);
    const [stage, setStage]             = useState(-1);
    const [error, setError]             = useState(null);
    const resultRef                     = useRef(null);

    useEffect(() => {
        if (!user) return;
        runPrediction();
    }, [activeModel, user]);

    useEffect(() => {
        if (result && stage === STAGES.length - 1) {
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
        }
    }, [result, stage]);

    const runPrediction = async () => {
        setResult(null);
        setError(null);
        setRows([]);

        let fetchedData = null;
        try {
            const res = await axios.get(`http://localhost:3000/predict/${activeModel.key}`);
            fetchedData = res.data;
        } catch (err) {
            setStage(-1);
            setError(err.response?.data?.error || "Prediction failed");
            return;
        }

        for (let i = 0; i < STAGES.length - 1; i++) {
            setStage(i);
            await new Promise(r => setTimeout(r, STAGE_DELAYS[i]));
        }

        setRows(fetchedData.history);
        setStage(STAGES.length - 1);
        setResult(fetchedData);
    };

    const historyPoints = (result?.history || []).map(h => ({ x: new Date(h.date), y: h.close }));
    const lastDate      = historyPoints[historyPoints.length - 1]?.x;
    const nextDate      = lastDate ? new Date(lastDate.getTime() + 86400000) : new Date();
    const lastClose     = historyPoints[historyPoints.length - 1]?.y ?? 0;
    const change        = result ? result.prediction - lastClose : 0;
    const changePct     = lastClose ? (change / lastClose) * 100 : 0;
    const isUp          = change >= 0;
    const predColor     = isUp ? "#16a34a" : "#dc2626";
    const isRunning     = stage >= 0 && stage < STAGES.length - 1;

    if (!user) {
        return (
            <div className="mlp-locked">
                <div className="mlp-lock-icon">🔒</div>
                <h3>ML Predictions — Login Required</h3>
                <p>Please login to access LSTM-based index predictions.</p>
            </div>
        );
    }

    return (
        <div className="mlp-section">

            {/* Model tabs */}
            <div className="mlp-tabs">
                {MODELS.map(m => (
                    <button
                        key={m.key}
                        className={`mlp-tab ${activeModel.key === m.key ? "mlp-tab--active" : ""}`}
                        onClick={() => { if (!isRunning) setActiveModel(m); }}
                        disabled={isRunning}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <div className="mlp-body">

                {/* LEFT — read-only data table */}
                <div className="mlp-table-wrap">
                    <div className="mlp-table-header">
                        <h3>60-Day Input Data</h3>
                        <span className="mlp-table-hint">Data fed into the LSTM model</span>
                    </div>

                    <div className="mlp-table-scroll">
                        {isRunning || rows.length === 0 ? (
                            <div className="mlp-table-loading">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="mlp-skeleton-row" />
                                ))}
                            </div>
                        ) : (
                            <table className="mlp-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Date</th>
                                        <th>Close ₹</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r, i) => (
                                        <tr key={i} className={i === rows.length - 1 ? "mlp-row--last" : ""}>
                                            <td className="mlp-td-num">{i + 1}</td>
                                            <td className="mlp-td-date">{r.date?.slice(0, 10)}</td>
                                            <td className="mlp-td-val">₹{Number(r.close).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* RIGHT — pipeline + result */}
                <div className="mlp-result-wrap">

                    <div className="mlp-stages">
                        <h3>Model Pipeline</h3>
                        {STAGES.map((s, i) => (
                            <div
                                key={i}
                                className={`mlp-stage ${stage > i ? "mlp-stage--done" : ""} ${stage === i ? "mlp-stage--active" : ""}`}
                            >
                                <span className="mlp-stage-dot" />
                                <span className="mlp-stage-text">{s}</span>
                            </div>
                        ))}
                    </div>

                    {error && <div className="mlp-error">{error}</div>}

                    {result && stage === STAGES.length - 1 && (
                        <div className="mlp-output" ref={resultRef}>
                            <div className="mlp-pred-header">
                                <div className="mlp-pred-title">{activeModel.label}</div>
                                <div className="mlp-pred-price" style={{ color: predColor }}>
                                    ₹{result.prediction.toFixed(2)}
                                </div>
                                <div className="mlp-pred-change" style={{ color: predColor }}>
                                    {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)} ({Math.abs(changePct).toFixed(2)}%)
                                </div>
                                <div className="mlp-pred-label">Next Day Predicted Close</div>
                            </div>

                            <div className="mlp-stats">
                                {[
                                    { label: "Last Close", value: `₹${lastClose.toFixed(2)}` },
                                    { label: "Predicted",  value: `₹${result.prediction.toFixed(2)}`, highlight: true },
                                    { label: "Change",     value: `${isUp ? "+" : ""}${change.toFixed(2)}`, color: predColor },
                                    { label: "Change %",   value: `${isUp ? "+" : ""}${changePct.toFixed(2)}%`, color: predColor },
                                    { label: "60d High",   value: `₹${Math.max(...historyPoints.map(p => p.y)).toFixed(2)}` },
                                    { label: "60d Low",    value: `₹${Math.min(...historyPoints.map(p => p.y)).toFixed(2)}` },
                                ].map(s => (
                                    <div key={s.label} className={`mlp-stat ${s.highlight ? "mlp-stat--highlight" : ""}`}>
                                        <div className="mlp-stat-label">{s.label}</div>
                                        <div className="mlp-stat-value" style={{ color: s.color }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>

                            <Chart
                                type="line"
                                data={{
                                    datasets: [
                                        {
                                            label: "60-Day History",
                                            data: historyPoints,
                                            borderColor: "#f87171",
                                            borderWidth: 2.5,
                                            backgroundColor: (ctx) => {
                                                const chart = ctx.chart;
                                                const { ctx: c, chartArea } = chart;
                                                if (!chartArea) return "transparent";
                                                const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                                                g.addColorStop(0,   "rgba(248,113,113,0.5)");
                                                g.addColorStop(0.5, "rgba(248,113,113,0.15)");
                                                g.addColorStop(1,   "rgba(248,113,113,0)");
                                                return g;
                                            },
                                            pointRadius: 0,
                                            pointHoverRadius: 5,
                                            tension: 0.3,
                                            fill: "origin",
                                            order: 0,
                                        },
                                        {
                                            label: "Predicted",
                                            data: [
                                                historyPoints[historyPoints.length - 1],
                                                { x: nextDate, y: result.prediction },
                                            ],
                                            borderColor: predColor,
                                            backgroundColor: predColor,
                                            borderDash: [6, 4],
                                            pointRadius: [0, 8],
                                            pointBackgroundColor: predColor,
                                            tension: 0,
                                            fill: false,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    animation: { duration: 800 },
                                    plugins: {
                                        legend: { display: true, position: "top" },
                                        tooltip: {
                                            callbacks: {
                                                title: ctx => new Date(ctx[0].parsed.x).toLocaleDateString(),
                                                label: ctx => `₹${ctx.parsed.y.toFixed(2)}`,
                                            },
                                        },
                                    },
                                    scales: {
                                        x: {
                                            type: "time",
                                            time: { unit: "day" },
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
