from datetime import datetime, timedelta
import yfinance as yf
from db_connection import get_modeldata

# ✅ MongoDB collection
collection = get_modeldata()

companies = ["^NSEBANK", "^CNXIT", "^CNXAUTO", "^NSEI", "^NSMIDCP"]

# ✅ Dates
end_date = datetime.today()
start_date = end_date - timedelta(days=1)  # sirf latest ek din ka data

for ticker in companies:
    try:
        print(f"Updating data for {ticker}...")

        # ✅ Latest data fetch
        data = yf.download(ticker, start=start_date, end=end_date)

        if data is None or data.empty:
            print(f"No new data found for {ticker}")
            continue

        # ✅ Flatten column names
        data.columns = [
            "_".join([str(c) for c in col if c]) if isinstance(col, tuple) else str(col)
            for col in data.columns
        ]

        records = data.reset_index().to_dict("records")
        for rec in records:
            rec["Ticker"] = ticker

        # ✅ Oldest record delete
        oldest_record = collection.find({"Ticker": ticker}).sort("Date", 1).limit(1)
        for old in oldest_record:
            collection.delete_one({"_id": old["_id"]})
            print(f"Deleted oldest record for {ticker}: {old['Date']}")

        # ✅ Insert latest record
        collection.insert_many(records)
        print(f"Inserted {len(records)} new records for {ticker}")

    except Exception as e:
        print(f"Error updating {ticker}: {e}")
