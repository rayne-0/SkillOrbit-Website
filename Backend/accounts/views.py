"""
accounts/views.py

All authentication endpoints for SkillOrbit.

Endpoints:
  POST /api/auth/signup/          — Email/password registration
  POST /api/auth/login/           — Email/password login
  POST /api/auth/google/          — Google OAuth login / register
  POST /api/auth/forgot-password/ — Request OTP to reset password
  POST /api/auth/verify-otp/      — Verify OTP, get a short-lived reset token
  POST /api/auth/reset-password/  — Use reset token to set new password
  GET  /api/auth/me/              — Get current user info (protected)
"""

import json
from datetime import datetime, timezone

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import UserCollection
from .utils import (
    hash_password,
    verify_password,
    generate_jwt,
    generate_otp,
    get_otp_expiry,
    send_otp_email,
    verify_google_id_token,
    get_user_from_request,
    decode_jwt,
)


# --------------------------------------------------------------------------- #
#  Helpers                                                                     #
# --------------------------------------------------------------------------- #

def _json_body(request) -> dict:
    """Parse JSON body, return empty dict on failure."""
    try:
        return json.loads(request.body)
    except Exception:
        return {}


def _ok(data: dict, status: int = 200) -> JsonResponse:
    return JsonResponse({"success": True, **data}, status=status)


def _err(message: str, status: int = 400) -> JsonResponse:
    return JsonResponse({"success": False, "error": message}, status=status)


def _user_safe(user: dict) -> dict:
    """Strip sensitive fields before returning user data to client."""
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "provider": user.get("provider", "email"),
        "is_admin": user.get("is_admin", False),
    }


# --------------------------------------------------------------------------- #
#  Signup                                                                      #
# --------------------------------------------------------------------------- #

@csrf_exempt
@require_http_methods(["POST"])
def signup(request):
    """
    Register a new user with email and password.

    Body: { "name": str, "email": str, "password": str }
    """
    data = _json_body(request)
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return _err("name, email, and password are required.")

    if len(password) < 8:
        return _err("Password must be at least 8 characters.")

    if UserCollection.find_by_email(email):
        return _err("An account with this email already exists.")

    password_hash = hash_password(password)
    user_id = UserCollection.create_user(name, email, password_hash, provider="email")

    tokens = generate_jwt(user_id, email)
    user = UserCollection.find_by_id(user_id)

    return _ok({"tokens": tokens, "user": _user_safe(user)}, status=201)


# --------------------------------------------------------------------------- #
#  Login                                                                       #
# --------------------------------------------------------------------------- #

@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    """
    Authenticate with email and password.

    Body: { "email": str, "password": str }
    """
    data = _json_body(request)
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return _err("email and password are required.")

    user = UserCollection.find_by_email(email)
    if not user:
        return _err("Invalid email or password.")

    if user.get("provider") != "email":
        return _err(
            f"This account was created with {user.get('provider', 'OAuth')}. "
            "Please use the corresponding login method."
        )

    if not verify_password(password, user.get("password", "")):
        return _err("Invalid email or password.")

    tokens = generate_jwt(str(user["_id"]), email)
    return _ok({"tokens": tokens, "user": _user_safe(user)})


# --------------------------------------------------------------------------- #
#  Google OAuth                                                                #
# --------------------------------------------------------------------------- #

@csrf_exempt
@require_http_methods(["POST"])
def google_auth(request):
    """
    Verify a Google ID token from the frontend and log in or register the user.

    Body: { "credential": str }  — The ID token from Google Identity Services
    """
    data = _json_body(request)
    credential = data.get("credential", "")

    if not credential:
        return _err("Google credential token is required.")

    google_user = verify_google_id_token(credential)
    if not google_user:
        return _err("Invalid or expired Google token.")

    email = google_user["email"]
    name = google_user["name"]

    existing = UserCollection.find_by_email(email)

    if existing:
        # If they signed up with email/password, link them to Google
        user_id = str(existing["_id"])
    else:
        # Auto-register new Google user (no password)
        user_id = UserCollection.create_user(name, email, password_hash=None, provider="google")

    user = UserCollection.find_by_id(user_id)
    tokens = generate_jwt(user_id, email)
    return _ok({"tokens": tokens, "user": _user_safe(user)})


