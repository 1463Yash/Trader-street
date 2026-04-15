import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd


companies=["^NSEBANK","^CNXIT","^CNXAUTO","^NSEI","^NSMIDCP"]

end_date = datetime.today()
start_date = end_date - timedelta(days=90)  # सिर्फ 1 साल का data

success_list = []
fail_list = []

for ticker in companies:
    try:
        print(f"Fetching data for {ticker}...")
        data = yf.download(ticker, start=start_date, end=end_date)

        if not isinstance(data, pd.DataFrame) or data.empty:
            print(f"❌ No valid data for {ticker}")
            fail_list.append(ticker)
        else:
            print(f"✅ Data fetched for {ticker}, rows: {len(data)}")
            success_list.append(ticker)

    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        fail_list.append(ticker)

# --- Summary Report ---
print("\n===== SUMMARY REPORT =====")
print(f"✅ Successful fetch: {len(success_list)} companies")
print(f"❌ Failed fetch: {len(fail_list)} companies")

if fail_list:
    print("\nCompanies with no data:")
    for comp in fail_list:
        print("-", comp)
