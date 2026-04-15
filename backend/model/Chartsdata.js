const express = require("express");
const connectDB=require("../mongoDB/mongodb");
const route=express.Router();
let db;


(async () => {
    try {
        db = await connectDB();
    } catch (error) {
        console.error("Database connection failed:", error);
    }
})();

route.get("/stock", async (req, res) => {
    const symbols = req.query.symbol
        ? req.query.symbol.split(",").map(s => s.trim()).filter(Boolean)
        : [];

    if (symbols.length === 0) {
        return res.json({});
    }

    try {
        const collection = db.collection("Stock_data");

        // Fetch each symbol separately and return as { SYMBOL: [{date, close},...] }
        const result = {};
        await Promise.all(symbols.map(async (sym) => {
            const closeField = `Close_${sym}`;
            const docs = await collection
                .find({ Ticker: sym })
                .sort({ Date: 1 })
                .toArray();

            result[sym] = docs
                .map(d => ({ date: d.Date, close: d[closeField] ?? null }))
                .filter(d => d.close !== null);
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

 


module.exports=route;

