
from flask import Blueprint, request, jsonify
from app.services.domestic_pricing_service import calculate_domestic_price
import json
import os
import math

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

def _load_json_data(filename):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, '..', 'Data', filename)
    try:
        with open(json_path, 'r') as f:
            return json.load(f)
    except (IOError, json.JSONDecodeError):
        return None

@domestic_bp.route("/reverse-price", methods=["POST"])
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
    
    DOMESTIC_PRICES = _load_json_data('dom_prices.json')
    DOMESTIC_ZONES = _load_json_data('domestic.json')

    if not DOMESTIC_PRICES or not DOMESTIC_ZONES:
        return jsonify({"error": "Could not load pricing data"}), 500

    best_match = None
    smallest_diff = float('inf')

    for zone, rules in DOMESTIC_PRICES.items():
        locations = DOMESTIC_ZONES.get(zone, [])
        if not locations:
            continue
        
        destination_name = locations[0] # Pick first as representative

        for mode, pricing_table in rules.items():
            if mode == "express":
                for band, price in pricing_table.items():
                    diff = abs(price - base_amount)
                    if diff < smallest_diff:
                        smallest_diff = diff
                        best_match = {"destination": destination_name, "weight": int(band)}
            
            elif mode in ["air", "surface"]:
                for band, rate_per_kg in pricing_table.items():
                    if rate_per_kg > 0:
                        estimated_weight = base_amount / rate_per_kg
                        
                        # Normalize weight based on mode for accurate check
                        if mode == "air" and estimated_weight < 3:
                            continue # Price won't match if normalized later
                        if mode == "surface" and estimated_weight < 5:
                            continue

                        # Check if this weight falls into the current band
                        weight_in_band = False
                        if band == "<5" and estimated_weight < 5: weight_in_band = True
                        elif band == "<10" and 5 <= estimated_weight < 10: weight_in_band = True
                        elif band == "<25" and 10 <= estimated_weight < 25: weight_in_band = True
                        elif band == "<50" and 25 <= estimated_weight < 50: weight_in_band = True
                        elif band == ">50" and estimated_weight >= 50: weight_in_band = True
                        
                        if weight_in_band:
                             # We found a direct match, smallest diff is 0
                             smallest_diff = 0
                             best_match = {"destination": destination_name, "weight": round(estimated_weight, 2)}
                             # Break loops to return this perfect match
                             break
                if smallest_diff == 0: break
        if smallest_diff == 0: break

    if best_match:
        return jsonify(best_match), 200
    else:
        return jsonify({"error": "No suitable domestic destination found for this amount."}), 404

    
