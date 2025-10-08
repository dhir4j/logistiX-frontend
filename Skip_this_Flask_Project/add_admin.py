
import os
import sys
from werkzeug.security import generate_password_hash

# This is important to ensure the app can be found by the script
project_home = os.path.dirname(os.path.abspath(__file__))
if project_home not in sys.path:
    sys.path.insert(0, project_home)

from app import create_app, db
from app.models import User

# Create an app instance to work with the database.
app = create_app()

with app.app_context():
    print("Attempting to add or update admin user...")
    admin_email = "admin@shedloadoverseas.com"
    admin_password = "Admin@12345"
    
    # Check if the admin user already exists
    existing_admin = User.query.filter_by(email=admin_email).first()
    
    if existing_admin:
        print(f"Admin user with email '{admin_email}' already exists.")
        print("Updating password and ensuring admin status is set correctly.")
        existing_admin.password = generate_password_hash(admin_password)
        existing_admin.is_admin = True
        if not existing_admin.first_name:
            existing_admin.first_name = "Admin"
        if not existing_admin.last_name:
            existing_admin.last_name = "User"
        print("Admin user updated successfully!")
    else:
        print(f"Creating new admin user with email '{admin_email}'...")
        new_admin = User(
            email=admin_email,
            password=generate_password_hash(admin_password),
            first_name="Admin",
            last_name="User",
            is_admin=True
        )
        db.session.add(new_admin)
        print("New admin user created successfully!")

    try:
        db.session.commit()
        print("Database changes committed.")
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred during database commit: {e}")

