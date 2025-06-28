from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User
from app.extensions import db
from app.schemas import SignupSchema, LoginSchema

auth_bp = Blueprint('auth', __name__, url_prefix="/api/auth")

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    schema = SignupSchema()
    try:
        user_data = schema.load(data)
    except Exception as e:
        print(e)
        return jsonify({"error": "Invalid input"}), 400

    if User.query.filter_by(email=user_data["email"]).first():
        return jsonify({"error": "Email already exists"}), 409

    hashed_password = generate_password_hash(user_data["password"])
    new_user = User(
        email=user_data["email"],
        password_hash=hashed_password,
        first_name=user_data["firstName"],
        last_name=user_data["lastName"],
        is_admin=False
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    schema = LoginSchema()
    try:
        credentials = schema.load(data)
    except Exception:
        return jsonify({"error": "Invalid input"}), 400

    user = User.query.filter_by(email=credentials["email"]).first()
    if not user or not check_password_hash(user.password_hash, credentials["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    # You can still return some user info if you want
    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "isAdmin": user.is_admin
        }
    }), 200
