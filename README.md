# 📈 Trader's Street

**AI-powered stock market analytics & LSTM-based index prediction platform for Indian markets.**

Final year B.Tech (Computer Science) major project — a full-stack web app that combines real-time-style stock charting, an LSTM deep learning model for index prediction, live financial news aggregation, and curated market video content, all in one dashboard.

> ⚠️ **Disclaimer:** Predictions are for educational purposes only and do not constitute financial advice.

---

## 🎥 Demo

| Desktop Walkthrough | Mobile Walkthrough |
|---|---|
| [![Watch desktop demo](https://img.youtube.com/vi/cEQAKy7DByE/maxresdefault.jpg)](https://youtu.be/cEQAKy7DByE) | [![Watch mobile demo](https://img.youtube.com/vi/uXPQBSv-ZRI/maxresdefault.jpg)](https://youtube.com/shorts/uXPQBSv-ZRI) |

---


---

## ✨ Features

- **Live Stock Charts** — Interactive, zoomable historical price charts (via Chart.js) for individual stocks (e.g. RELIANCE.NS, TCS.NS, ADANIPOWER.NS) with high/low, daily change, and a detailed tabular data view.
- **LSTM-Based Index Predictions** — Select an index (Nifty 50, Nifty Bank, Nifty IT, Nifty Auto, Nifty Next 50) and view the 60-day input data pipeline feeding the LSTM model to generate trend predictions.
- **Watchlist** — Authenticated users can star and track their favorite stocks.
- **Live News Ticker & News Search** — Aggregated, searchable financial news pulled from multiple sources (Economic Times, Mint, NDTV, Business Standard, Moneycontrol, and more).
- **Market Vlogs** — Curated/recommended YouTube market-commentary videos surfaced inside the app.
- **Authentication** — Email/password login, signup, and OTP-based password reset.
- **Light/Dark Mode** — Full theme toggle support.
- **Fully Responsive** — Dedicated mobile UI with hamburger navigation, alongside the desktop layout.

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Chart.js / react-chartjs-2 + `chartjs-chart-financial` (candlestick/financial charts)
- React Router
- Axios

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT Authentication (`jsonwebtoken`, `bcryptjs`)
- Nodemailer (OTP / email flows)
- OpenAI SDK

**ML / Data Pipeline**
- Python
- TensorFlow / Keras (LSTM model)
- scikit-learn, pandas, numpy
- Flask (prediction serving API)

---

## 📁 Project Structure

```
Trader-street/
├── ML_model/          # LSTM model, scaler, and Flask prediction server
├── backend/           # Express API, auth, MongoDB models
├── data_Pipeline/      # Python scripts for fetching & processing stock data
├── frontend/           # React + Vite client
├── package.json
└── requirements.txt
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- MongoDB instance (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/1463Yash/Trader-street.git
cd Trader-street
```

### 2. Backend setup
```bash
cd backend
npm install
```
Create a `backend/.env` file (see `.env.example`) with:
```
db_username=
db_password=
MONGO_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASSWORD=
```
```bash
node server.js
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. ML model / data pipeline setup
```bash
pip install -r requirements.txt
python ML_model/predict_server.py
```

---

## 📬 Contact

- **Email:** yashmangla118@gmail.com
- **GitHub:** [github.com/trader-street](https://github.com/trader-street)

---

## 📄 License

This project is for educational purposes as part of a final year B.Tech major project.
