# 📊 Stock Market Data Pipeline & Dashboard

## 🚀 Overview
This project is an end-to-end data pipeline and analytics dashboard for stock market data. It automates data extraction, transformation, and storage, and provides an interactive interface for visualization.

---

## 🔄 ETL Pipeline
- **Extract:** Fetches stock data from Yahoo Finance API using Python (yfinance)
- **Transform:** Cleans, formats, and structures data (handles missing values, column formatting)
- **Load:** Stores processed data into MongoDB for efficient querying

---

## ⚙️ Features
- Automated daily data updates using Windows Task Scheduler
- Incremental data handling (insert/delete for latest records)
- Supports multiple indices: Nifty 50, Next 50, Bank Nifty
- Data consistency and duplicate handling

---

## 📊 Dashboard
- Built using React.js
- Interactive charts for:
  - Price trends
  - Volume analysis
  - Moving averages
- Features:
  - Stock filtering
  - Date range selection
  - Comparison between stocks

---

## 🛠️ Tech Stack
- **Backend:** Python
- **Database:** MongoDB
- **Frontend:** React.js
- **Automation:** Windows Task Scheduler

---

## 📸 Screenshots
(Add your dashboard screenshots here)

---

## 📌 Future Improvements
- Deploy on cloud (AWS / MongoDB Atlas)
- Add real-time streaming
- Integrate ML-based predictions

---

## 👨‍💻 Author
Yash Mangla