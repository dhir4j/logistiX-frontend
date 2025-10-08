
from flask import Blueprint, request, jsonify
from app.services.pricing_service import calculate_international_price
import json
import os

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


def _load_pricing_data():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, '..', 'Data', 'pricing.json')
    try:
        with open(json_path, 'r') as f:
            return json.load(f)
    except (IOError, json.JSONDecodeError):
        return None

@international_bp.route("/reverse-price", methods=["POST"])
def reverse_price():
    data = request.get_json()
    target_amount = data.get("amount")

    if target_amount is None:
        return jsonify({"error": "Amount is required"}), 400

    try:
        target_amount = float(target_amount)
    except ValueError:
        return jsonify({"error": "Invalid amount"}), 400

    base_amount = target_amount / 1.18
    
    pricing_list = _load_pricing_data()
    if not pricing_list:
        return jsonify({"error": "Could not load pricing data"}), 500

    best_match = None
    smallest_diff = float('inf')

    for country_data in pricing_list:
        country_name = country_data.get("country")
        per_kg_rate = country_data.get("per_kg")
        price_at_11kg = country_data.get("11")

        # Check slabs up to 11kg
        for i in range(1, 12):
            weight_key = str(i)
            if weight_key in country_data:
                price = country_data[weight_key]
                diff = abs(price - base_amount)
                if diff < smallest_diff:
                    smallest_diff = diff
                    best_match = {"destination": country_name, "weight": i}

        # Check for weights above 11kg if possible
        if per_kg_rate and price_at_11kg and base_amount > price_at_11kg:
            # base_amount = price_at_11kg + (weight - 11) * per_kg_rate
            # (base_amount - price_at_11kg) / per_kg_rate = weight - 11
            # weight = ((base_amount - price_at_11kg) / per_kg_rate) + 11
            estimated_weight = ((base_amount - price_at_11kg) / per_kg_rate) + 11
            
            # Since we deal with integer weights, check floor and ceil
            for weight_candidate in [int(estimated_weight), int(estimated_weight) + 1]:
                if weight_candidate > 11:
                    extra_kgs = weight_candidate - 11
                    calculated_price = price_at_11kg + extra_kgs * per_kg_rate
                    diff = abs(calculated_price - base_amount)
                    if diff < smallest_diff:
                        smallest_diff = diff
                        best_match = {"destination": country_name, "weight": weight_candidate}

    if best_match:
        return jsonify(best_match), 200
    else:
        return jsonify({"error": "No suitable international destination found for this amount."}), 404
    
