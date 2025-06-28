from app import create_app
from app.models import User
from app.extensions import db
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    user = User(
        email="admin@shedloadoverseas.com",
        password_hash=generate_password_hash("Admin@12345"),
        first_name="Admin",
        last_name="User",
        is_admin=True
    )
    db.session.add(user)
    db.session.commit()
