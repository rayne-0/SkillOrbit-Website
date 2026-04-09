from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv('MONGODB_URI'))
db = client['skillorbit']
result = db.users.update_one(
    {'email': 'admin@skillorbit.com'},
    {'$set': {'is_admin': True}}
)
print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")
