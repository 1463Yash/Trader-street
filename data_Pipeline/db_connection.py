from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Get Mongo URI from .env
mongo_uri = os.getenv("MONGO_URI")

# Create client
client = MongoClient(mongo_uri)

# Select DB and Collection
db = client["Trader's_street"]
collection = db["Stock_data"]
model60daysdata=db["Model60data"]

def get_collection():
    """Return MongoDB collection object"""
    return collection

def get_modeldata():
    """Return Mongo model 60 days data"""
    return model60daysdata
