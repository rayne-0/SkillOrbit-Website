"""
gamification/models.py

MongoDB collection wrapper for the gamification system.
Tracks XP, levels, badges, streaks, and lesson completion counts per user.
"""

from core.db import db
from bson import ObjectId
from datetime import datetime, timezone, date

# ──────────────────────────────────────────────────────────────────────────────
# XP required to reach each level (cumulative from level 1)
# ──────────────────────────────────────────────────────────────────────────────
LEVEL_XP_THRESHOLDS = [
    0,      # Level 1
    100,    # Level 2
    250,    # Level 3
    450,    # Level 4
    700,    # Level 5
    1000,   # Level 6
    1350,   # Level 7
    1750,   # Level 8
    2200,   # Level 9
    2700,   # Level 10
    3250,   # Level 11
    3850,   # Level 12
    4500,   # Level 13
    5200,   # Level 14
    5950,   # Level 15
    6750,   # Level 16
    7600,   # Level 17
    8500,   # Level 18
    9450,   # Level 19
    10450,  # Level 20
]

# ──────────────────────────────────────────────────────────────────────────────
# Badge definitions
# ──────────────────────────────────────────────────────────────────────────────
ALL_BADGES = [
    {"id": "first_step",      "name": "First Step",       "icon": "🚀", "description": "Complete your very first lesson"},
    {"id": "on_fire",         "name": "On Fire",          "icon": "🔥", "description": "Maintain a 3-day learning streak"},
    {"id": "diamond_learner", "name": "Diamond Learner",  "icon": "💎", "description": "Maintain a 7-day learning streak"},
    {"id": "speed_runner",    "name": "Speed Runner",     "icon": "⚡", "description": "Complete 5 lessons in a single day"},
    {"id": "knowledge_seeker","name": "Knowledge Seeker", "icon": "🧠", "description": "Complete 10 lessons total"},
    {"id": "course_master",   "name": "Course Master",    "icon": "🏆", "description": "Complete an entire course"},
    {"id": "perfect_score",   "name": "Perfect Score",    "icon": "🎯", "description": "Score 100% on a quiz"},
    {"id": "star_student",    "name": "Star Student",     "icon": "🌟", "description": "Reach Level 5"},
    {"id": "curious_mind",    "name": "Curious Mind",     "icon": "💬", "description": "Ask the AI Mentor 10 questions"},
    {"id": "note_taker",      "name": "Note Taker",       "icon": "📝", "description": "Create 5 lesson notes"},
    {"id": "wise_owl",        "name": "Wise Owl",         "icon": "🦉", "description": "Complete 50 lessons total"},
    {"id": "global_learner",  "name": "Global Learner",   "icon": "🌍", "description": "Enroll in 3 different courses"},
    {"id": "xp_collector",    "name": "XP Collector",     "icon": "⚡", "description": "Earn 1,000 total XP"},
    {"id": "graduate",        "name": "Graduate",         "icon": "🎓", "description": "Reach Level 10"},
    {"id": "legend",          "name": "Legend",           "icon": "🏅", "description": "Reach Level 20"},
]


def get_level_for_xp(xp: int) -> int:
    """Return the level (1-20) for a given XP amount."""
    level = 1
    for i, threshold in enumerate(LEVEL_XP_THRESHOLDS):
        if xp >= threshold:
            level = i + 1
        else:
            break
    return min(level, 20)


def get_next_level_xp(xp: int) -> int:
    """Return the XP needed for the next level (or same if max level)."""
    level = get_level_for_xp(xp)
    if level >= 20:
        return LEVEL_XP_THRESHOLDS[-1]
    return LEVEL_XP_THRESHOLDS[level]  # level index is 0-based so level gives next


def check_badge_eligibility(profile: dict) -> list:
    """
    Check which new badges the user has earned based on their current profile.
    Returns a list of newly-earned badge IDs.
    """
    earned = set(profile.get("badges", []))
    newly_earned = []
    xp = profile.get("xp", 0)
    level = get_level_for_xp(xp)
    lessons = profile.get("total_lessons_completed", 0)
    streak = profile.get("streak", 0)
    ai_questions = profile.get("ai_questions_asked", 0)
    daily_lessons = profile.get("daily_lessons_today", 0)
    courses_enrolled = profile.get("courses_enrolled", 0)
    notes_created = profile.get("notes_created", 0)

    checks = [
        ("first_step",       lessons >= 1),
        ("on_fire",          streak >= 3),
        ("diamond_learner",  streak >= 7),
        ("speed_runner",     daily_lessons >= 5),
        ("knowledge_seeker", lessons >= 10),
        ("star_student",     level >= 5),
        ("curious_mind",     ai_questions >= 10),
        ("note_taker",       notes_created >= 5),
        ("wise_owl",         lessons >= 50),
        ("global_learner",   courses_enrolled >= 3),
        ("xp_collector",     xp >= 1000),
        ("graduate",         level >= 10),
        ("legend",           level >= 20),
    ]

    for badge_id, condition in checks:
        if condition and badge_id not in earned:
            newly_earned.append(badge_id)

    return newly_earned


