const dotenv = require('dotenv');
dotenv.config({ path: '../.env' }); // Load from root

const express = require('express');
const app = express();
const PORT = 3000;
const cors=require("cors");

const validateRoute    = require("./middleware/Searchvalidation");
const chartsdataRoute  = require("./model/Chartsdata");
const SearchRoute      = require("./model/Searchchart");
const PredictionRoute  = require("./model/Prediction");
const AuthRoute        = require("./Authentication/authRoutes");
const NewsRoute        = require("./model/News");

app.use(cors());
app.use(express.json());

app.use("/auth",    AuthRoute);
app.use("/news",    NewsRoute);
app.use("/validate",validateRoute);
app.use("/",        chartsdataRoute);
app.use("/search",  SearchRoute);
app.use("/predict", PredictionRoute);

// Global error handler
app.use((err, req, res, next) => {
    console.error("Server error:", err.message);
    res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
