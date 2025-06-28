from flask import Blueprint, request, jsonify
from app.models import Shipment, User
from app.extensions import db
from app.schemas import ShipmentCreateSchema
from app.utils import generate_shipment_id_str, calculate_shipment_cost
from datetime import datetime

shipments_bp = Blueprint("shipments", __name__, url_prefix="/api/shipments")

@shipments_bp.route("", methods=["POST"])
def create_shipment():
    schema = ShipmentCreateSchema()
    data = request.get_json() or {}

    final_total_price_with_tax = data.pop("final_total_price_with_tax", None)
    user_email = data.get("user_email")  # ✅ Capture email from frontend

    if not user_email:
        return jsonify({"error": "Missing user_email"}), 400

    try:
        shipment_data = schema.load(data)
    except Exception as e:
        return jsonify({"error": "Invalid shipment details", "details": str(e), "input": data}), 400

    # PRICE CALCULATION (same as before)
    if final_total_price_with_tax is not None:
        try:
            total = float(final_total_price_with_tax)
            if total <= 0:
                raise ValueError
            price = round(total / 1.18, 2)
            tax = round(total - price, 2)
        except Exception:
            return jsonify({"error": "Invalid value for final_total_price_with_tax"}), 400
    else:
        price, tax, total = calculate_shipment_cost(
            shipment_data["package_weight_kg"], shipment_data["service_type"]
        )

    now_iso = datetime.utcnow().isoformat()
    tracking_history = [{
        "stage": "Booked",
        "date": now_iso,
        "location": shipment_data.get("sender_address_city") or shipment_data.get("sender_address_street", ""),
        "activity": "Shipment booked and confirmed"
    }]

    new_shipment = Shipment(
        user_id=data.get("user_id", 1),
        # user_email=user_email,  # ✅ Save user's email
        shipment_id_str=generate_shipment_id_str(),
        **shipment_data,
        price_without_tax=price,
        tax_amount_18_percent=tax,
        total_with_tax_18_percent=total,
        status="Booked",
        tracking_history=tracking_history
    )
    db.session.add(new_shipment)
    db.session.commit()

    return jsonify({
        "shipment_id_str": new_shipment.shipment_id_str,
        "message": "Shipment booked successfully",
        "data": {
            **shipment_data,
            "user_email": user_email,
            "price_without_tax": price,
            "tax_amount_18_percent": tax,
            "total_with_tax_18_percent": total,
            "status": "Booked",
            "tracking_history": tracking_history
        }
    }), 201




@shipments_bp.route("", methods=["GET"])
def get_user_shipments():
    user_email = request.args.get("email")
    if not user_email:
        return jsonify({"error": "Missing email parameter"}), 400

    shipments = Shipment.query.filter_by(user_email=user_email).order_by(Shipment.booking_date.desc()).all()

    result = []
    for s in shipments:
        result.append({
            "id": s.id,
            "user_id": s.user_id,
            "user_email": s.user_email,
            "shipment_id_str": s.shipment_id_str,
            "sender_name": s.sender_name,
            "sender_address_city": getattr(s, "sender_address_city", None),
            "receiver_name": s.receiver_name,
            "receiver_address_city": getattr(s, "receiver_address_city", None),
            "package_weight_kg": float(getattr(s, "package_weight_kg", 0)),
            "service_type": s.service_type,
            "booking_date": s.booking_date.isoformat() if s.booking_date else None,
            "status": s.status,
            "price_without_tax": float(getattr(s, "price_without_tax", 0)),
            "tax_amount_18_percent": float(getattr(s, "tax_amount_18_percent", 0)),
            "total_with_tax_18_percent": float(getattr(s, "total_with_tax_18_percent", 0)),
        })
    return jsonify(result), 200


@shipments_bp.route("/<shipment_id_str>", methods=["GET"])
def get_shipment_detail(shipment_id_str):
    shipment = Shipment.query.filter_by(shipment_id_str=shipment_id_str).first()
    if not shipment:
        return jsonify({"error": "Shipment not found"}), 404

    return jsonify({
        "id": shipment.id,
        "user_id": shipment.user_id,
        "shipment_id_str": shipment.shipment_id_str,
        "sender_name": shipment.sender_name,
        "sender_address_city": getattr(shipment, "sender_address_city", None),
        "receiver_name": shipment.receiver_name,
        "receiver_address_city": getattr(shipment, "receiver_address_city", None),
        "package_weight_kg": float(getattr(shipment, "package_weight_kg", 0)),
        "service_type": shipment.service_type,
        "booking_date": shipment.booking_date.isoformat() if shipment.booking_date else None,
        "status": shipment.status,
        "price_without_tax": float(getattr(shipment, "price_without_tax", 0)),
        "tax_amount_18_percent": float(getattr(shipment, "tax_amount_18_percent", 0)),
        "total_with_tax_18_percent": float(getattr(shipment, "total_with_tax_18_percent", 0)),
        "tracking_history": shipment.tracking_history,
    }), 200
