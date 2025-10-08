
from flask import Flask, jsonify, render_template_string, request
from .extensions import db, cors
from .auth.routes import auth_bp
from .shipments.routes import shipments_bp
from .admin.routes import admin_bp
from .domestic.routes import domestic_bp
from .international.routes import international_bp
from config import config

def create_app(env="development"):
    app = Flask(__name__)
    app.config.from_object(config[env])

    db.init_app(app)
    cors.init_app(app, origins=app.config.get("CORS_ORIGINS", "*"), supports_credentials=True)

    @app.route("/")
    def index():
        return render_template_string("""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <title>ShedLoad API 🚚</title>
            <style>
                body {
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    overflow: hidden;
                }
                .truck {
                    font-size: 5rem;
                    animation: bounce 2s infinite alternate;
                    margin-bottom: 20px;
                }
                @keyframes bounce {
                    0% { transform: translateY(0);}
                    100% { transform: translateY(-30px);}
                }
                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.3em;
                    letter-spacing: 2px;
                }
                .desc {
                    font-size: 1.1rem;
                    opacity: 0.85;
                }
                .dot {
                    height: 16px;
                    width: 16px;
                    background-color: #22ff88;
                    border-radius: 50%;
                    display: inline-block;
                    margin-left: 8px;
                    box-shadow: 0 0 12px #22ff88;
                    vertical-align: middle;
                    animation: pulse 1.4s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 8px #22ff88;}
                    50% { box-shadow: 0 0 24px #22ff88;}
                    100% { box-shadow: 0 0 8px #22ff88;}
                }
            </style>
        </head>
        <body>
            <div class="truck">🚚</div>
            <h1>ShedLoad API Server <span class="dot"></span></h1>
            <div class="desc">
                Your new courier backend is <b>up & running!</b><br>
            </div>
        </body>
        </html>
        """)

    @app.route("/api/company-details", methods=["GET"])
    def company_details():
        details = {
          "rs_swift": {
            "company_name": "RS Swift Couriers LLP",
            "company_address": "18AX MODEL TOWN EXTENSION LUDHIANA NEAR PUNJAB & SIND BANK",
            "company_city": "LUDHIANA",
            "company_state": "PUNJAB",
            "company_country": "India",
            "company_phone": "+91 8544970282",
            "company_email": "RSSWIFTCOURIERS@GMAIL.COM",
            "company_website": "www.rsswiftcouriers.com",
            "company_gst": "03ABLFR5077L1ZQ"
          },
          "hk_speed": {
            "company_name": "HK SPEED COURIERS",
            "company_address": "SCF-148, FIRST FLOOR, URBAN ESTATE, PHASE-1",
            "company_city": "JALANDHAR",
            "company_state": "PUNJAB",
            "company_country": "India",
            "company_phone": "+91 8968927612",
            "company_email": "Hkspeedcouriersprivatelimited@gmail.com",
            "company_website": "www.hkspeedcouriers.com",
            "company_gst": "03AANCH1234F1Z5"
          }
        }
        return jsonify(details), 200


    @app.route("/api/destination-suggestion", methods=["POST"])
    def destination_suggestion():
        data = request.get_json()
        amount = data.get("amount")

        if amount is None:
            return jsonify({"error": "Amount is required"}), 400
        
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid amount format"}), 400

        with app.test_request_context('/api/domestic/reverse-price', method='POST', json={'amount': amount}):
            if amount < 5000:
                # Call domestic reverse price logic
                from .domestic.routes import reverse_price
                return reverse_price()
            else:
                # Call international reverse price logic
                from .international.routes import reverse_price
                return reverse_price()


    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(shipments_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(domestic_bp)
    app.register_blueprint(international_bp)

    # Global error handler
    @app.errorhandler(422)
    @app.errorhandler(400)
    def handle_validation_error(err):
        # Marshmallow validation errors are often in err.data.messages
        messages = getattr(err, 'data', {}).get('messages', 'Invalid input.')
        return jsonify({"error": messages}), 400

    @app.errorhandler(500)
    def internal_server_error(err):
        db.session.rollback()
        # In a real app, you'd want to log the error
        # import traceback
        # traceback.print_exc()
        return jsonify({"message": "INTERNAL SERVER ERROR"}), 500

    @app.errorhandler(404)
    def not_found(err):
        return jsonify({"error": "Not found"}), 404

    return app
