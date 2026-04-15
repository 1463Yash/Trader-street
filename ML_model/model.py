import os
from tensorflow.keras.models import load_model

model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "./Nifty_50/nifty_50_model.h5")
model = load_model(model_path)
model.summary()
