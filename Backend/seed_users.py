import os
import sys
import django

# Bootstrap Django so core.db loads correctly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from accounts.models import UserCollection
from accounts.utils import hash_password

def seed_users():
    users_to_seed = [
        {"name": "Admin User", "email": "admin@skillorbit.com", "password": "password123", "is_admin": True},
        {"name": "Learner User", "email": "learner@example.com", "password": "password123", "is_admin": False},
        {"name": "Alice Walker", "email": "alice@example.com", "password": "password123", "is_admin": False},
        {"name": "Bob Smith", "email": "bob@example.com", "password": "password123", "is_admin": False},
    ]

    for user in users_to_seed:
        existing = UserCollection.find_by_email(user["email"])
        if existing:
            print(f"User {user['email']} already exists. Skipping.")
            continue
        
        pw_hash = hash_password(user["password"])
        uid = UserCollection.create_user(
            name=user["name"],
            email=user["email"],
            password_hash=pw_hash,
            is_admin=user["is_admin"]
        )
        print(f"Created user {user['email']} with ID: {uid} (Admin: {user['is_admin']})")

if __name__ == "__main__":
    seed_users()
    print("User seeding completed.")
