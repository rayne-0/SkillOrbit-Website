"""accounts/urls.py — URL patterns for the accounts app."""

from django.urls import path
from . import views

urlpatterns = [
    path("signup/",          views.signup,          name="auth_signup"),
    path("login/",           views.login,           name="auth_login"),
    path("google/",          views.google_auth,     name="auth_google"),
    path("forgot-password/", views.forgot_password, name="auth_forgot_password"),
    path("verify-otp/",      views.verify_otp,      name="auth_verify_otp"),
    path("reset-password/",  views.reset_password,  name="auth_reset_password"),
    path("me/",              views.me,              name="auth_me"),
]