class GamificationCollection:
    @staticmethod
    def _col():
        return db["gamification"]

    @classmethod
    def get_or_create(cls, user_id: str) -> dict:
        """Get user's gamification profile, creating a default one if needed."""
        try:
            uid = ObjectId(user_id)
            profile = cls._col().find_one({"user_id": uid})
            if not profile:
                today = date.today().isoformat()
                profile = {
                    "user_id": uid,
                    "xp": 0,
                    "level": 1,
                    "badges": [],
                    "streak": 0,
                    "last_activity_date": None,
                    "total_lessons_completed": 0,
                    "ai_questions_asked": 0,
                    "daily_lessons_today": 0,
                    "daily_lessons_date": today,
                    "courses_enrolled": 0,
                    "notes_created": 0,
                    "created_at": datetime.now(timezone.utc),
                }
                cls._col().insert_one(profile)
            return profile
        except Exception as e:
            print(f"GamificationCollection.get_or_create error: {e}")
            return {}

    @classmethod
    def award_xp(cls, user_id: str, xp_amount: int, action: str = "lesson") -> dict:
        """
        Award XP to a user and update streak.
        Returns dict with { xp_gained, new_xp, old_level, new_level, new_badges, leveled_up }
        """
        try:
            uid = ObjectId(user_id)
            profile = cls.get_or_create(user_id)

            old_xp = profile.get("xp", 0)
            new_xp = old_xp + xp_amount
            old_level = get_level_for_xp(old_xp)
            new_level = get_level_for_xp(new_xp)
            leveled_up = new_level > old_level

            # Update streak
            today = date.today().isoformat()
            last_activity = profile.get("last_activity_date")
            streak = profile.get("streak", 0)

            from datetime import timedelta
            if last_activity is None:
                streak = 1
            elif last_activity == today:
                pass  # same day, no streak change
            elif last_activity == (date.today() - timedelta(days=1)).isoformat():
                streak += 1
            else:
                streak = 1  # streak broken

            # Update daily lesson count
            daily_date = profile.get("daily_lessons_date", today)
            daily_count = profile.get("daily_lessons_today", 0)
            if daily_date != today:
                daily_count = 0
                daily_date = today
            if action == "lesson":
                daily_count += 1

            # Build update
            updates = {
                "xp": new_xp,
                "level": new_level,
                "streak": streak,
                "last_activity_date": today,
                "daily_lessons_today": daily_count,
                "daily_lessons_date": daily_date,
            }
            if action == "lesson":
                updates["total_lessons_completed"] = profile.get("total_lessons_completed", 0) + 1
            elif action == "ai_question":
                updates["ai_questions_asked"] = profile.get("ai_questions_asked", 0) + 1
            elif action == "note":
                updates["notes_created"] = profile.get("notes_created", 0) + 1

            # Merge updates into profile snapshot for badge checking
            merged = {**profile, **updates}
            new_badge_ids = check_badge_eligibility(merged)
            if new_badge_ids:
                current_badges = list(set(profile.get("badges", []) + new_badge_ids))
                updates["badges"] = current_badges

            cls._col().update_one({"user_id": uid}, {"$set": updates})

            return {
                "xp_gained": xp_amount,
                "new_xp": new_xp,
                "old_level": old_level,
                "new_level": new_level,
                "leveled_up": leveled_up,
                "new_badges": new_badge_ids,
                "streak": streak,
                "next_level_xp": get_next_level_xp(new_xp),
            }
        except Exception as e:
            print(f"GamificationCollection.award_xp error: {e}")
            return {}

    @classmethod
    def get_profile(cls, user_id: str) -> dict:
        profile = cls.get_or_create(user_id)
        xp = profile.get("xp", 0)
        level = get_level_for_xp(xp)
        return {
            "xp": xp,
            "level": level,
            "next_level_xp": get_next_level_xp(xp),
            "current_level_xp": LEVEL_XP_THRESHOLDS[level - 1],
            "badges": profile.get("badges", []),
            "streak": profile.get("streak", 0),
            "total_lessons_completed": profile.get("total_lessons_completed", 0),
            "ai_questions_asked": profile.get("ai_questions_asked", 0),
            "notes_created": profile.get("notes_created", 0),
        }

    @classmethod
    def get_leaderboard(cls, limit: int = 10) -> list:
        """Return top users sorted by XP descending."""
        try:
            top = list(cls._col().find({}).sort("xp", -1).limit(limit))
            result = []
            for entry in top:
                user = db["users"].find_one({"_id": entry["user_id"]})
                if user:
                    xp = entry.get("xp", 0)
                    result.append({
                        "name": user.get("name", "Unknown"),
                        "xp": xp,
                        "level": get_level_for_xp(xp),
                        "badges_count": len(entry.get("badges", [])),
                        "streak": entry.get("streak", 0),
                    })
            return result
        except Exception as e:
            print(f"GamificationCollection.get_leaderboard error: {e}")
            return []
