import math
from flask import Blueprint, request, jsonify

# --- Your logic as provided ---
STATE_RATE = {
    "delhi":            {"standard": 60,    "express": 120},
    "haryana":          {"standard": 90,    "express": 130},
    "uttar pradesh":    {"standard": 110,   "express": 160},
    "rajasthan":        {"standard": 110,   "express": 160},
    "madhya pradesh":   {"standard": 130,   "express": 180},
    "maharashtra":      {"standard": 140,   "express": 220},
    "gujarat":          {"standard": 130,   "express": 200},
    "west bengal":      {"standard": 150,   "express": 230},
    "bihar":            {"standard": 140,   "express": 220},
    "jharkhand":        {"standard": 150,   "express": 230},
    "odisha":           {"standard": 160,   "express": 250},
    "chhattisgarh":     {"standard": 150,   "express": 230},
    "tamil nadu":       {"standard": 180,   "express": 270},
    "kerala":           {"standard": 190,   "express": 280},
    "andhra pradesh":   {"standard": 170,   "express": 260},
    "telangana":        {"standard": 160,   "express": 250},
    "karnataka":        {"standard": 170,   "express": 260},
    "assam":            {"standard": 200,   "express": 300},
    "north-east (others)":{"standard": 220, "express": 320},
    "jammu and kashmir": {"standard": 180,  "express": 270},
    "ladakh":           {"standard": 180,   "express": 270},
    "goa":              {"standard": 140,   "express": 220},
}

STATE_ALIAS = {
    "delhi": "delhi",
    "haryana": "haryana",
    "punjab": "haryana",
    "himachal pradesh": "haryana",
    "jammu and kashmir": "jammu and kashmir",
    "ladakh": "ladakh",
    "uttarakhand": "uttar pradesh",
    "uttar pradesh": "uttar pradesh",
    "chandigarh": "haryana",
    "bihar": "bihar",
    "jharkhand": "jharkhand",
    "west bengal": "west bengal",
    "odisha": "odisha",
    "sikkim": "north-east (others)",
    "assam": "assam",
    "meghalaya": "north-east (others)",
    "manipur": "north-east (others)",
    "mizoram": "north-east (others)",
    "tripura": "north-east (others)",
    "nagaland": "north-east (others)",
    "arunachal pradesh": "north-east (others)",
    "madhya pradesh": "madhya pradesh",
    "chhattisgarh": "chhattisgarh",
    "maharashtra": "maharashtra",
    "gujarat": "gujarat",
    "rajasthan": "rajasthan",
    "goa": "goa",
    "karnataka": "karnataka",
    "kerala": "kerala",
    "tamil nadu": "tamil nadu",
    "telangana": "telangana",
    "andhra pradesh": "andhra pradesh",
    "andaman and nicobar islands": "north-east (others)",
    "lakshadweep": "kerala",  # best fit
    "port blair": "north-east (others)",
}

def get_state_alias(state):
    state = state.strip().lower()
    if state in STATE_ALIAS:
        return STATE_ALIAS[state]
    for k in STATE_ALIAS:
        if k in state or state in k:
            return STATE_ALIAS[k]
    return "maharashtra"

def get_price(mode: str, state_name: str, weight_kg: float) -> dict:
    mode = mode.lower()
    dest_state = get_state_alias(state_name)
    rates = STATE_RATE.get(dest_state)
    if not rates or mode not in rates:
        rates = STATE_RATE["maharashtra"]
    per_kg_price = rates[mode]
    weight_int = max(1, math.ceil(weight_kg))
    total_price = per_kg_price * weight_int
    return {
        "destination_state": dest_state.title(),
        "mode": mode.title(),
        "weight_kg": weight_kg,
        "price_per_kg": f"₹{per_kg_price}",
        "rounded_weight": weight_int,
        "total_price": f"₹{total_price}"
    }

# --- Flask Blueprint ---
domestic_bp = Blueprint("domestic", __name__, url_prefix="/domestic")

@domestic_bp.route("/price", methods=["POST"])
def price_calculator():
    try:
        data = request.get_json()
        state = data.get("state")
        mode = data.get("mode")
        weight = float(data.get("weight", 1))

        if not state or not mode:
            return jsonify({"error": "state and mode required"}), 400

        result = get_price(mode, state, weight)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Example test: POST /domestic/price
# {
#     "state": "Delhi",
#     "mode": "Express",
#     "weight": 2.2
# }
