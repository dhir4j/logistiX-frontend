import random
import string

def generate_shipment_id_str():
    """Generates a random shipment ID like RS123456."""
    return "RS" + "".join(random.choices(string.digits, k=6))
