
import json
import math
import os

def calculate_international_price(target_country: str, weight_in_kg: float):
    """
    Calculates the international shipping price based on the destination country and weight.

    Args:
        target_country: The destination country name.
        weight_in_kg: The weight of the parcel in kilograms.

    Returns:
        A dictionary with pricing details or an error message.
    """
    # Construct the full path to the JSON file
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, '..', 'Data', 'pricing.json')

    try:
        with open(json_path, 'r') as f:
            pricing_list = json.load(f)
    except (IOError, json.JSONDecodeError):
        return {"error": "Could not load pricing data."}

    country_data = None
    for item in pricing_list:
        if item.get("country", "").lower() == target_country.lower():
            country_data = item
            break
    
    if not country_data:
        return {"error": f"We do not offer services to {target_country.title()} at the moment."}

    # Prepare weight
    if weight_in_kg <= 0:
        return {"error": "Weight must be a positive number."}
    integer_weight = math.ceil(weight_in_kg)

    base_price = 0.0
    
    # Calculate price based on weight
    if 1 <= integer_weight <= 11:
        weight_key = str(integer_weight)
        if weight_key in country_data:
            base_price = country_data[weight_key]
        else:
            return {"error": f"Pricing not available for {integer_weight}kg to {target_country.title()}."}
    elif integer_weight > 11:
        price_at_11kg = country_data.get("11")
        rate_per_extra_kg = country_data.get("per_kg")

        if price_at_11kg is None or rate_per_extra_kg is None:
            return {"error": f"Extended pricing not available for {target_country.title()}."}
            
        extra_kgs = integer_weight - 11
        extra_cost = extra_kgs * rate_per_extra_kg
        base_price = price_at_11kg + extra_cost
    else: # This covers weights between 0 and 1 (e.g., 0.5kg)
        base_price = country_data.get("1", 0)


    return {
        "country_name": country_data["country"],
        "zone": "N/A", # Zone info is not in the new JSON structure
        "base_price": base_price,
        "rounded_weight": integer_weight,
        "per_kg_rate": country_data.get("per_kg", 0)
    }
