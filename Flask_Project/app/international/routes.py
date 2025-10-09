
from flask import Blueprint, request, jsonify
from app.services.pricing_service import calculate_international_price
import json
import os
import random

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

    # Define price buckets for international shipments
    price_buckets = {
        7500: [
            {"destination": "USA", "weight": 5},
            {"destination": "Canada", "weight": 6},
            {"destination": "UK", "weight": 7},
            {"destination": "Australia", "weight": 4},
            {"destination": "Germany", "weight": 8},
            {"destination": "UAE", "weight": 10},
        ],
        15000: [
            {"destination": "USA", "weight": 12},
            {"destination": "Canada", "weight": 14},
            {"destination": "UK", "weight": 15},
            {"destination": "Australia", "weight": 10},
            {"destination": "New Zealand", "weight": 9},
            {"destination": "France", "weight": 16},
        ],
        25000: [
            {"destination": "USA", "weight": 20},
            {"destination": "Canada", "weight": 22},
            {"destination": "UK", "weight": 25},
            {"destination": "Australia", "weight": 18},
            {"destination": "South Africa", "weight": 15},
            {"destination": "Brazil", "weight": 12},
        ]
    }

    # Find the appropriate bucket for international pricing
    bucket_key = None
    if target_amount <= 10000:
        bucket_key = 7500
    elif target_amount <= 20000:
        bucket_key = 15000
    else: # Amount > 20000
        bucket_key = 25000

    suggestions = price_buckets.get(bucket_key)
    if suggestions:
        suggestion = random.choice(suggestions)
        return jsonify(suggestion), 200
    else:
        # Fallback if no bucket is found
        return jsonify({"error": "No suitable international destination found for this amount."}), 404
