from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import joblib
import warnings
import os
import json
import h5py
from dotenv import load_dotenv
from pymongo import MongoClient
from sklearn.preprocessing import MinMaxScaler

warnings.filterwarnings("ignore")

# ── env & DB ──────────────────────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))
MONGO_URI = os.getenv("MONGO_URI")
client     = MongoClient(MONGO_URI)
db         = client["Trader's_street"]
collection = db["Model60data"]

# ── patch H5 for Keras 2→3 compat ─────────────────────────────────────────────
def patch_h5(path):
    with h5py.File(path, "r") as f:
        raw = f.attrs.get("model_config")
        if raw is None:
            return
        cfg = json.loads(raw)
        # Check if already patched (batch_input_shape exists, batch_shape gone)
        def is_patched(obj):
            if isinstance(obj, dict):
                if obj.get("class_name") == "InputLayer":
                    c = obj.get("config", {})
                    if "batch_shape" in c:
                        return False  # still needs patching
                for v in obj.values():
                    if not is_patched(v):
                        return False
            elif isinstance(obj, list):
                for i in obj:
                    if not is_patched(i):
                        return False
            return True

        if is_patched(cfg):
            return  # already patched, skip write

    # Needs patching — open in write mode
    with h5py.File(path, "r+") as f:
        raw = f.attrs.get("model_config")
        cfg = json.loads(raw)
        def fix(obj):
            if isinstance(obj, dict):
                obj.pop("quantization_config", None)
                if obj.get("class_name") == "InputLayer":
                    c = obj.get("config", {})
                    if "batch_shape" in c:
                        c["batch_input_shape"] = c.pop("batch_shape")
                    c.pop("optional", None)
                for v in obj.values():
                    fix(v)
            elif isinstance(obj, list):
                for i in obj:
                    fix(i)
        fix(cfg)
        f.attrs["model_config"] = json.dumps(cfg)

# ── rebuild scaler from min/max arrays ────────────────────────────────────────
def rebuild_scaler(data_min, data_max):
    scaler = MinMaxScaler()
    scaler.fit(np.array([data_min, data_max]))
    return scaler

BASE = os.path.dirname(os.path.abspath(__file__))

# ticker → column prefix mapping (columns stored as Close_^NSEI etc.)
MODEL_META = {
    "nifty50":   {
        "ticker": "^NSEI",
        "col_prefix": "^NSEI",
        "dir": "Nifty_50",
        "h5": "nifty_50_model.h5",
        "n_feat": 7,
        # feature order: [Close, High, Low, Open, BankClose, ITClose, Volume-proxy]
        # We use same ticker for all cross-index cols since we only have one ticker
    },
    "niftybank": {
        "ticker": "^NSEBANK",
        "col_prefix": "^NSEBANK",
        "dir": "Nifty_bank",
        "h5": "nifty_Bank_model.h5",
        "n_feat": 7,
    },
    "niftyit":   {
        "ticker": "^CNXIT",
        "col_prefix": "^CNXIT",
        "dir": "Nifty_IT",
        "h5": "nifty_IT_model.h5",
        "n_feat": 7,
    },
    "niftyauto": {
        "ticker": "^CNXAUTO",
        "col_prefix": "^CNXAUTO",
        "dir": "Nifty_auto",
        "h5": "nifty_auto_model.h5",
        "n_feat": 8,
    },
    "niftynext": {
        "ticker": "^NSMIDCP",
        "col_prefix": "^NSMIDCP",
        "dir": "Nifty_next",
        "h5": "nifty_Next_model.h5",
        "n_feat": 7,
    },
}

from tensorflow.keras.models import load_model  # noqa

loaded = {}
for key, meta in MODEL_META.items():
    h5_path = os.path.join(BASE, meta["dir"], meta["h5"])
    patch_h5(h5_path)
    model = load_model(h5_path)

    # Try joblib first; if numpy._core error, rebuild scaler from data_min/data_max
    feat_scaler_path   = os.path.join(BASE, meta["dir"], "feature_scaler.pkl")
    target_scaler_path = os.path.join(BASE, meta["dir"], "target_scaler.pkl")

    try:
        feat_scaler   = joblib.load(feat_scaler_path)
        target_scaler = joblib.load(target_scaler_path)
    except Exception as e:
        print(f"[predict_server] WARNING: joblib failed for {key} ({e}), rebuilding scaler from MongoDB data")
        # Rebuild by fitting on actual data from MongoDB
        ticker = meta["ticker"]
        prefix = meta["col_prefix"]
        n_feat = meta["n_feat"]
        docs = list(collection.find({"Ticker": ticker}, {"_id": 0}).sort("Date", 1))
        rows = []
        for d in docs:
            close  = d.get(f"Close_{prefix}")
            high   = d.get(f"High_{prefix}")
            low    = d.get(f"Low_{prefix}")
            open_  = d.get(f"Open_{prefix}")
            volume = d.get(f"Volume_{prefix}", 0)
            if None in [close, high, low, open_]:
                continue
            if n_feat == 7:
                rows.append([close, high, low, open_, close, close, volume])
            else:
                rows.append([close, high, low, open_, close, close, close, volume])
        arr = np.array(rows, dtype=np.float32)
        feat_scaler = MinMaxScaler()
        feat_scaler.fit(arr)
        target_scaler = MinMaxScaler()
        target_scaler.fit(arr[:, [0]])  # Close is index 0

    loaded[key] = {
        "model": model,
        "feat_scaler": feat_scaler,
        "target_scaler": target_scaler,
    }
    print(f"[predict_server] loaded {key}")

