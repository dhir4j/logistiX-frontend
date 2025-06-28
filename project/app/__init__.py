from flask import Flask, jsonify, render_template_string
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
            <title>Backend 🚚</title>
            <style>
                body {
                    background: linear-gradient(135deg, #152347 0%, #00c6ff 100%);
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
            <h1>Shedload API Server <span class="dot"></span></h1>
            <div class="desc">
                Your courier backend is <b>up & running!</b><br>Visit:
                <code>https://www.shedloadoverseas.com</code>
            </div>
        </body>
        </html>
        """)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(shipments_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(domestic_bp)
    app.register_blueprint(international_bp)

    # Global error handler (for Marshmallow/validation)
    @app.errorhandler(422)
    @app.errorhandler(400)
    def handle_validation_error(err):
        return jsonify({"error": "Invalid input"}), 400

    @app.errorhandler(404)
    def not_found(err):
        return jsonify({"error": "Not found"}), 404

    return app
