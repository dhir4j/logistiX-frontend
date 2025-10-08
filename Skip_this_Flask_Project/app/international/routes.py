
from flask import Blueprint, request, jsonify
from app.services.pricing_service import calculate_international_price

international_bp = Blueprint("international", __name__, url_prefix="/api/international")

@international_bp.route("/price", methods=["POST"])
def intl_price():
    try:
        data = request.get_json()
        country = data.get("country", "").strip().lower()
        weight = float(data.get("weight", 0.5))

        if not country or weight <= 0:
            return jsonify({"error": "country and positive weight required"}), 400

        result = calculate_international_price(country, weight)
        
        if result.get("error"):
            return jsonify(result), 404
        
        base_price = result.get("base_price", 0)
        total_with_tax = round(base_price * 1.18, 2)
        
        return jsonify({
            "country": result.get("country_name", country.title()),
            "zone": result.get("zone", "N/A"),
            "mode": "Express",
            "weight_kg": weight,
            "rounded_weight": result.get("rounded_weight"),
            "price_per_kg": f"Rate: {result.get('per_kg_rate', 'N/A')}",
            "total_price": total_with_tax,
            "formatted_total": f"Rs. {total_with_tax}"
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    