const express = require("express");
const { XMLParser } = require("fast-xml-parser");
const route = express.Router();

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

// Cache to avoid hammering Google RSS
let cache = { data: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

route.get("/", async (req, res, next) => {
    try {
        const q = req.query.q || "stock market india nifty sensex";

        // Return cache if fresh
        if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
            return res.json(cache.data);
        }

        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;
        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        if (!response.ok) throw new Error(`RSS fetch failed: ${response.status}`);

        const xml  = await response.text();
        const json = parser.parse(xml);
        const items = json?.rss?.channel?.item || [];

        const news = (Array.isArray(items) ? items : [items]).slice(0, 20).map(item => ({
            title:     item.title?.replace(/<[^>]+>/g, "") || "",
            link:      item.link || "",
            source:    item.source?.["#text"] || item.source || "",
            pubDate:   item.pubDate || "",
        }));

        cache = { data: news, ts: Date.now() };
        res.json(news);
    } catch (err) { next(err); }
});

module.exports = route;
