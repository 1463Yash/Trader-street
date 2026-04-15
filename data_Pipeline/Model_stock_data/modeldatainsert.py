import yfinance as yf
from db_connection import get_modeldata
from datetime import datetime, timedelta

collection=get_modeldata()

companies=["^NSEBANK","^CNXIT","^CNXAUTO","^NSEI","^NSMIDCP"]
end_date = datetime.today()
start_date = end_date - timedelta(days=90)

import yfinance as yf

for ticker in companies:
    try:
        print(f"Fetching data for {ticker}...")
        data = yf.download(ticker, start=start_date, end=end_date)
        print(data.head())

        # ✅ Empty check
        if data is None or data.empty:
            print(f"No data found for {ticker}")
            continue

        # ✅ Flatten column names if they are tuples
        data.columns = [
            "_".join([str(c) for c in col if c]) if isinstance(col, tuple) else str(col)
            for col in data.columns
        ]

        records = data.reset_index().to_dict("records")
        for rec in records:
            rec["Ticker"] = ticker

        collection.insert_many(records)
        print(f"{ticker} - {len(records)} records saved.")

    except Exception as e:
        print(f"Error fetching {ticker}: {e}")

