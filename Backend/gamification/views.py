"""
gamification/views.py

REST endpoints for the gamification system.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from accounts.decorators import login_required
from .models import GamificationCollection, ALL_BADGES


def _ok(data: dict, status: int = 200) -> JsonResponse:
    return JsonResponse({"success": True, **data}, status=status)


def _err(message: str, status: int = 400) -> JsonResponse:
    return JsonResponse({"success": False, "error": message}, status=status)


def _json_body(request) -> dict:
    try:
        return json.loads(request.body)
    except Exception:
        return {}


@csrf_exempt
@require_http_methods(["GET"])
@login_required
def get_profile(request):
    """
    GET /api/gamification/profile/
    Returns the current user's XP, level, badges, streak, and stats.
    """
    user_id = str(request.user["_id"])
    profile = GamificationCollection.get_profile(user_id)
    # Enrich badges with full badge metadata
    earned_ids = set(profile.get("badges", []))
    badges_full = []
    for b in ALL_BADGES:
        badges_full.append({**b, "earned": b["id"] in earned_ids})
    profile["badges_full"] = badges_full
    return _ok({"profile": profile})


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def award_xp(request):
    """
    POST /api/gamification/award/
    Body: { "xp": 50, "action": "lesson" | "ai_question" | "note" }
    Awards XP and returns updated stats including new badges earned.
    """
    user_id = str(request.user["_id"])
    data = _json_body(request)
    xp_amount = data.get("xp", 50)
    action = data.get("action", "lesson")

    result = GamificationCollection.award_xp(user_id, xp_amount, action)
    if not result:
        return _err("Failed to award XP", status=500)

    # Enrich newly earned badges with full metadata
    badge_map = {b["id"]: b for b in ALL_BADGES}
    new_badges_full = [badge_map[bid] for bid in result.get("new_badges", []) if bid in badge_map]
    result["new_badges_full"] = new_badges_full

    return _ok({"result": result})


@csrf_exempt
@require_http_methods(["GET"])
def get_leaderboard(request):
    """
    GET /api/gamification/leaderboard/
    Public leaderboard — top 10 learners by XP.
    """
    leaderboard = GamificationCollection.get_leaderboard(limit=10)
    return _ok({"leaderboard": leaderboard})
