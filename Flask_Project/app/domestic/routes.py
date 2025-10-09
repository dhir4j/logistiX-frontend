
from flask import Blueprint, request, jsonify
from app.services.domestic_pricing_service import calculate_domestic_price
import json
import os
import math
import random

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

    # Define price buckets and corresponding destination-weight combinations
    price_buckets = {
        500: [
            {"destination": "Mumbai", "weight": 1},
            {"destination": "Delhi", "weight": 1.5},
            {"destination": "Pune", "weight": 1},
            {"destination": "Bangalore", "weight": 2},
            {"destination": "Chennai", "weight": 1.5},
            {"destination": "Ahmedabad", "weight": 2},
            {"destination": "Jaipur", "weight": 1.5},
            {"destination": "Lucknow", "weight": 2},
            {"destination": "Surat", "weight": 1},
            {"destination": "Nagpur", "weight": 1.5}
        ],
        1000: [
            {"destination": "Mumbai", "weight": 5},
            {"destination": "Punjab", "weight": 6},
            {"destination": "Odisha", "weight": 2},
            {"destination": "Delhi", "weight": 4},
            {"destination": "Bangalore", "weight": 5.5},
            {"destination": "Kerala", "weight": 3},
            {"destination": "Rajasthan", "weight": 4.5},
            {"destination": "Gujarat", "weight": 5},
            {"destination": "Kolkata", "weight": 3.5},
            {"destination": "Hyderabad", "weight": 4}
        ],
        2000: [
            {"destination": "Jammu & Kashmir", "weight": 8},
            {"destination": "Assam", "weight": 10},
            {"destination": "Mumbai", "weight": 12},
            {"destination": "Punjab", "weight": 15},
            {"destination": "Kerala", "weight": 9},
            {"destination": "Goa", "weight": 8},
            {"destination": "Andaman and Nicobar Islands", "weight": 7},
            {"destination": "Delhi", "weight": 13},
            {"destination": "Bangalore", "weight": 11},
            {"destination": "Kolkata", "weight": 10}
        ],
        5000: [
            {"destination": "Srinagar", "weight": 15},
            {"destination": "Port Blair", "weight": 12},
            {"destination": "Kerala", "weight": 20},
            {"destination": "Jammu & Kashmir", "weight": 18},
            {"destination": "Goa", "weight": 25},
            {"destination": "Tamil Nadu", "weight": 17},
            {"destination": "Assam", "weight": 14}
        ]
    }

    # Find the appropriate bucket
    bucket_key = None
    if target_amount <= 750:
        bucket_key = 500
    elif target_amount <= 1500:
        bucket_key = 1000
    elif target_amount <= 3500:
        bucket_key = 2000
    else: # Amount > 3500 up to 5000
        bucket_key = 5000

    # Randomly select a suggestion from the bucket
    suggestions = price_buckets.get(bucket_key)
    if suggestions:
        suggestion = random.choice(suggestions)
        return jsonify(suggestion), 200
    else:
        # Fallback if no bucket is found (should not happen with the logic above)
        return jsonify({"error": "No suitable domestic destination found for this amount."}), 404
