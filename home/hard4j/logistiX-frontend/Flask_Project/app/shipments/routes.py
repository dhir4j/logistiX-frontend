
from flask import Blueprint, request, jsonify
from app.models import Shipment, User, PaymentRequest
from app.extensions import db
from app.schemas import ShipmentCreateSchema, PaymentSubmitSchema
from app.utils import generate_shipment_id_str
from datetime import datetime

shipments_bp = Blueprint("shipments", __name__, url_prefix="/api")

@shipments_bp.route("/shipments", methods=["POST"])
def create_shipment():
    schema = ShipmentCreateSchema()
    data = request.get_json()

    final_total_price = data.pop("final_total_price_with_tax", None)

    try:
        shipment_data = schema.load(data)
    except Exception as e:
        return jsonify({"error": "Invalid shipment details", "details": e.messages}), 400

    user = User.query.filter_by(email=shipment_data["user_email"]).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    if final_total_price is None or not isinstance(final_total_price, (int, float)) or final_total_price <= 0:
        return jsonify({"error": "Valid final_total_price_with_tax is required"}), 400
    
    price_without_tax = round(final_total_price / 1.18, 2)
    tax_amount = round(final_total_price - price_without_tax, 2)

    now_iso = datetime.utcnow().isoformat()
    tracking_history = [{
        "stage": "Pending Payment",
        "date": now_iso,
        "location": shipment_data["sender_address_city"],
        "activity": "Shipment created. Awaiting payment confirmation."
    }]

    new_shipment = Shipment(
        user_id=user.id,
        shipment_id_str=generate_shipment_id_str(),
        status="Pending Payment",
        tracking_history=tracking_history,
        price_without_tax=price_without_tax,
        tax_amount_18_percent=tax_amount,
        total_with_tax_18_percent=final_total_price,
        **shipment_data
    )
    db.session.add(new_shipment)
    db.session.commit()
    
    shipment_data['pickup_date'] = shipment_data['pickup_date'].isoformat()

    return jsonify({
        "shipment_id_str": new_shipment.shipment_id_str,
        "message": "Shipment initiated successfully. Please complete payment.",
        "data": {
            **shipment_data,
            "id": new_shipment.id,
            "price_without_tax": float(new_shipment.price_without_tax),
            "tax_amount_18_percent": float(new_shipment.tax_amount_18_percent),
            "total_with_tax_18_percent": float(new_shipment.total_with_tax_18_percent),
            "status": new_shipment.status,
            "tracking_history": new_shipment.tracking_history
        }
    }), 201

@shipments_bp.route("/payments", methods=["POST"])
def submit_payment():
    schema = PaymentSubmitSchema()
    data = request.get_json()

    try:
        payment_data = schema.load(data)
    except Exception as e:
        return jsonify({"error": "Invalid payment details", "details": e.messages}), 400
    
    shipment = Shipment.query.filter_by(shipment_id_str=payment_data['shipment_id_str']).first()
    if not shipment:
        return jsonify({"error": "Shipment not found"}), 404
    
    if shipment.status != "Pending Payment":
        return jsonify({"error": "Payment has already been processed for this shipment"}), 400

    existing_payment = PaymentRequest.query.filter_by(utr=payment_data['utr'], shipment_id=shipment.id).first()
    if existing_payment:
        return jsonify({"error": "This UTR has already been submitted for this shipment"}), 409

    new_payment_request = PaymentRequest(
        user_id=shipment.user_id,
        shipment_id=shipment.id,
        amount=payment_data['amount'],
        utr=payment_data['utr'],
        status='Pending'
    )
    db.session.add(new_payment_request)
    db.session.commit()

    return jsonify({
        "message": "Payment submitted for review successfully.",
        "payment_id": new_payment_request.id,
        "status": new_payment_request.status
    }), 201

@shipments_bp.route("/shipments", methods=["GET"])
def get_user_shipments():
    user_email = request.args.get("email")
    if not user_email:
        return jsonify({"error": "Missing email parameter"}), 400

    shipments = Shipment.query.filter_by(user_email=user_email).order_by(Shipment.booking_date.desc()).all()

    result = []
    for s in shipments:
        result.append({
            "id": s.id,
            "shipment_id_str": s.shipment_id_str,
            "sender_name": s.sender_name,
            "receiver_name": s.receiver_name,
            "service_type": s.service_type,
            "booking_date": s.booking_date.isoformat(),
            "status": s.status,
            "total_with_tax_18_percent": float(s.total_with_tax_18_percent),
        })
    return jsonify(result), 200

@shipments_bp.route("/shipments/<shipment_id_str>", methods=["GET"])
def get_shipment_detail(shipment_id_str):
    shipment = Shipment.query.filter_by(shipment_id_str=shipment_id_str).first()
    if not shipment:
        return jsonify({"error": "Shipment not found"}), 404

    return jsonify({
        "id": shipment.id,
        "shipment_id_str": shipment.shipment_id_str,
        "sender_name": shipment.sender_name,
        "sender_address_street": shipment.sender_address_street,
        "sender_address_city": shipment.sender_address_city,
        "sender_address_state": shipment.sender_address_state,
        "sender_address_pincode": shipment.sender_address_pincode,
        "sender_address_country": shipment.sender_address_country,
        "sender_phone": shipment.sender_phone,
        "receiver_name": shipment.receiver_name,
        "receiver_address_street": shipment.receiver_address_street,
        "receiver_address_city": shipment.receiver_address_city,
        "receiver_address_state": shipment.receiver_address_state,
        "receiver_address_pincode": shipment.receiver_address_pincode,
        "receiver_address_country": shipment.receiver_address_country,
        "receiver_phone": shipment.receiver_phone,
        "package_weight_kg": float(shipment.package_weight_kg),
        "booking_date": shipment.booking_date.isoformat(),
        "status": shipment.status,
        "price_without_tax": float(shipment.price_without_tax),
        "tax_amount_18_percent": float(shipment.tax_amount_18_percent),
        "total_with_tax_18_percent": float(shipment.total_with_tax_18_percent),
        "tracking_history": shipment.tracking_history,
    }), 200

@shipments_bp.route("/user/payments", methods=["GET"])
def get_user_payments():
    user_email = request.args.get("email")
    if not user_email:
        return jsonify({"error": "Missing email parameter"}), 400

    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    payments = db.session.query(
        PaymentRequest,
        Shipment.shipment_id_str
    ).join(
        Shipment, PaymentRequest.shipment_id == Shipment.id
    ).filter(
        PaymentRequest.user_id == user.id
    ).order_by(PaymentRequest.created_at.desc()).all()

    result = []
    for payment, shipment_id_str in payments:
        result.append({
            "id": payment.id,
            "shipment_id_str": shipment_id_str,
            "amount": float(payment.amount),
            "utr": payment.utr,
            "status": payment.status,
            "created_at": payment.created_at.isoformat()
        })
    return jsonify(result), 200
