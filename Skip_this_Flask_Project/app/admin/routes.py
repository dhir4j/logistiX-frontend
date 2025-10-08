
from flask import Blueprint, request, jsonify
from app.models import Shipment, User, PaymentRequest
from app.extensions import db
from sqlalchemy import or_, func
from datetime import datetime

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/shipments", methods=["GET"])
def get_all_shipments():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    status = request.args.get("status")
    q = request.args.get("q")
    query = Shipment.query

    if status:
        query = query.filter_by(status=status)
    if q:
        like_q = f"%{q}%"
        query = query.filter(
            or_(
                Shipment.shipment_id_str.ilike(like_q),
                Shipment.sender_name.ilike(like_q),
                Shipment.receiver_name.ilike(like_q)
            )
        )
    
    total_count = query.count()
    pagination = query.order_by(Shipment.booking_date.desc()).paginate(page=page, per_page=limit, error_out=False)
    shipments = pagination.items

    result = []
    for s in shipments:
        result.append({
            "id": s.id,
            "shipment_id_str": s.shipment_id_str,
            "sender_name": s.sender_name,
            "receiver_name": s.receiver_name,
            "receiver_address_city": s.receiver_address_city,
            "service_type": s.service_type,
            "package_weight_kg": float(s.package_weight_kg),
            "booking_date": s.booking_date.isoformat(),
            "status": s.status,
            "price_without_tax": float(s.price_without_tax),
            "tax_amount_18_percent": float(s.tax_amount_18_percent),
            "total_with_tax_18_percent": float(s.total_with_tax_18_percent),
        })
    return jsonify({
        "shipments": result,
        "totalPages": pagination.pages or 1,
        "currentPage": page,
        "totalCount": total_count
    }), 200

@admin_bp.route("/shipments/<shipment_id_str>/status", methods=["PUT"])
def update_shipment_status(shipment_id_str):
    data = request.get_json()
    new_status = data.get("status")
    location = data.get("location")
    activity = data.get("activity")

    valid_statuses = ['Booked', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled']
    if not new_status or new_status not in valid_statuses:
        return jsonify({"error": "Invalid or missing status"}), 400

    shipment = Shipment.query.filter_by(shipment_id_str=shipment_id_str).first()
    if not shipment:
        return jsonify({"error": "Shipment not found"}), 404

    shipment.status = new_status
    entry = {
        "stage": new_status,
        "date": datetime.utcnow().isoformat(),
        "location": location or "",
        "activity": activity or f"Status updated to {new_status}",
    }
    history = shipment.tracking_history or []
    history.append(entry)
    shipment.tracking_history = history
    db.session.commit()

    return jsonify({
        "message": "Shipment status updated successfully",
        "updatedShipment": {
            "shipment_id_str": shipment.shipment_id_str,
            "status": shipment.status,
            "tracking_history": shipment.tracking_history,
        }
    }), 200

@admin_bp.route("/web_analytics", methods=["GET"])
def web_analytics():
    total_orders = db.session.query(func.count(Shipment.id)).scalar() or 0
    total_revenue = db.session.query(func.coalesce(func.sum(Shipment.total_with_tax_18_percent), 0)).scalar() or 0.0
    total_users = db.session.query(func.count(User.id)).filter(User.is_admin == False).scalar() or 0
    avg_revenue = (total_revenue / total_orders) if total_orders > 0 else 0.0

    return jsonify({
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "avg_revenue": float(avg_revenue),
        "total_users": total_users
    }), 200

@admin_bp.route("/payments", methods=["GET"])
def get_payments():
    payments_query = db.session.query(
        PaymentRequest,
        User.first_name,
        User.last_name,
        Shipment.shipment_id_str
    ).join(
        User, PaymentRequest.user_id == User.id
    ).join(
        Shipment, PaymentRequest.shipment_id == Shipment.id
    ).order_by(PaymentRequest.created_at.desc()).all()

    result = []
    for payment, first_name, last_name, shipment_id_str in payments_query:
        result.append({
            "id": payment.id,
            "order_id": shipment_id_str,
            "first_name": first_name,
            "last_name": last_name,
            "amount": float(payment.amount),
            "utr": payment.utr,
            "status": payment.status,
            "created_at": payment.created_at.isoformat()
        })
    return jsonify(result), 200

@admin_bp.route("/payments/<int:payment_id>/status", methods=["PUT"])
def update_payment_status(payment_id):
    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["Approved", "Rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    payment = PaymentRequest.query.get(payment_id)
    if not payment:
        return jsonify({"error": "Payment not found"}), 404
    
    if payment.status != 'Pending':
        return jsonify({"error": "Payment has already been processed"}), 400

    payment.status = new_status

    if new_status == "Approved":
        shipment = Shipment.query.get(payment.shipment_id)
        if shipment:
            shipment.status = "Booked"
            now_iso = datetime.utcnow().isoformat()
            history = shipment.tracking_history or []
            found = False
            for entry in history:
                if entry.get("stage") == "Pending Payment":
                    entry["stage"] = "Booked"
                    entry["date"] = now_iso
                    entry["activity"] = "Shipment booked and payment confirmed."
                    found = True
                    break
            if not found:
                 history.insert(0, {
                    "stage": "Booked",
                    "date": now_iso,
                    "location": shipment.sender_address_city,
                    "activity": "Shipment booked and payment confirmed."
                 })
            shipment.tracking_history = history

    db.session.commit()
    return jsonify({"message": f"Payment {new_status.lower()} successfully"}), 200

@admin_bp.route("/users", methods=["GET"])
def get_all_users():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    q = request.args.get("q")
    query = User.query.filter(User.is_admin == False)

    if q:
        like_q = f"%{q}%"
        query = query.filter(
            or_(
                User.first_name.ilike(like_q),
                User.last_name.ilike(like_q),
                User.email.ilike(like_q)
            )
        )
    
    total_count = query.count()
    pagination = query.order_by(User.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
    users = pagination.items

    result = []
    for user in users:
        result.append({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "created_at": user.created_at.isoformat(),
            "shipment_count": len(user.shipments)
        })

    return jsonify({
        "users": result,
        "totalPages": pagination.pages or 1,
        "currentPage": page,
        "totalCount": total_count
    }), 200

@admin_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user_details(user_id):
    user = User.query.get_or_404(user_id)
    if user.is_admin:
        return jsonify({"error": "Cannot access admin user details"}), 403

    shipments_query = Shipment.query.filter_by(user_id=user.id).order_by(Shipment.booking_date.desc()).all()
    shipments_result = []
    for s in shipments_query:
        shipments_result.append({
            "id": s.id,
            "shipment_id_str": s.shipment_id_str,
            "receiver_name": s.receiver_name,
            "booking_date": s.booking_date.isoformat(),
            "status": s.status,
            "total_with_tax_18_percent": float(s.total_with_tax_18_percent),
        })

    payments_query = PaymentRequest.query.filter_by(user_id=user.id).order_by(PaymentRequest.created_at.desc()).all()
    payments_result = []
    for p in payments_query:
        shipment_for_payment = Shipment.query.get(p.shipment_id)
        shipment_id_str_for_payment = shipment_for_payment.shipment_id_str if shipment_for_payment else "N/A"
        payments_result.append({
            "id": p.id,
            "shipment_id_str": shipment_id_str_for_payment,
            "amount": float(p.amount),
            "utr": p.utr,
            "status": p.status,
            "created_at": p.created_at.isoformat()
        })

    return jsonify({
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "created_at": user.created_at.isoformat()
        },
        "shipments": shipments_result,
        "payments": payments_result
    }), 200
