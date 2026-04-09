import os
import sys

# Add backend directory to path so we can import modules properly
sys.path.append(r"c:\Users\saxen\Desktop\SkillOrbit Website\Backend")

from accounts.models import UserCollection

def main():
    users = UserCollection._col().find()
    updated_count = 0
    for user in users:
        print(f"Promoting {user.get('email')} to admin.")
        UserCollection.make_admin(user.get('email'))
        updated_count += 1
    
    print(f"Successfully promoted {updated_count} user(s) to admin.")

if __name__ == "__main__":
    main()
