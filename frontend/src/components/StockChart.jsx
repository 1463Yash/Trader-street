import { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale, // <- needed for x-axis categories
  LinearScale, // <- needed for y-axis
  BarElement, // <- for Bar charts
  PointElement, // <- for Line/Scatter charts
  LineElement, // <- for Line charts
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function StockChart({ symbol }) {

  return (
    <div className="stock-chart">
      <h4>{symbol}</h4>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Price",
              data: dataPoints,
              borderColor: "#3b82f6",
              backgroundColor: "#3b82f6",
              fill: true,
              tension: 0.3,
              pointRadius: 2,
              pointHoverRadius: 4,
            },
          ],
        }}
      />
    </div>
  );
}
