"""
accounts/utils.py

Utility helpers for authentication:
  - Password hashing (bcrypt)
  - JWT generation & decoding
  - OTP generation & email sending
  - Google ID token verification
"""

import os
import secrets
import string
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from django.core.mail import send_mail
from google.oauth2 import id_token as google_id_token
import google.auth.transport.requests as google_transport


# --------------------------------------------------------------------------- #
#  Config (read from environment)                                              #
# --------------------------------------------------------------------------- #

JWT_SECRET = os.environ.get("JWT_SECRET", "CHANGE_ME_BEFORE_PRODUCTION")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_EXPIRY_MINUTES = 60          # 1 hour access token
JWT_REFRESH_EXPIRY_DAYS = 7            # 7 day refresh token

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID")

OTP_EXPIRY_MINUTES = 10                # OTP valid for 10 minutes


# --------------------------------------------------------------------------- #
#  Password helpers                                                            #
# --------------------------------------------------------------------------- #

def hash_password(raw: str) -> str:
    """Return a bcrypt hash of the raw password."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(raw.encode("utf-8"), salt).decode("utf-8")


def verify_password(raw: str, hashed: str) -> bool:
    """Return True if raw matches the stored bcrypt hash."""
    try:
        return bcrypt.checkpw(raw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# --------------------------------------------------------------------------- #
#  JWT helpers                                                                 #
# --------------------------------------------------------------------------- #

def generate_jwt(user_id: str, email: str) -> dict:
    """
    Generate a pair of JWT tokens.

    Returns:
        {"access": "<token>", "refresh": "<token>"}
    """
    now = datetime.now(timezone.utc)

    access_payload = {
        "user_id": user_id,
        "email": email,
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=JWT_ACCESS_EXPIRY_MINUTES),
    }

    refresh_payload = {
        "user_id": user_id,
        "email": email,
        "type": "refresh",
        "iat": now,
        "exp": now + timedelta(days=JWT_REFRESH_EXPIRY_DAYS),
    }

    access = jwt.encode(access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    refresh = jwt.encode(refresh_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return {"access": access, "refresh": refresh}


def decode_jwt(token: str) -> dict | None:
    """
    Decode and validate a JWT.

    Returns:
        The payload dict, or None if invalid / expired.
    """
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# --------------------------------------------------------------------------- #
#  OTP helpers                                                                 #
# --------------------------------------------------------------------------- #

def generate_otp(length: int = 6) -> str:
    """Return a cryptographically secure numeric OTP."""
    return "".join(secrets.choice(string.digits) for _ in range(length))


def get_otp_expiry() -> datetime:
    """Return a timezone-aware UTC datetime OTP_EXPIRY_MINUTES from now."""
    return datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)


def send_otp_email(to_email: str, otp: str) -> None:
    """
    Send the OTP to the given email via Django's email backend.
    Requires EMAIL_HOST_USER and EMAIL_HOST_PASSWORD to be set in .env.
    """
    subject = "SkillOrbit — Your Password Reset OTP"
    message = (
        f"Hi,\n\n"
        f"Your SkillOrbit password reset OTP is:\n\n"
        f"  {otp}\n\n"
        f"This code is valid for {OTP_EXPIRY_MINUTES} minutes.\n"
        f"If you did not request a password reset, please ignore this email.\n\n"
        f"— The SkillOrbit Team"
    )
    from_email = os.environ.get("EMAIL_HOST_USER", "noreply@skillorbit.com")
    send_mail(subject, message, from_email, [to_email], fail_silently=False)


# --------------------------------------------------------------------------- #
#  Google OAuth helper                                                         #
# --------------------------------------------------------------------------- #

def verify_google_id_token(token: str) -> dict | None:
    """
    Verify a Google ID token obtained from the frontend.

    Returns:
        A dict with 'email', 'name', 'picture' if valid; None otherwise.
    """
    try:
        info = google_id_token.verify_oauth2_token(
            token,
            google_transport.Request(),
            GOOGLE_CLIENT_ID,
        )
        return {
            "email": info.get("email"),
            "name": info.get("name", ""),
            "picture": info.get("picture", ""),
        }
    except Exception:
        return None


# --------------------------------------------------------------------------- #
#  Request auth helper                                                         #
# --------------------------------------------------------------------------- #

def get_user_from_request(request) -> dict | None:
    """
    Extract and verify the Bearer JWT from the Authorization header.

    Returns:
        Decoded payload dict or None.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    payload = decode_jwt(token)
    if payload and payload.get("type") == "access":
        return payload
    return None
