const express = require("express");
const connectDB = require("../mongoDB/mongodb");
const route = express.Router();
let db;

(async () => {
    try {
        db = await connectDB();
    } catch (error) {
        console.error("Database connection failed:", error);
    }
})();

route.get("/", async (req, res, next) => {
    try {
        const symbols = req.query.symbol ? req.query.symbol.split(",") : [];
        const collection = db.collection("Stock_data");
        const data = await collection.find({
            Ticker: { $in: symbols.map(sym => new RegExp(`^${sym}$`, "i")) }
        }).toArray();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = route;
