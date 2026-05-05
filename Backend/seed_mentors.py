"""
seed_mentors.py - Run once to populate the mentors collection with sample data.
Usage: python seed_mentors.py
"""
import os, sys, django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core.db import db

if db is None:
    print("Could not connect to MongoDB. Exiting.")
    sys.exit(1)

collection = db['mentors']

mentors = [
    {
        'name': 'Dr. Alan Turing',
        'email': 'alan@skillorbit.com',
        'bio': 'Pioneer of theoretical computer science and AI. Passionate about problem solving and algorithmic thinking.',
        'expertise': ['Computer Science', 'Cryptography', 'AI', 'Algorithms'],
        'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alan',
        'schedule': 'Mon, Wed: 10AM - 2PM IST',
        'assignedStudents': []
    },
    {
        'name': 'Grace Hopper',
        'email': 'grace@skillorbit.com',
        'bio': 'Computer scientist and naval officer. Invented the first compiler. Mentor for software engineering and languages.',
        'expertise': ['Programming Languages', 'Software Engineering', 'Compilers'],
        'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace',
        'schedule': 'Tue, Thu: 2PM - 6PM IST',
        'assignedStudents': []
    },
    {
        'name': 'Linus Torvalds',
        'email': 'linus@skillorbit.com',
        'bio': 'Creator of the Linux kernel. Expert in systems programming and open source development.',
        'expertise': ['Systems Programming', 'Linux', 'Open Source', 'C/C++'],
        'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linus',
        'schedule': 'Mon, Fri: 4PM - 8PM IST',
        'assignedStudents': []
    }
]

# Clear existing and re-insert
collection.delete_many({})
result = collection.insert_many(mentors)
print(f"Inserted {len(result.inserted_ids)} mentors successfully.")
