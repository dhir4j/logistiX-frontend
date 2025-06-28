import random
import string
from math import ceil

def generate_shipment_id_str():
    """Generates a shipment id like RS123456."""
    return "RS" + "".join(random.choices(string.digits, k=6))

def calculate_shipment_cost(weight_kg, service_type):
    """
    Calculates the shipment cost and tax breakdown.
    - Base charge: Rs. 20
    - Rate per 0.5kg: Rs. 45
    - Express fee: Rs. 50 (if applicable)
    - Tax: 18%
    """
    BASE_CHARGE = 20
    RATE_PER_HALF_KG = 45
    EXPRESS_FEE = 50

    units = ceil(weight_kg / 0.5)
    subtotal = BASE_CHARGE + (units * RATE_PER_HALF_KG)
    if service_type == "Express":
        subtotal += EXPRESS_FEE

    tax_amount = round(subtotal * 0.18, 2)
    total_with_tax = round(subtotal + tax_amount, 2)
    subtotal = round(subtotal, 2)

    return subtotal, tax_amount, total_with_tax