SEQ_LEN = 60

# ── prediction logic ──────────────────────────────────────────────────────────
def predict(key):
    meta   = MODEL_META[key]
    m      = loaded[key]
    ticker = meta["ticker"]
    prefix = meta["col_prefix"]
    n_feat = meta["n_feat"]

    docs = list(
        collection.find({"Ticker": ticker}, {"_id": 0})
                  .sort("Date", -1)
                  .limit(SEQ_LEN)
    )

    if len(docs) < SEQ_LEN:
        return None, f"Not enough data: only {len(docs)} records for {ticker}"

    docs.reverse()  # oldest → newest

    rows = []
    history = []
    for d in docs:
        close  = d.get(f"Close_{prefix}")
        high   = d.get(f"High_{prefix}")
        low    = d.get(f"Low_{prefix}")
        open_  = d.get(f"Open_{prefix}")
        volume = d.get(f"Volume_{prefix}", 0)

        if None in [close, high, low, open_]:
            return None, f"Missing fields in record: {d}"

        if n_feat == 7:
            rows.append([close, high, low, open_, close, close, volume])
        else:
            rows.append([close, high, low, open_, close, close, close, volume])

        date_str = str(d.get("Date", ""))[:10]
        history.append({"date": date_str, "close": float(close)})

    X_raw    = np.array(rows, dtype=np.float32)           # (60, n_feat)
    X_scaled = m["feat_scaler"].transform(X_raw)          # (60, n_feat)
    X_input  = X_scaled.reshape(1, SEQ_LEN, n_feat)       # (1, 60, n_feat)

    y_scaled = m["model"].predict(X_input, verbose=0)     # (1, 1)
    y_pred   = m["target_scaler"].inverse_transform(y_scaled)[0][0]

    return {"prediction": float(y_pred), "history": history}, None


# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

@app.route("/predict/<model_key>")
def predict_route(model_key):
    key = model_key.lower()
    if key not in loaded:
        return jsonify({"error": f"Unknown model: {model_key}"}), 404
    result, err = predict(key)
    if err:
        return jsonify({"error": err}), 500
    return jsonify(result)


@app.route("/predict/<model_key>", methods=["POST"])
def predict_custom_route(model_key):
    """Accept user-modified 60-day rows and run prediction on them.
    Body: { rows: [{date, close, high, low, open, volume}, ...] }  (60 items)
    """
    key = model_key.lower()
    if key not in loaded:
        return jsonify({"error": f"Unknown model: {model_key}"}), 404

    body = request.get_json()
    if not body or "rows" not in body:
        return jsonify({"error": "Missing 'rows' in request body"}), 400

    rows_in = body["rows"]
    if len(rows_in) != SEQ_LEN:
        return jsonify({"error": f"Expected {SEQ_LEN} rows, got {len(rows_in)}"}), 400

    meta   = MODEL_META[key]
    m      = loaded[key]
    n_feat = meta["n_feat"]

    try:
        rows = []
        history = []
        for r in rows_in:
            close  = float(r["close"])
            high   = float(r["high"])
            low    = float(r["low"])
            open_  = float(r["open"])
            volume = float(r.get("volume", 0))

            if n_feat == 7:
                rows.append([close, high, low, open_, close, close, volume])
            else:
                rows.append([close, high, low, open_, close, close, close, volume])

            history.append({"date": r["date"], "close": close})

        X_raw    = np.array(rows, dtype=np.float32)
        X_scaled = m["feat_scaler"].transform(X_raw)
        X_input  = X_scaled.reshape(1, SEQ_LEN, n_feat)

        y_scaled = m["model"].predict(X_input, verbose=0)
        y_pred   = m["target_scaler"].inverse_transform(y_scaled)[0][0]

        return jsonify({"prediction": float(y_pred), "history": history})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health")
def health():
    return jsonify({"status": "ok", "models": list(loaded.keys())})

if __name__ == "__main__":
    app.run(port=5000, debug=False)
