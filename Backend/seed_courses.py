import os
import sys

# Add backend directory to path
sys.path.append(r"c:\Users\saxen\Desktop\SkillOrbit Website\Backend")

from courses.models import CourseCollection
import uuid

def main():
    print("Clearing existing courses...")
    CourseCollection._col().delete_many({})
    
    courses = [
        {
            "title": "The Complete Python Bootcamp: Zero to Expert",
            "description": "Learn Python like a Professional Start from the basics and go all the way to creating your own applications and games.",
            "instructor": "Dr. Sarah Chen",
            "level": "Beginner",
            "duration": "42h",
            "thumbnail": "💻",
            "price": "$14.99",
            "modules": [
                {
                    "module_id": str(uuid.uuid4()),
                    "title": "Module 1: Introduction to Python",
                    "lessons": [
                        {
                            "lesson_id": str(uuid.uuid4()),
                            "title": "What is Python?",
                            "duration": "10:00",
                            "video_url": "https://www.youtube.com/embed/kqtD5dpn9C8",
                            "content": "# Intro to Python\nLearn why Python is amazing."
                        },
                        {
                            "lesson_id": str(uuid.uuid4()),
                            "title": "Installing Python on Windows",
                            "duration": "15:00",
                            "video_url": "https://www.youtube.com/embed/kqtD5dpn9C8",
                            "content": "# Local Environment setup\nInstalling python and VS code."
                        }
                    ]
                },
                {
                    "module_id": str(uuid.uuid4()),
                    "title": "Module 2: Data Types",
                    "lessons": [
                        {
                            "lesson_id": str(uuid.uuid4()),
                            "title": "Strings and Integers",
                            "duration": "20:00",
                            "video_url": "https://www.youtube.com/embed/kqtD5dpn9C8",
                            "content": "# Data types\nHow numbers and text work in memory."
                        }
                    ]
                }
            ]
        },
        {
            "title": "Machine Learning A-Z: AI, Python & R in Data Science",
            "description": "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts.",
            "instructor": "Prof. James Liu",
            "level": "Intermediate",
            "duration": "55h",
            "thumbnail": "🤖",
            "price": "$18.99",
            "modules": [
                {
                    "module_id": str(uuid.uuid4()),
                    "title": "Module 1: Data Preprocessing",
                    "lessons": [
                        {
                            "lesson_id": str(uuid.uuid4()),
                            "title": "Handling Missing Data",
                            "duration": "12:00",
                            "video_url": "https://www.youtube.com/embed/kqtD5dpn9C8",
                            "content": "Using SimpleImputer in scikit-learn."
                        }
                    ]
                }
            ]
        }
    ]
    
    for c in courses:
        cid = CourseCollection.create(c)
        print(f"Created course: {c['title']} (ID: {cid})")
        
if __name__ == "__main__":
    main()
