from core.db import db
from bson import ObjectId
from datetime import datetime, timezone

class CourseCollection:
    @staticmethod
    def _col():
        return db["courses"]
        
    @classmethod
    def get_all(cls):
        return list(cls._col().find({}).sort("created_at", -1))
        
    @classmethod
    def get_by_id(cls, course_id: str):
        try:
            return cls._col().find_one({"_id": ObjectId(course_id)})
        except Exception:
            return None
            
    @classmethod
    def create(cls, data: dict):
        now = datetime.now(timezone.utc)
        course = {
            "title": data.get("title", "Untitled Course"),
            "description": data.get("description", ""),
            "instructor": data.get("instructor", "Unknown"),
            "level": data.get("level", "Beginner"),
            "duration": data.get("duration", "0 hours"),
            "thumbnail": data.get("thumbnail", ""),
            "price": data.get("price", "Free"),
            "modules": data.get("modules", []),
            "created_at": now,
            "updated_at": now
        }
        result = cls._col().insert_one(course)
        return str(result.inserted_id)
        
    @classmethod
    def update(cls, course_id: str, data: dict):
        try:
            data["updated_at"] = datetime.now(timezone.utc)
            # Remove _id from data if it exists to prevent MongoDB error
            data.pop("_id", None)
            
            cls._col().update_one(
                {"_id": ObjectId(course_id)},
                {"$set": data}
            )
            return True
        except Exception as e:
            print(f"Error updating course: {e}")
            return False
            
    @classmethod
    def delete(cls, course_id: str):
        try:
            cls._col().delete_one({"_id": ObjectId(course_id)})
            return True
        except Exception:
            return False

class EnrollmentCollection:
    @staticmethod
    def _col():
        return db["enrollments"]
        
    @classmethod
    def enroll_user(cls, user_id: str, course_id: str):
        # Prevent duplicate enrollment
        existing = cls._col().find_one({
            "user_id": ObjectId(user_id),
            "course_id": ObjectId(course_id)
        })
        if existing:
            return str(existing["_id"])
            
        doc = {
            "user_id": ObjectId(user_id),
            "course_id": ObjectId(course_id),
            "enrolled_at": datetime.now(timezone.utc),
            "progress": 0,
            "completed_lessons": [],
            "last_accessed_lesson_id": None
        }
        result = cls._col().insert_one(doc)
        return str(result.inserted_id)
        
    @classmethod
    def get_user_enrollments(cls, user_id: str):
        return list(cls._col().find({"user_id": ObjectId(user_id)}).sort("enrolled_at", -1))
        
    @classmethod
    def get_enrollment(cls, user_id: str, course_id: str):
        try:
            return cls._col().find_one({
                "user_id": ObjectId(user_id),
                "course_id": ObjectId(course_id)
            })
        except Exception:
            return None
            
    @classmethod
    def mark_lesson_complete(cls, user_id: str, course_id: str, lesson_id: str, total_lessons: int):
        try:
            uid = ObjectId(user_id)
            cid = ObjectId(course_id)
            # Find current
            enrollment = cls._col().find_one({"user_id": uid, "course_id": cid})
            if not enrollment:
                return False
                
            completed = set(enrollment.get("completed_lessons", []))
            completed.add(lesson_id)
            
            progress = int((len(completed) / total_lessons) * 100) if total_lessons > 0 else 100
            if progress > 100:
                progress = 100
                
            cls._col().update_one(
                {"_id": enrollment["_id"]},
                {"$set": {
                    "completed_lessons": list(completed),
                    "progress": progress,
                    "last_accessed_lesson_id": lesson_id
                }}
            )
            return True
        except Exception:
            return False

class NotesCollection:
    @staticmethod
    def _col():
        return db["notes"]
        
    @classmethod
    def add_note(cls, user_id: str, course_id: str, lesson_id: str, content: str, timestamp_seconds: int = 0):
        doc = {
            "user_id": ObjectId(user_id),
            "course_id": ObjectId(course_id),
            "lesson_id": lesson_id,
            "content": content,
            "timestamp_seconds": timestamp_seconds,
            "created_at": datetime.now(timezone.utc)
        }
        result = cls._col().insert_one(doc)
        return str(result.inserted_id)
        
    @classmethod
    def get_lesson_notes(cls, user_id: str, lesson_id: str):
        try:
            return list(cls._col().find({
                "user_id": ObjectId(user_id),
                "lesson_id": lesson_id
            }).sort("timestamp_seconds", 1))
        except Exception:
            return []
