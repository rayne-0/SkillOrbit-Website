"""
accounts/models.py

Thin helper around the MongoDB 'users' collection.
No Django ORM — we talk directly to MongoDB via PyMongo.
"""

from core.db import db
from bson import ObjectId


class UserCollection:
    """Wrapper around the MongoDB 'users' collection."""

    @staticmethod
    def _col():
        return db["users"]

    # ------------------------------------------------------------------ #
    #  Read helpers                                                        #
    # ------------------------------------------------------------------ #

    @classmethod
    def find_by_email(cls, email: str):
        """Return a user document or None."""
        return cls._col().find_one({"email": email.lower().strip()})

    @classmethod
    def find_by_id(cls, user_id: str):
        """Return a user document by its ObjectId string."""
        try:
            return cls._col().find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    # ------------------------------------------------------------------ #
    #  Write helpers                                                       #
    # ------------------------------------------------------------------ #

    @classmethod
    def create_user(cls, name: str, email: str, password_hash: str | None, provider: str = "email", is_admin: bool = False):
        """
        Insert a new user.

        Args:
            name: Display name
            email: Email address (stored lowercase)
            password_hash: bcrypt hash (None for OAuth users)
            provider: 'email' | 'google'

        Returns:
            The inserted document's string ID.
        """
        doc = {
            "name": name,
            "email": email.lower().strip(),
            "password": password_hash,
            "provider": provider,
            "is_active": True,
            "is_admin": is_admin,
        }
        result = cls._col().insert_one(doc)
        return str(result.inserted_id)

    @classmethod
    def update_password(cls, email: str, new_hash: str):
        """Replace the password hash for a user."""
        cls._col().update_one(
            {"email": email.lower().strip()},
            {"$set": {"password": new_hash}}
        )

    @classmethod
    def make_admin(cls, email: str):
        """Promote a user to an admin."""
        cls._col().update_one(
            {"email": email.lower().strip()},
            {"$set": {"is_admin": True}}
        )

    @classmethod
    def set_otp(cls, email: str, otp: str, expires_at):
        """Store an OTP + expiry on the user document."""
        cls._col().update_one(
            {"email": email.lower().strip()},
            {"$set": {"otp": otp, "otp_expires_at": expires_at}}
        )

    @classmethod
    def clear_otp(cls, email: str):
        """Remove OTP fields after successful verification."""
        cls._col().update_one(
            {"email": email.lower().strip()},
            {"$unset": {"otp": "", "otp_expires_at": ""}}
        )
