from flask import Blueprint, request, jsonify
from app.models import Shipment, User, PaymentRequest
from app.extensions import db
from sqlalchemy import or_, func
from datetime import datetime

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/shipments", methods=["GET"])
def get_all_shipments():
    try:
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
        pagination = query.order_by(Shipment.booking_date.desc()).paginate(
            page=page, per_page=limit, error_out=False
        )
        shipments = pagination.items
        total_pages = pagination.pages if pagination.pages else 1

        result = []
        for s in shipments:
            result.append({
                "id": s.id,
                "user_id": s.user_id,
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
        return jsonify({
            "shipments": result,
            "totalPages": total_pages,
            "currentPage": page,
            "totalCount": total_count
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "INTERNAL SERVER ERROR", "details": str(e)}), 500

@admin_bp.route("/shipments/<shipment_id_str>/status", methods=["PUT"])
def update_shipment_status(shipment_id_str):
    data = request.get_json()
    new_status = data.get("status")
    location = data.get("location")
    activity = data.get("activity")

    valid_statuses = ['Booked', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled']
    if new_status not in valid_statuses:
        return jsonify({"error": "Invalid status"}), 400

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
        "message": "Shipment status updated",
        "updatedShipment": {
            "shipment_id_str": shipment.shipment_id_str,
            "status": shipment.status,
            "tracking_history": shipment.tracking_history,
        }
    }), 200

# NEW ANALYTICS ENDPOINT
@admin_bp.route("/web_analytics", methods=["GET"])
def web_analytics():
    try:
        # Total number of shipments/orders
        total_orders = db.session.query(func.count(Shipment.id)).scalar() or 0

        # Total revenue (sum of all orders' total_with_tax_18_percent)
        total_revenue = db.session.query(
            func.coalesce(func.sum(Shipment.total_with_tax_18_percent), 0)
        ).scalar() or 0.0

        # Average revenue per order
        avg_revenue = (total_revenue / total_orders) if total_orders > 0 else 0.0

        # Total users
        total_users = db.session.query(func.count(User.id)).scalar() or 0

        return jsonify({
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "avg_revenue": float(avg_revenue),
            "total_users": total_users
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "INTERNAL SERVER ERROR", "details": str(e)}), 500

@admin_bp.route("/payments", methods=["GET"])
def get_payments():
    try:
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
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "INTERNAL SERVER ERROR", "details": str(e)}), 500


@admin_bp.route("/payments/<int:payment_id>/status", methods=["PUT"])
def update_payment_status(payment_id):
    data = request.get_json()
    new_status = data.get("status")  # "Approved" or "Rejected"

    if new_status not in ["Approved", "Rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    payment = PaymentRequest.query.get(payment_id)
    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    payment.status = new_status

    if new_status == "Approved":
        shipment = Shipment.query.get(payment.shipment_id)
        if shipment:
            shipment.status = "Booked"

    db.session.commit()

    return jsonify({"message": f"Payment {new_status.lower()} successfully"}), 200
