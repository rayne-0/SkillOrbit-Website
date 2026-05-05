"""
insert_course.py
Run with:  python insert_course.py
Must be executed from the Backend/ directory.
"""

import os
import sys
import uuid
import django

# ── Bootstrap Django so core.db loads correctly ──────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from courses.models import CourseCollection

# ── Course definition ─────────────────────────────────────────────────────────
course = {
    "title": "Full-Stack Web Development with React & Node.js",
    "description": (
        "Build modern, production-ready web applications from scratch. "
        "You'll master HTML, CSS, JavaScript, React 18, Node.js, Express, "
        "MongoDB, REST APIs, authentication with JWT, and deployment to the cloud."
    ),
    "instructor": "Alex Rivera",
    "level": "Intermediate",
    "duration": "38h",
    "thumbnail": "🌐",
    "price": "$19.99",
    "modules": [
        {
            "module_id": str(uuid.uuid4()),
            "title": "Module 1: Web Foundations",
            "lessons": [
                {
                    "lesson_id": str(uuid.uuid4()),
                    "title": "How the Web Works",
                    "duration": "12:00",
                    "video_url": "https://www.youtube.com/embed/zN8YNNHcaZc",
                    "content": (
                        "# How the Web Works\n\n"
                        "Understand the request-response cycle, DNS, HTTP/HTTPS, "
                        "and how browsers render web pages."
                    ),
                },
                {
                    "lesson_id": str(uuid.uuid4()),
                    "title": "HTML5 Essentials",
                    "duration": "18:00",
                    "video_url": "https://www.youtube.com/embed/UB1O30fR-EE",
                    "content": (
                        "# HTML5 Essentials\n\n"
                        "Semantic elements, forms, accessibility, and best practices."
                    ),
                },
                {
                    "lesson_id": str(uuid.uuid4()),
                    "title": "CSS3 & Flexbox Layout",
                    "duration": "22:00",
                    "video_url": "https://www.youtube.com/embed/phWxA89Dy94",
                    "content": (
                        "# CSS3 & Flexbox\n\n"
                        "Box model, flexbox, grid, responsive design, and CSS variables."
                    ),
                },
            ],
        },
        {
            "module_id": str(uuid.uuid4()),
            "title": "Module 2: JavaScript Deep Dive",
            "lessons": [
                {
                    "lesson_id": str(uuid.uuid4()),
                    "title": "ES6+ Modern JavaScript",
                    "duration": "25:00",
                    "video_url": "https://www.youtube.com/embed/NCwa_xi0Uuc",
                    "content": (
                        "# ES6+ Modern JavaScript\n\n"
                        "Arrow functions, destructuring, spread/rest, async/await, modules."
                    ),
                },
                {
                    "lesson_id": str(uuid.uuid4()),
                    "title": "DOM Manipulation & Events",
                    "duration": "20:00",
                    "video_url": "https://www.youtube.com/embed/5fb2aPlgoys",
                    "content": (
                        "# DOM Manipulation\n\n"
                        "Selecting elements, event listeners, dynamic content, and the event loop."
                    ),
                },
            ],
        },
        {
            "module_id": str(uuid.uuid4()),
            "title": "Module 3: React 18",
            "lessons": [
                {
                    "lesson_id": str(uuid.uuid4()),
                    "title": "Components, Props & State",
                    "duration": "28:00",
                    "video_url": "https://www.youtube.com/embed/w7ejDZ8SWv8",
                    "content": (
                        "# React Components\n\n"
                        "Functional components, JSX, props, useState, and rendering lists."
                    ),
                },
                {
                    "lesson_id": str(uuid.uuid4()),
                    "title": "Hooks: useEffect & useContext",
                    "duration": "24:00",
                    "video_url": "https://www.youtube.com/embed/TNhaISOUy6Q",
                    "content": (
                        "# React Hooks\n\n"
                        "Side effects with useEffect, global state with useContext, and custom hooks."
                    ),
                },
                {
                    "lesson_id": str(uuid.uuid4()),
                    "title": "React Router & SPAs",
                    "duration": "18:00",
                    "video_url": "https://www.youtube.com/embed/Ul3y1LXxzdU",
                    "content": (
                        "# React Router v6\n\n"
                        "Routes, nested routes, protected routes, and navigation."
                    ),
                },
            ],
        },
        {
            "module_id": str(uuid.uuid4()),
            "title": "Module 4: Node.js & Express APIs",
            "lessons": [
                {
                    "lesson_id": str(uuid.uuid4()),
                    "title": "Node.js Fundamentals",
                    "duration": "20:00",
                    "video_url": "https://www.youtube.com/embed/TlB_eWDSMt4",
                    "content": (
                        "# Node.js\n\n"
                        "Event-driven architecture, modules, file system, and npm."
                    ),
                },
                {
                    "lesson_id": str(uuid.uuid4()),
                    "title": "Building a REST API with Express",
                    "duration": "30:00",
                    "video_url": "https://www.youtube.com/embed/pKd0Rpw7O48",
                    "content": (
                        "# Express REST API\n\n"
                        "Routes, middleware, error handling, and connecting to MongoDB."
                    ),
                },
            ],
        },
        {
            "module_id": str(uuid.uuid4()),
            "title": "Module 5: Authentication & Deployment",
            "lessons": [
                {
                    "lesson_id": str(uuid.uuid4()),
                    "title": "JWT Authentication",
                    "duration": "22:00",
                    "video_url": "https://www.youtube.com/embed/7Q17ubqLfaM",
                    "content": (
                        "# JWT Auth\n\n"
                        "Sign and verify tokens, refresh token rotation, and protected routes."
                    ),
                },
                {
                    "lesson_id": str(uuid.uuid4()),
                    "title": "Deploying to Render & Vercel",
                    "duration": "16:00",
                    "video_url": "https://www.youtube.com/embed/l134cBAJCuc",
                    "content": (
                        "# Deployment\n\n"
                        "Deploy your backend to Render and frontend to Vercel with environment variables."
                    ),
                },
            ],
        },
    ],
}

# ── Insert ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    course_id = CourseCollection.create(course)
    total_lessons = sum(len(m["lessons"]) for m in course["modules"])
    print(f"\n✅  Course inserted successfully!")
    print(f"   Title    : {course['title']}")
    print(f"   ID       : {course_id}")
    print(f"   Modules  : {len(course['modules'])}")
    print(f"   Lessons  : {total_lessons}")
    print(f"   Price    : {course['price']}\n")