# --------------------------------------------------------------------------- #
#  Forgot Password — Step 1: Request OTP                                      #
# --------------------------------------------------------------------------- #

@csrf_exempt
@require_http_methods(["POST"])
def forgot_password(request):
    """
    Send a 6-digit OTP to the given email address.

    Body: { "email": str }
    """
    data = _json_body(request)
    email = data.get("email", "").strip().lower()

    if not email:
        return _err("email is required.")

    user = UserCollection.find_by_email(email)
    if not user:
        # Don't leak whether the email exists — always return success
        return _ok({"message": "If this email is registered, you will receive an OTP shortly."})

    otp = generate_otp()
    expires_at = get_otp_expiry()
    UserCollection.set_otp(email, otp, expires_at)

    try:
        send_otp_email(email, otp)
    except Exception as exc:
        # Log but don't expose error details to client
        print(f"[EMAIL ERROR] Failed to send OTP to {email}: {exc}")
        return _err(
            "Failed to send OTP email. Please check server email configuration.",
            status=500,
        )

    return _ok({"message": "OTP sent to your email address."})


# --------------------------------------------------------------------------- #
#  Forgot Password — Step 2: Verify OTP                                       #
# --------------------------------------------------------------------------- #

@csrf_exempt
@require_http_methods(["POST"])
def verify_otp(request):
    """
    Verify the OTP submitted by the user.

    Body: { "email": str, "otp": str }

    Returns a short-lived reset token if OTP is valid.
    """
    data = _json_body(request)
    email = data.get("email", "").strip().lower()
    submitted_otp = data.get("otp", "").strip()

    if not email or not submitted_otp:
        return _err("email and otp are required.")

    user = UserCollection.find_by_email(email)
    if not user:
        return _err("Invalid request.")

    stored_otp = user.get("otp")
    expires_at = user.get("otp_expires_at")

    if not stored_otp or not expires_at:
        return _err("No OTP was requested for this email.")

    # Ensure expires_at is timezone-aware for comparison
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at:
        UserCollection.clear_otp(email)
        return _err("OTP has expired. Please request a new one.")

    if submitted_otp != stored_otp:
        return _err("Incorrect OTP.")

    # OTP is valid — clear it and issue a short-lived password-reset JWT
    UserCollection.clear_otp(email)

    # Reuse JWT infrastructure but with 'reset' type and 15-min expiry
    import jwt as pyjwt
    from datetime import timedelta
    from .utils import JWT_SECRET, JWT_ALGORITHM

    now = datetime.now(timezone.utc)
    reset_payload = {
        "email": email,
        "type": "password_reset",
        "iat": now,
        "exp": now + timedelta(minutes=15),
    }
    reset_token = pyjwt.encode(reset_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return _ok({"reset_token": reset_token, "message": "OTP verified. You may now reset your password."})


# --------------------------------------------------------------------------- #
#  Forgot Password — Step 3: Reset Password                                   #
# --------------------------------------------------------------------------- #

@csrf_exempt
@require_http_methods(["POST"])
def reset_password(request):
    """
    Reset the user's password using the reset token from verify_otp.

    Body: { "reset_token": str, "new_password": str }
    """
    data = _json_body(request)
    reset_token = data.get("reset_token", "")
    new_password = data.get("new_password", "")

    if not reset_token or not new_password:
        return _err("reset_token and new_password are required.")

    if len(new_password) < 8:
        return _err("Password must be at least 8 characters.")

    payload = decode_jwt(reset_token)
    if not payload or payload.get("type") != "password_reset":
        return _err("Invalid or expired reset token.")

    email = payload.get("email")
    new_hash = hash_password(new_password)
    UserCollection.update_password(email, new_hash)

    return _ok({"message": "Password reset successfully."})


# --------------------------------------------------------------------------- #
#  Me (Protected)                                                              #
# --------------------------------------------------------------------------- #

@require_http_methods(["GET"])
def me(request):
    """
    Return the authenticated user's profile.

    Requires: Authorization: Bearer <access_token>
    """
    payload = get_user_from_request(request)
    if not payload:
        return _err("Authentication required.", status=401)

    user = UserCollection.find_by_id(payload["user_id"])
    if not user:
        return _err("User not found.", status=404)

    return _ok({"user": _user_safe(user)})
