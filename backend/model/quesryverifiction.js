async function validateSearch(query) {
  const lower = query.toLowerCase();

  // List of keywords related to stocks/market
  const keywords = [
    "stock", "share", "market", "nifty", "sensex", "nasdaq", "dow jones",
    "ipo", "equity", "mutual fund", "trading", "investment", "portfolio",
    "bullish", "bearish", "dividend", "earnings", "financial", "company results",
    "price target", "valuation", "securities", "brokerage"
  ];

  let isStockRelated = false;
  let reason = "Query does not seem related to stocks or market.";

  // Check if query contains any keyword
  for (const word of keywords) {
    if (lower.includes(word)) {
      isStockRelated = true;
      reason = `Query contains financial term: "${word}"`;
      break;
    }
  }

  return JSON.stringify({
    valid: isStockRelated,
    reason: reason
  });
}

module.exports = { validateSearch };
