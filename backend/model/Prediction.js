const express = require("express");
const route = express.Router();

// Proxy to Python Flask prediction server on port 5000
route.get("/:modelKey", async (req, res) => {
    const { modelKey } = req.params;
    try {
        const response = await fetch(`http://localhost:5000/predict/${modelKey}`);
        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json(err);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Prediction proxy error:", error);
        res.status(500).json({ error: "Prediction server unavailable" });
    }
});

// POST — custom 60-day data from user
route.post("/:modelKey", async (req, res) => {
    const { modelKey } = req.params;
    try {
        const response = await fetch(`http://localhost:5000/predict/${modelKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });
        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json(err);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Prediction proxy error:", error);
        res.status(500).json({ error: "Prediction server unavailable" });
    }
});

module.exports = route;
