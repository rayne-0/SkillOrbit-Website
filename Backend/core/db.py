import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

try:
    # Initialize the MongoDB client
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    
    # Pre-select the database for the application
    db = client.get_database("skillorbit")
    print("Successfully connected to MongoDB.")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    client = None
    db = None
