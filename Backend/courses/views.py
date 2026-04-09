import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from accounts.utils import get_user_from_request
from accounts.models import UserCollection
from accounts.decorators import login_required

from .models import CourseCollection, EnrollmentCollection, NotesCollection

# --------------------------------------------------------------------------- #
#  Helpers                                                                    #
# --------------------------------------------------------------------------- #

def _json_body(request) -> dict:
    try:
        return json.loads(request.body)
    except Exception:
        return {}
        
def _ok(data: dict, status: int = 200) -> JsonResponse:
    return JsonResponse({"success": True, **data}, status=status)
    
def _err(message: str, status: int = 400) -> JsonResponse:
    return JsonResponse({"success": False, "error": message}, status=status)

def _serialize_id(doc):
    if not doc:
        return None
    doc["id"] = str(doc.pop("_id"))
    # Convert MongoDB ObjectIds to strings
    if "user_id" in doc: doc["user_id"] = str(doc["user_id"])
    if "course_id" in doc: doc["course_id"] = str(doc["course_id"])
    return doc

def check_admin(request):
    payload = get_user_from_request(request)
    if not payload:
        return False
    user = UserCollection.find_by_id(payload["user_id"])
    if not user or not user.get("is_admin", False):
        return False
    return True

# --------------------------------------------------------------------------- #
#  Public & Admin Course Endpoints                                            #
# --------------------------------------------------------------------------- #

@csrf_exempt
@require_http_methods(["GET", "POST"])
def courses_list_create(request):
    """
    GET: List all courses (Public)
    POST: Create a new course (Admin only)
    """
    if request.method == "GET":
        courses = CourseCollection.get_all()
        return _ok({"courses": [_serialize_id(c) for c in courses]})
        
    if request.method == "POST":
        if not check_admin(request):
            return _err("Admin privileges required.", status=403)
            
        data = _json_body(request)
        course_id = CourseCollection.create(data)
        return _ok({"message": "Course created", "course_id": course_id}, status=201)

@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def course_detail_update_delete(request, course_id):
    """
    GET: Get course details
    PUT: Update a course (Admin)
    DELETE: Delete a course (Admin)
    """
    course = CourseCollection.get_by_id(course_id)
    if not course:
        return _err("Course not found", status=404)
        
    if request.method == "GET":
        return _ok({"course": _serialize_id(course)})
        
    # PUT and DELETE requests require admin verification
    if not check_admin(request):
        return _err("Admin privileges required.", status=403)
        
    if request.method == "PUT":
        data = _json_body(request)
        success = CourseCollection.update(course_id, data)
        if success:
            return _ok({"message": "Course updated successfully"})
        return _err("Failed to update course", status=500)
        
    if request.method == "DELETE":
        success = CourseCollection.delete(course_id)
        if success:
            return _ok({"message": "Course deleted successfully"})
        return _err("Failed to delete course", status=500)

