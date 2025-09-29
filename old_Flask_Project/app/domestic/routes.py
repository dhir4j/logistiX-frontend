
from flask import Blueprint, request, jsonify
from app.services.domestic_pricing_service import calculate_domestic_price

domestic_bp = Blueprint("domestic", __name__, url_prefix="/api/domestic")

@domestic_bp.route("/price", methods=["POST"])
def price_calculator():
    try:
        data = request.get_json()
        state = data.get("state")
        city = data.get("city")
        mode = data.get("mode")
        weight = float(data.get("weight", 1))

        if not all([state, city, mode, weight > 0]):
            return jsonify({"error": "state, city, mode, and positive weight are required"}), 400

        result = calculate_domestic_price(state, city, mode, weight)
        
        if result.get("error"):
             return jsonify(result), 404

        # The service already returns a price, so we just add tax.
        # This structure is a bit different from the service's raw output.
        # We adapt it to what the frontend might expect.
        base_price = result.get("price", 0)
        total_with_tax = round(base_price * 1.18, 2)

        return jsonify({
            "destination_state": state,
            "mode": mode.title(),
            "weight_kg": weight,
            "price_per_kg": f"Zone: {result.get('zone')}", # Simplified for display
            "rounded_weight": result.get("rounded_weight"),
            "total_price": total_with_tax
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    