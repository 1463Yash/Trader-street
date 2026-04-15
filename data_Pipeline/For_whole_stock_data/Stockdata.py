import yfinance as yf
from db_connection import get_collection
from datetime import datetime, timedelta

collection = get_collection()

nifty_50 = [
    "RELIANCE.NS","HDFCBANK.NS","ICICIBANK.NS","INFY.NS","TCS.NS","ITC.NS","LT.NS",
    "SBIN.NS","BHARTIARTL.NS","KOTAKBANK.NS","HINDUNILVR.NS","AXISBANK.NS","BAJFINANCE.NS",
    "ASIANPAINT.NS","MARUTI.NS","SUNPHARMA.NS","ONGC.NS","WIPRO.NS","NTPC.NS","TITAN.NS",
    "ULTRACEMCO.NS","NESTLEIND.NS","POWERGRID.NS","HCLTECH.NS","JSWSTEEL.NS","ADANIENT.NS",
    "ADANIPORTS.NS","GRASIM.NS","TATASTEEL.NS","M&M.NS","HDFCLIFE.NS","BAJAJFINSV.NS",
    "COALINDIA.NS","TECHM.NS","BRITANNIA.NS","CIPLA.NS","DIVISLAB.NS","DRREDDY.NS",
    "HINDALCO.NS","HEROMOTOCO.NS","BPCL.NS","EICHERMOT.NS","SHREECEM.NS","APOLLOHOSP.NS",
    "INDUSINDBK.NS","SBILIFE.NS","BAJAJ-AUTO.NS","TMCV.NS","UPL.NS","TRENT.NS"
]

nifty_next_50 = [
    "ADANIPOWER.NS","DMART.NS","ICICIPRULI.NS","NAUKRI.NS",
    "GODREJCP.NS","PIDILITIND.NS","DLF.NS","MUTHOOTFIN.NS","COLPAL.NS","BANKBARODA.NS",
    "INDIGO.NS","PNB.NS","ETERNAL.NS","ABB.NS","BERGEPAINT.NS","CANBK.NS","INDHOTEL.NS",
    "YESBANK.NS","TORNTPHARM.NS","TVSMOTOR.NS","AUROPHARMA.NS","MANAPPURAM.NS","BEL.NS",
    "IOC.NS","SAIL.NS","PETRONET.NS","GAIL.NS","HAVELLS.NS","AMBUJACEM.NS","ACC.NS",
    "LICHSGFIN.NS","CHOLAFIN.NS","LUPIN.NS","LTIM.NS","BANDHANBNK.NS","IDFCFIRSTB.NS",
    "PAGEIND.NS","JINDALSTEL.NS","NMDC.NS","CONCOR.NS","IGL.NS","MPHASIS.NS","GLENMARK.NS",
    "ALKEM.NS","AUBANK.NS","POLYCAB.NS","IPCALAB.NS","SHRIRAMFIN.NS"  # Added to make 50
]
companies=nifty_50+nifty_next_50
end_date = datetime.today()
start_date = end_date - timedelta(days=5*365)

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

