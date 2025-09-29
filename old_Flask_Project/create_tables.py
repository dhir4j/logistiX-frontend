
import os
import sys

# This is important to ensure the app can be found by the script
project_home = os.path.dirname(os.path.abspath(__file__))
if project_home not in sys.path:
    sys.path.insert(0, project_home)

from app import create_app, db

# Create an app instance. The environment doesn't matter here
# as we just need the application context and db configuration.
app = create_app()

with app.app_context():
    print("Creating database tables...")
    try:
        db.create_all()
        print("Tables created successfully!")
        print("You should now see 'users', 'shipments', and 'payment_requests' tables in your database.")
    except Exception as e:
        print(f"An error occurred while creating tables: {e}")
