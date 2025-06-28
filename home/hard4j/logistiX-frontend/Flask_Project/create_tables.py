
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
    print("Attempting to connect to the database and create tables...")
    # Hide password from the print statement for security
    safe_uri = str(app.config['SQLALCHEMY_DATABASE_URI'])
    try:
        password = app.config['db_password']
        if password:
            safe_uri = safe_uri.replace(password, '****')
    except Exception:
        pass # It's okay if it fails, just a safety measure
    print(f"Database URI: {safe_uri}")
    
    try:
        print("Creating all tables based on models: User, Shipment, PaymentRequest")
        db.create_all()
        print("\n✅ Success! Tables created successfully!")
        print("You should now see 'users', 'shipments', and 'payment_requests' tables in your database.")
        print("Your application should now run without the 'relation does not exist' error.")
    except Exception as e:
        print(f"\n❌ An error occurred while creating tables.")
        print(f"Error details: {e}")
        print("\nPlease check the following:")
        print("1. Are the database credentials in Flask_Project/config.py correct?")
        print("2. Is the database server running and accessible from where you are running this script?")
        print("3. Does the database user have permission to CREATE tables in the target database?")