@csrf_exempt
@require_http_methods(["GET"])
@login_required
def admin_dashboard_stats(request):
    """
    GET /api/courses/admin/stats/
    Returns aggregate platform metrics for the admin dashboard.
    """
    if not request.user.get('is_admin'):
        return _err("Admin privileges required.", status=403)
        
    try:
        from core.db import db
        
        # 1. Total Courses
        total_courses = db.courses.count_documents({})
        
        # 2. Total Students (Users who are not admins)
        total_students = db.users.count_documents({"is_admin": {"$ne": True}})
        
        # 3. Total Enrollments
        total_enrollments = db.enrollments.count_documents({})
        
        # 4. Total Revenue (from paid orders)
        pipeline = [
            {"$match": {"status": "paid"}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        revenue_result = list(db.orders.aggregate(pipeline))
        total_revenue = (revenue_result[0]["total"] / 100) if revenue_result else 0
        
        # 5. Recent Enrollments (Join with Users and Courses)
        recent_enrollments_cursor = db.enrollments.find().sort("enrolled_at", -1).limit(5)
        recent_activity = []
        for e in recent_enrollments_cursor:
            u = db.users.find_one({"_id": e["user_id"]})
            c = db.courses.find_one({"_id": e["course_id"]})
            if u and c:
                recent_activity.append({
                    "id": str(e["_id"]),
                    "user_name": u.get("name", "Unknown"),
                    "user_email": u.get("email", ""),
                    "course_title": c.get("title", "Unknown"),
                    "date": e["enrolled_at"].strftime('%Y-%m-%d %H:%M') if "enrolled_at" in e else "N/A"
                })
                
        return _ok({
            "metrics": {
                "total_courses": total_courses,
                "total_students": total_students,
                "total_enrollments": total_enrollments,
                "total_revenue": total_revenue
            },
            "recent_activity": recent_activity
        })
    except Exception as e:
        return _err(f"Failed to load stats: {str(e)}", status=500)


# --------------------------------------------------------------------------- #
#  Enrollment Endpoints                                                       #
# --------------------------------------------------------------------------- #

@csrf_exempt
@require_http_methods(["POST"])
@login_required
def enroll_in_course(request, course_id):
    user_id = str(request.user["_id"])
    
    # Verify course exists before enrolling
    course = CourseCollection.get_by_id(course_id)
    if not course:
        return _err("Course not found", status=404)
        
    enrollment_id = EnrollmentCollection.enroll_user(user_id, course_id)
    return _ok({"message": "Enrolled successfully", "enrollment_id": enrollment_id})

@csrf_exempt
@require_http_methods(["GET"])
@login_required
def get_user_enrollments(request):
    user_id = str(request.user["_id"])
    enrollments = EnrollmentCollection.get_user_enrollments(user_id)
    return _ok({"enrollments": [_serialize_id(e) for e in enrollments]})


# --------------------------------------------------------------------------- #
#  Progress Endpoints                                                         #
# --------------------------------------------------------------------------- #

@csrf_exempt
@require_http_methods(["GET", "POST"])
@login_required
def course_progress(request, course_id):
    user_id = str(request.user["_id"])
    
    if request.method == "GET":
        enrollment = EnrollmentCollection.get_enrollment(user_id, course_id)
        if not enrollment:
            return _err("Enrollment not found. Please enroll first.", status=404)
        return _ok({"progress": _serialize_id(enrollment)})
        
    if request.method == "POST":
        data = _json_body(request)
        lesson_id = data.get("lesson_id")
        
        if not lesson_id:
            return _err("lesson_id is required")
        
        course = CourseCollection.get_by_id(course_id)
        if not course:
            return _err("Course not found", status=404)
            
        # Dynamically calculate total lessons to compute percentage
        total_lessons = sum(len(m.get("lessons", [])) for m in course.get("modules", []))
        
        success = EnrollmentCollection.mark_lesson_complete(user_id, course_id, lesson_id, total_lessons)
        if success:
            enrollment = EnrollmentCollection.get_enrollment(user_id, course_id)
            # Award XP for lesson completion (50 XP per lesson)
            gamification_result = {}
            try:
                from gamification.models import GamificationCollection
                gamification_result = GamificationCollection.award_xp(user_id, xp_amount=50, action="lesson")
            except Exception as e:
                print(f"Gamification award error: {e}")
            return _ok({
                "message": "Progress updated",
                "progress": _serialize_id(enrollment),
                "gamification": gamification_result,
            })
        return _err("Failed to update progress. Ensure you are enrolled.", status=500)


# --------------------------------------------------------------------------- #
#  Notes Endpoints                                                            #
# --------------------------------------------------------------------------- #

@csrf_exempt
@require_http_methods(["GET", "POST"])
@login_required
def course_notes(request, course_id):
    user_id = str(request.user["_id"])
    
    if request.method == "GET":
        lesson_id = request.GET.get("lesson_id")
        if not lesson_id:
            return _err("lesson_id query parameter is required")
        notes = NotesCollection.get_lesson_notes(user_id, lesson_id)
        return _ok({"notes": [_serialize_id(n) for n in notes]})
        
    if request.method == "POST":
        data = _json_body(request)
        lesson_id = data.get("lesson_id")
        content = data.get("content")
        timestamp = data.get("timestamp_seconds", 0)
        
        if not lesson_id or not content:
            return _err("lesson_id and content are required")
            
        note_id = NotesCollection.add_note(user_id, course_id, lesson_id, content, timestamp)
        return _ok({"message": "Note added", "note_id": note_id})
