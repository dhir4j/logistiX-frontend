
import math
from flask import Blueprint, request, jsonify

COUNTRY_TO_ZONE = {
    'afghanistan': '11', 'albania': '11', 'algeria': '11', 'american samoa': '9', 'andorra': '8',
    'angola': '11', 'anguilla': '10', 'antigua': '10', 'argentina': '10', 'armenia': '11', 'aruba': '10',
    'australia': '14', 'austria': '7', 'azerbaijan': '11', 'bahamas': '10', 'bahrain': '11',
    'bangladesh': '6', 'barbados': '10', 'belarus': '7', 'belgium': '7', 'belize': '10', 'benin': '11',
    'bermuda': '10', 'bhutan': '6', 'bolivia': '10', 'bosnia and herzegovina': '11', 'botswana': '11',
    'brazil': '10', 'brunei': '6', 'bulgaria': '11', 'burkina faso': '11', 'burundi': '11', 'cambodia': '6',
    'cameroon': '11', 'canada': '4', 'cape verde': '11', 'cayman islands': '10', 'central african republic': '11',
    'chad': '11', 'chile': '10', 'china': '6', 'colombia': '10', 'comoros': '11', 'congo': '11', 'cook islands': '9',
    'costa rica': '10', 'croatia': '11', 'cuba': '10', 'cyprus': '11', 'czech republic': '7', 'denmark': '7',
    'djibouti': '11', 'dominica': '10', 'dominican republic': '10', 'ecuador': '10', 'egypt': '11',
    'el salvador': '10', 'equatorial guinea': '11', 'eritrea': '11', 'estonia': '7', 'eswatini': '11',
    'ethiopia': '11', 'fiji': '14', 'finland': '7', 'france': '7', 'french guiana': '10', 'gabon': '11',
    'gambia': '11', 'georgia': '11', 'germany': '3', 'ghana': '11', 'gibraltar': '11', 'greece': '11',
    'greenland': '10', 'grenada': '10', 'guadeloupe': '10', 'guam': '9', 'guatemala': '10', 'guinea': '11',
    'guyana': '10', 'haiti': '10', 'honduras': '10', 'hong kong': '6', 'hungary': '7', 'iceland': '8',
    'india': '6', 'indonesia': '6', 'iran': '11', 'iraq': '11', 'ireland': '2', 'israel': '11', 'italy': '7',
    'jamaica': '10', 'japan': '6', 'jordan': '11', 'kazakhstan': '11', 'kenya': '11', 'kiribati': '14',
    'korea': '6', 'kuwait': '11', 'kyrgyzstan': '11', 'laos': '6', 'latvia': '7', 'lebanon': '11',
    'lesotho': '11', 'liberia': '11', 'libya': '11', 'liechtenstein': '8', 'lithuania': '7',
    'luxembourg': '7', 'macau': '6', 'madagascar': '11', 'malawi': '11', 'malaysia': '6', 'maldives': '6',
    'mali': '11', 'malta': '11', 'martinique': '10', 'mauritania': '11', 'mauritius': '11', 'mexico': '10',
    'moldova': '11', 'monaco': '7', 'mongolia': '6', 'montenegro': '11', 'morocco': '11',
    'mozambique': '11', 'myanmar': '6', 'namibia': '11', 'nepal': '6', 'netherlands': '7', 'new zealand': '14',
    'nicaragua': '10', 'niger': '11', 'nigeria': '11', 'north macedonia': '11', 'norway': '7', 'oman': '11',
    'pakistan': '6', 'palau': '9', 'panama': '10', 'papua new guinea': '14', 'paraguay': '10', 'peru': '10',
    'philippines': '6', 'poland': '7', 'portugal': '8', 'puerto rico': '10', 'qatar': '11', 'reunion': '11',
    'romania': '11', 'russia': '11', 'rwanda': '11', 'saint lucia': '10', 'samoa': '9', 'san marino': '7',
    'sao tome': '11', 'saudi arabia': '11', 'senegal': '11', 'serbia': '11', 'seychelles': '11',
    'sierra leone': '11', 'singapore': '5', 'slovakia': '7', 'slovenia': '11', 'solomon islands': '14',
    'somalia': '11', 'south africa': '11', 'spain': '7', 'sri lanka': '6', 'sudan': '11', 'suriname': '10',
    'sweden': '7', 'switzerland': '7', 'syria': '11', 'taiwan': '6', 'tajikistan': '11', 'tanzania': '11',
    'thailand': '6', 'togo': '11', 'tonga': '14', 'trinidad and tobago': '10', 'tunisia': '11',
    'turkey': '11', 'turkmenistan': '11', 'uganda': '11', 'ukraine': '11', 'united arab emirates': '11',
    'united kingdom': '2', 'united states': '4', 'usa': '4', 'uruguay': '10', 'uzbekistan': '11', 'vanuatu': '14',
    'venezuela': '10', 'vietnam': '6', 'yemen': '11', 'zambia': '11', 'zimbabwe': '11'
}

ZONE_PER_KG = {
    "1": 3529.58, "2": 3603.32, "3": 3883.7, "4": 3052.83, "5": 3915.61, "6": 4137.45, "7": 3261.84,
    "8": 9949.1, "9": 3285.64, "10": 9742.73, "11": 9752.23, "12": 3184.89, "13": 6491.48, "14": 3552.25
}

international_bp = Blueprint("international", __name__, url_prefix="/api/international")

@international_bp.route("/price", methods=["POST"])
def intl_price():
    try:
        data = request.get_json()
        country = data.get("country", "").strip().lower()
        weight = float(data.get("weight", 0.5))
        if not country or weight <= 0:
            return jsonify({"error": "country and positive weight required"}), 400

        zone = COUNTRY_TO_ZONE.get(country)
        if not zone or zone not in ZONE_PER_KG:
            return jsonify({"error": f"Pricing not available for '{country}'"}), 404

        per_kg = ZONE_PER_KG[zone]
        weight_kg = max(1, math.ceil(weight))
        total_price = per_kg * weight_kg
        total_with_tax = round(total_price * 1.18, 2)

        # Apply 30% discount
        final_price = round(total_with_tax * 0.7, 2)


        return jsonify({
            "country": country.title(),
            "zone": f"Zone {zone}",
            "mode": "Express",
            "weight_kg": weight,
            "rounded_weight": weight_kg,
            "price_per_kg": f"₹{per_kg}",
            "total_price": final_price
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
