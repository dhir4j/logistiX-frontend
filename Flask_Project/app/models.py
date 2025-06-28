from .extensions import db
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    shipments = db.relationship('Shipment', backref='user', lazy=True)

class Shipment(db.Model):
    __tablename__ = "shipments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user_email = db.Column(db.String(255), nullable=False, index=True)
    shipment_id_str = db.Column(db.String(20), unique=True, nullable=False, index=True)

    sender_name = db.Column(db.String(255), nullable=False)
    sender_address_street = db.Column(db.String(255), nullable=False)
    sender_address_city = db.Column(db.String(100), nullable=False)
    sender_address_state = db.Column(db.String(100), nullable=False)
    sender_address_pincode = db.Column(db.String(10), nullable=False)
    sender_address_country = db.Column(db.String(100), nullable=False)
    sender_phone = db.Column(db.String(30), nullable=False)

    receiver_name = db.Column(db.String(255), nullable=False)
    receiver_address_street = db.Column(db.String(255), nullable=False)
    receiver_address_city = db.Column(db.String(100), nullable=False)
    receiver_address_state = db.Column(db.String(100), nullable=False)
    receiver_address_pincode = db.Column(db.String(10), nullable=False)
    receiver_address_country = db.Column(db.String(100), nullable=False)
    receiver_phone = db.Column(db.String(30), nullable=False)

    package_weight_kg = db.Column(db.Numeric(10, 2), nullable=False)
    package_width_cm = db.Column(db.Numeric(10, 2), nullable=False)
    package_height_cm = db.Column(db.Numeric(10, 2), nullable=False)
    package_length_cm = db.Column(db.Numeric(10, 2), nullable=False)

    pickup_date = db.Column(db.Date, nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    booking_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(50), nullable=False, default="Pending Payment")

    price_without_tax = db.Column(db.Numeric(10, 2), nullable=False)
    tax_amount_18_percent = db.Column(db.Numeric(10, 2), nullable=False)
    total_with_tax_18_percent = db.Column(db.Numeric(10, 2), nullable=False)

    tracking_history = db.Column(JSONB, default=list)

class PaymentRequest(db.Model):
    __tablename__ = "payment_requests"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    shipment_id = db.Column(db.Integer, db.ForeignKey('shipments.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    utr = db.Column(db.String(64), nullable=False)
    status = db.Column(db.String(20), default='Pending')  # Pending, Approved, Rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
